import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { GenerateDesignDto } from './dto/generate-design.dto';

@Injectable()
export class DesignsService {
  private readonly logger = new Logger(DesignsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private eventsService: EventsService,
    private cache: CacheService,
    private storage: StorageService,
  ) {}

  async generate(userId: string, dto: GenerateDesignDto) {
    // V�rifier le quota
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const FREE_QUOTA = 5;
    const isPremium = user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'pro';

    if (!isPremium && user.aiCredits === 0 && user.monthlyGenerationsUsed >= FREE_QUOTA) {
      return {
        error: 'QUOTA_EXCEEDED',
        message: 'Quota mensuel atteint. Passez Premium pour des g�n�rations illimit�es.',
        creditsAvailable: user.aiCredits,
        upgradeUrl: '/abonnements',
      };
    }

    // Construire le prompt
    const prompt = dto.mode === 'free_prompt'
      ? dto.freePrompt
      : this.buildPrompt(dto);

    this.logger.log(`Generation IA pour user ${userId} : ${prompt}`);

    // G�n�rer les images via Replicate
    const images = await this.callReplicateApi(prompt);

    // Calculer la date d'expiration (24h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

  // Les images sont déjà uploadées sur MinIO dans callReplicateApi
  const uploadedImages = images;

const design = await this.prisma.design.create({
  data: {
    userId,
    name: 'Mon design',
    generationMode: dto.mode,
    promptJson: dto as any,
    freePrompt: dto.freePrompt,
    generatedImages: uploadedImages,  // ← URLs MinIO au lieu de base64
    aiModelVersion: 'stable-diffusion-xl-v1',
    expiresAt,
    isSaved: false,
  },
});

    // D�cr�menter le quota si n�cessaire
    if (!isPremium) {
      if (user.aiCredits > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { aiCredits: { decrement: 1 } },
        });
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { monthlyGenerationsUsed: { increment: 1 } },
        });
      }
    }

    // �mettre l'�v�nement
    await this.eventsService.emit('design_generated', userId, {
      design_id: design.id,
      mode: dto.mode,
      prompt: prompt.substring(0, 100),
    });

    return {
      designId: design.id,
      images: design.generatedImages,
      prompt,
      expiresAt: design.expiresAt,
    };
  }

  async findAll(userId: string, page = 1, limit = 20) {
  const cacheKey = `designs:user:${userId}:${page}:${limit}`;

  return this.cache.getOrSet(
    cacheKey,
    async () => {
      const skip = (page - 1) * limit;
      const [designs, total] = await Promise.all([
        this.prisma.design.findMany({
          where: { userId, isSaved: true },
          orderBy: { createdAt: 'desc' },
          skip, take: limit,
          select: {
            id: true, name: true, status: true,
            thumbnailUrl: true, selectedImageUrl: true,
            promptJson: true, createdAt: true, userRating: true,
          },
        }),
        this.prisma.design.count({ where: { userId, isSaved: true } }),
      ]);
      return { data: designs, total, page, totalPages: Math.ceil(total / limit) };
    },
    120, // TTL : 2 minutes
  );
}

  async findOne(id: string, userId: string) {
    const design = await this.prisma.design.findUnique({ where: { id } });
    if (!design) throw new NotFoundException('Design non trouv�');
    if (design.userId !== userId) throw new ForbiddenException('Acc�s refus�');
    return design;
  }

  async update(id: string, userId: string, data: any) {
  const design = await this.findOne(id, userId);
  const isTrainingEligible = data.userRating >= 4 ? true : design.isTrainingEligible;
  const updated = await this.prisma.design.update({
    where: { id },
    data: { ...data, isTrainingEligible },
  });
  // Invalider le cache
  await this.cache.delPattern(`designs:user:${userId}:*`);
  if (data.userRating) {
    await this.eventsService.emit('design_rated', userId, {
      design_id: id, rating: data.userRating, is_training_eligible: isTrainingEligible,
    });
  }
  return updated;
}

async remove(id: string, userId: string) {
  await this.findOne(id, userId);
  await this.prisma.design.delete({ where: { id } });
  await this.cache.delPattern(`designs:user:${userId}:*`);
  return { message: 'Design supprime' };
}

  async select(id: string, userId: string, selectedImageUrl: string) {
    const design = await this.update(id, userId, {
      selectedImageUrl,
      isSaved: true,
      status: 'draft',
    });

    await this.eventsService.emit('design_selected', userId, {
      design_id: id,
      selected_image: selectedImageUrl,
    });

    return design;
  }

private buildPrompt(dto: GenerateDesignDto): string {
  const lines: string[] = [];

  // Instruction principale très directe
  lines.push('FASHION DESIGN ILLUSTRATION: Generate a professional, detailed fashion design sketch on a clean white background.');

  // Genre en premier — très important pour le modèle
  if (dto.gender === 'homme') {
    lines.push('TARGET: Menswear design for a male figure.');
  } else if (dto.gender === 'femme') {
    lines.push('TARGET: Womenswear design for a female figure.');
  } else if (dto.gender === 'non-binaire') {
    lines.push('TARGET: Gender-neutral clothing design.');
  }

  // Type de vêtement — central
  if (dto.type) {
    lines.push(`GARMENT TYPE: ${dto.type}.`);
  }

  // Style
  if (dto.style) {
    lines.push(`AESTHETIC STYLE: ${dto.style}.`);
  }

  // Couleurs avec codes hex — très précis
  if (dto.colors?.length) {
    const colorDesc = (dto.colors as any[])
      .map((c: any) => {
        if (typeof c === 'string') return c;
        return c.name ? `${c.name} (hex: ${c.hex})` : c.hex;
      })
      .join(', ');
    lines.push(`EXACT COLORS TO USE: ${colorDesc}. Use these colors precisely.`);
  }

  // Tissu
  if (dto.fabric) {
    lines.push(`FABRIC MATERIAL: ${dto.fabric} with realistic texture rendering.`);
  }

  // Coupe
  if (dto.cut) {
    lines.push(`SILHOUETTE CUT: ${dto.cut}.`);
  }

  // Longueur
  if (dto.length) {
    lines.push(`GARMENT LENGTH: ${dto.length}.`);
  }

  // Manches
  if (dto.sleeves) {
    lines.push(`SLEEVES: ${dto.sleeves}.`);
  }

  // Encolure
  if (dto.neckline) {
    lines.push(`NECKLINE: ${dto.neckline}.`);
  }

  // Fermeture
  if (dto.closure) {
    lines.push(`CLOSURE: ${dto.closure}.`);
  }

  // Motifs
  if (dto.pattern) {
    lines.push(`PATTERN: ${dto.pattern} pattern throughout the fabric.`);
  }

  // Ornements
  if (dto.ornaments?.length) {
    lines.push(`DECORATIVE ELEMENTS: ${dto.ornaments.join(', ')}.`);
  }

  // Finitions
  if (dto.finishing) {
    lines.push(`FINISHING DETAILS: ${dto.finishing}.`);
  }

  // Occasion
  if (dto.occasion) {
    lines.push(`OCCASION: Designed for ${dto.occasion}.`);
  }

  // Saison
  if (dto.season) {
    lines.push(`SEASON: ${dto.season} collection.`);
  }

  // Inspiration culturelle
  if (dto.inspiration) {
    lines.push(`CULTURAL INSPIRATION: ${dto.inspiration} aesthetic.`);
  }

  // Silhouette
  if (dto.silhouette) {
    lines.push(`OVERALL VIBE: ${dto.silhouette}.`);
  }

  // Morphologie
  if (dto.morphology) {
    const m = dto.morphology;
    const morphParts: string[] = [];
    if (m.standardSize) morphParts.push(`size ${m.standardSize}`);
    if (m.height) morphParts.push(`height ${m.height}cm`);
    if (m.bust && m.waist && m.hips) {
      morphParts.push(`measurements: bust ${m.bust}cm, waist ${m.waist}cm, hips ${m.hips}cm`);
    }
    if (morphParts.length > 0) {
      lines.push(`BODY PROPORTIONS: ${morphParts.join(', ')}.`);
    }
  }

  // Instructions qualité finales
  lines.push('RENDERING REQUIREMENTS: Ultra-high quality fashion illustration, 8K resolution, sharp details, realistic fabric texture, professional fashion photography lighting, full outfit visible from head to toe, neutral white/light grey background, no text or watermarks.');

  return lines.join(' ');
}

private async callReplicateApi(prompt: string): Promise<string[]> {
  const apiKey = this.config.get('GOOGLE_AI_API_KEY');

  if (!apiKey) {
    this.logger.warn('Pas de clé Google AI — utilisation des images placeholder');
    return [
      'https://placehold.co/512x512/7C3AED/white?text=Design+1',
      'https://placehold.co/512x512/7C3AED/white?text=Design+2',
      'https://placehold.co/512x512/7C3AED/white?text=Design+3',
      'https://placehold.co/512x512/7C3AED/white?text=Design+4',
    ];
  }

  try {
    this.logger.log('Generation via Google Gemini...');

    const fashionPrompt = `${prompt}, fashion photography, professional clothing design, high quality, detailed fabric texture, white background, full outfit view`;

    // Générer 4 images en parallèle
    const requests = Array.from({ length: 4 }, () =>
      fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: fashionPrompt }]
            }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
            },
          }),
        }
      )
    );

    const responses = await Promise.all(requests);
    const imageUrls: string[] = [];

    for (const response of responses) {
      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Google Gemini error: ${response.status} ${error}`);
        continue;
      }

      const data = await response.json();

      for (const candidate of data.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            const url = await this.storage.uploadImage(
              `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              'designs',
            );
            imageUrls.push(url);
          }
        }
      }
    }

    if (imageUrls.length === 0) throw new Error('Aucune image generee');

    this.logger.log(`${imageUrls.length} images generees avec succes`);
    return imageUrls;

  } catch (error) {
    this.logger.error('Erreur Google Gemini API', error.message);
    return [
      'https://placehold.co/512x512/7C3AED/white?text=Design+1',
      'https://placehold.co/512x512/7C3AED/white?text=Design+2',
      'https://placehold.co/512x512/7C3AED/white?text=Design+3',
      'https://placehold.co/512x512/7C3AED/white?text=Design+4',
    ];
  }
}
}
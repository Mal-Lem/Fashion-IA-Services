import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateCouturiereProfileDto, UpdateCouturiereProfileDto, SearchCouturieresDto } from './dto/couturiere.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CouturieresService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
    private cache: CacheService, 
  ) {}
// @Injectable()
// export class CouturieresService {
//   private readonly logger = new Logger(CouturieresService.name);

//   constructor(
//     private prisma: PrismaService,
//     private eventsService: EventsService,
//   ) {}

  async createProfile(userId: string, dto: CreateCouturiereProfileDto) {
    const existing = await this.prisma.couturiereProfile.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Un profil couturiere existe deja pour ce compte');

    const profile = await this.prisma.couturiereProfile.create({
      data: {
        userId,
        atelierName: dto.atelierName,
        bio: dto.bio,
        siret: dto.siret,
        specialties: dto.specialties,
        experienceYears: dto.experienceYears,
        locationCity: dto.locationCity,
        locationRegion: dto.locationRegion,
        locationZip: dto.locationZip,
        pricingMin: dto.pricingMin,
        pricingMax: dto.pricingMax,
        languages: dto.languages || ['fr'],
      },
    });

    const completionPct = this.calculateCompletion(profile);
    return this.prisma.couturiereProfile.update({
      where: { id: profile.id },
      data: {
        profileCompletionPct: completionPct,
        isVisible: completionPct >= 60,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateCouturiereProfileDto) {
  const profile = await this.prisma.couturiereProfile.findUnique({ where: { userId } });
  if (!profile) throw new NotFoundException('Profil non trouvé');

  const updated = await this.prisma.couturiereProfile.update({
    where: { userId },
    data: {
      ...(dto.atelierName && { atelierName: dto.atelierName }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.specialties && { specialties: dto.specialties }),
      ...(dto.availabilityStatus && { availabilityStatus: dto.availabilityStatus as any }),
      ...(dto.locationCity && { locationCity: dto.locationCity }),
      ...(dto.locationRegion && { locationRegion: dto.locationRegion }),
      ...(dto.locationZip && { locationZip: dto.locationZip }),
      ...((dto.minPriceEur || dto.pricingMin) && { pricingMin: dto.minPriceEur || dto.pricingMin }),
      ...((dto.maxPriceEur || dto.pricingMax) && { pricingMax: dto.maxPriceEur || dto.pricingMax }),
      isVisible : true,
    },
  });

  await this.cache.delPattern('couturieres:*');
  return updated;
}

 

 async search(dto: SearchCouturieresDto, requestingUserId?: string) {
  const page = Number(dto.page) || 1;
  const limit = Number(dto.limit) || 12;
  const skip = (page - 1) * limit;

  // Clé de cache basée sur les paramètres
  const cacheKey = `couturieres:search:${JSON.stringify(dto)}`;

  const result = await this.cache.getOrSet(
    cacheKey,
    async () => {
      const where: any = { isVisible: true };

// Région
if (dto.region) {
  where.locationRegion = { contains: dto.region, mode: 'insensitive' };
}

// Spécialité — cherche dans le tableau
if (dto.specialty) {
  where.specialties = { has: dto.specialty };
}

// Budget — la couturière est visible si son prix min est <= budget max
// ET son prix max est >= budget min
if (dto.maxPrice) {
  where.pricingMin = { lte: Number(dto.maxPrice) };
}
if (dto.minPrice) {
  where.pricingMax = { gte: Number(dto.minPrice) };
}

// Note minimum
if (dto.minRating) {
  where.avgRating = { gte: Number(dto.minRating) };
}
      const [couturieres, total] = await Promise.all([
        this.prisma.couturiereProfile.findMany({
          where, skip, take: limit,
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: [{ avgRating: 'desc' }, { reviewCount: 'desc' }, { profileCompletionPct: 'desc' }],
        }),
        this.prisma.couturiereProfile.count({ where }),
      ]);

      const scored = couturieres.map(c => {
        let score = 0;
        score += ((Number(c.avgRating) || 0) / 5) * 40;
        if (c.availabilityStatus === 'available') score += 20;
        else if (c.availabilityStatus === 'on_request') score += 10;
        score += (c.profileCompletionPct / 100) * 20;
        score += Math.min(c.reviewCount / 10, 1) * 20;
        if (c.isCertified) score += 10;
        return { ...c, matchScore: Math.round(score) };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      return { data: scored, total, page, totalPages: Math.ceil(total / limit) };
    },
    300, // TTL : 5 minutes
  );

  // Émettre l'événement (hors cache)
  if (requestingUserId && dto.designId) {
    await this.eventsService.emit('couturiere_viewed', requestingUserId, {
      design_id: dto.designId,
      results_count: result.total,
    });
  }

  return result;
}

  async findOne(id: string, requestingUserId?: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) throw new NotFoundException('Profil couturiere non trouve');

  const cacheKey = `couturieres:profile:${id}`;

  const profile = await this.cache.getOrSet(
    cacheKey,
    async () => {
      const p = await this.prisma.couturiereProfile.findUnique({
        where: { id },
        include: { user: { select: { firstName: true, lastName: true, avatarUrl: true, createdAt: true } } },
      });
      if (!p) throw new NotFoundException('Profil couturiere non trouve');
      const reviews = await this.prisma.review.findMany({
        where: { revieweeId: p.userId, isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { reviewer: { select: { firstName: true } } },
      });
      return { ...p, reviews };
    },
    600, // TTL : 10 minutes
  );

  if (requestingUserId) {
    await this.eventsService.emit('couturiere_viewed', requestingUserId, { couturiere_id: id });
  }

  return profile;
}

  async getMyProfile(userId: string) {
  let profile = await this.prisma.couturiereProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { firstName: true, lastName: true, avatarUrl: true, email: true }
      }
    }
  });

  // Si pas de profil, en créer un vide automatiquement
  if (!profile) {
    profile = await this.prisma.couturiereProfile.create({
      data: {
        userId,
        atelierName: '',
        specialties: [],
        portfolioPhotos: [],
        locationCity: '',
        locationRegion: '',
        locationZip: '',
        isVisible : true,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true, email: true }
        }
      }
    });
  }

  return profile;
}

  private calculateCompletion(profile: any): number {
    const fields = [
      profile.atelierName,
      profile.bio,
      profile.specialties?.length > 0,
      profile.locationCity,
      profile.locationRegion,
      profile.pricingMin,
      profile.portfolioPhotos?.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }
}
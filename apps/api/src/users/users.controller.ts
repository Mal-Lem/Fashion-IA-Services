import { Controller, Get, Patch, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@ApiTags('users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  @ApiOperation({ summary: 'Mon profil complet' })
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user['id'] },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatarUrl: true, gender: true,
        morphologyJson: true, preferencesJson: true,
        subscriptionStatus: true, aiCredits: true,
        monthlyGenerationsUsed: true, createdAt: true,
      },
    });
    return user;
  }

  @ApiOperation({ summary: 'Modifier la photo de profil' })
  @ApiConsumes('multipart/form-data')
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Seules les images sont acceptees'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async updateAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user['id'];
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const url = await this.storage.uploadImage(base64, 'portfolios', `avatars/${userId}.jpg`);
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });
    return { avatarUrl: url, message: 'Photo de profil mise a jour' };
  }

  @ApiOperation({ summary: 'Sauvegarder le mannequin numerique' })
  @Patch('me/morphology')
  async updateMorphology(@Req() req: Request, @Body() body: any) {
    const user = await this.prisma.user.update({
      where: { id: req.user['id'] },
      data: {
        gender: body.gender,
        morphologyJson: body.morphology || {},
      },
      select: { id: true, gender: true, morphologyJson: true },
    });
    return { message: 'Mannequin mis a jour', ...user };
  }

  @ApiOperation({ summary: 'Mettre a jour les preferences' })
  @Patch('me/preferences')
  async updatePreferences(@Req() req: Request, @Body() body: any) {
    const user = await this.prisma.user.update({
      where: { id: req.user['id'] },
      data: { preferencesJson: body },
      select: { id: true, preferencesJson: true },
    });
    return { message: 'Preferences mises a jour', ...user };
  }
  @ApiOperation({ summary: 'Ajouter une photo au portfolio couturière' })
  @ApiConsumes('multipart/form-data')
  @Post('me/portfolio')
  @UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont acceptees'), false);
    } else {
      cb(null, true);
    }
  },
}))
async addPortfolioPhoto(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
  const userId = req.user['id'];
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  
  // Nom unique pour chaque photo
  const filename = `portfolios/${userId}/${Date.now()}.jpg`;
  const url = await this.storage.uploadImage(base64, 'portfolios', filename);

  // Ajouter l'URL au profil couturière
  const profile = await this.prisma.couturiereProfile.findUnique({ where: { userId } });
  if (profile) {
    const photos = [...(profile.portfolioPhotos as string[]), url];
    await this.prisma.couturiereProfile.update({
      where: { userId },
      data: { portfolioPhotos: photos },
    });
  }

  return { url, message: 'Photo ajoutée au portfolio' };
}
}
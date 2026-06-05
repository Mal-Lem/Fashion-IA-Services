import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    // Convertir en base64 pour MinIO
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Uploader sur MinIO dans un bucket avatars
    const url = await this.storage.uploadImage(base64, 'portfolios', `avatars/${userId}.jpg`);

    // Mettre à jour en base
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    return url;
  }
}
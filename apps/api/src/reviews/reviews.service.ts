import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getPublic() {
    return this.prisma.review.findMany({
      where: { isApprovedForHome: true, isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        reviewee: {
          select: {
            couturiereProfile: { select: { atelierName: true } },
          },
        },
      },
    });
  }

  async create(userId: string, orderId: string, rating: number, comment?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, clientId: userId, status: 'completed' },
    });
    if (!order) throw new BadRequestException('Commande non trouvée ou non terminée');

    const existing = await this.prisma.review.findUnique({
      where: { orderId },
    });
    if (existing) throw new BadRequestException('Un avis existe déjà pour cette commande');

    return this.prisma.review.create({
      data: {
        orderId,
        reviewerId: userId,
        revieweeId: order.couturiereId,
        rating,
        comment,
        isVisible: true,
        isApprovedForHome: false,
      },
    });
  }

  async approve(reviewId: string, approved: boolean) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApprovedForHome: approved },
    });
  }

  async getPending() {
    return this.prisma.review.findMany({
      where: { isApprovedForHome: false, isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        reviewee: {
          select: {
            couturiereProfile: { select: { atelierName: true } },
          },
        },
      },
    });
  }
}

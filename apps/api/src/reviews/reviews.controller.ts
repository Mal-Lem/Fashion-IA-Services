import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  // GET /v1/reviews/public — avis approuvés pour la page d'accueil
  @Get('public')
  async getPublicReviews() {
    return this.prisma.review.findMany({
      where: { isApprovedForHome: true, isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        reviewee: {
          select: {
            couturiereProfile: { select: { atelierName: true } }
          }
        },
      },
    });
  }

  // POST /v1/reviews — soumettre un avis
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Req() req: Request, @Body() body: {
    orderId: string;
    rating: number;
    comment?: string;
  }) {
    const userId = req.user['id'];

    // Vérifier que la commande appartient au client
    const order = await this.prisma.order.findFirst({
      where: { id: body.orderId, clientId: userId, status: 'completed' },
    });
    if (!order) throw new Error('Commande non trouvée ou non terminée');

    // Vérifier qu'un avis n'existe pas déjà
    const existing = await this.prisma.review.findUnique({
      where: { orderId: body.orderId },
    });
    if (existing) throw new Error('Un avis existe déjà pour cette commande');

    return this.prisma.review.create({
      data: {
        orderId: body.orderId,
        reviewerId: userId,
        revieweeId: order.couturiereId,
        rating: body.rating,
        comment: body.comment,
        isVisible: true,
        isApprovedForHome: false,
      },
    });
  }

  // PATCH /v1/reviews/:id/approve — admin approuve pour la page d'accueil
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approveReview(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { approved: boolean }
  ) {
    if (req.user['role'] !== 'admin') throw new Error('Accès refusé');

    return this.prisma.review.update({
      where: { id },
      data: { isApprovedForHome: body.approved },
    });
  }

  // GET /v1/reviews/pending — admin voit les avis en attente
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingReviews(@Req() req: Request) {
    if (req.user['role'] !== 'admin') throw new Error('Accès refusé');

    return this.prisma.review.findMany({
      where: { isApprovedForHome: false, isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { firstName: true, lastName: true, avatarUrl: true } },
        reviewee: {
          select: {
            couturiereProfile: { select: { atelierName: true } }
          }
        },
      },
    });
  }
}
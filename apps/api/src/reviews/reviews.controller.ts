import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('public')
  async getPublicReviews() {
    return this.reviewsService.getPublic();
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Req() req: Request, @Body() body: {
    orderId: string;
    rating: number;
    comment?: string;
  }) {
    return this.reviewsService.create(req.user['id'], body.orderId, body.rating, body.comment);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approveReview(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { approved: boolean },
  ) {
    if (req.user['role'] !== 'admin') throw new ForbiddenException('Accès refusé');
    return this.reviewsService.approve(id, body.approved);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingReviews(@Req() req: Request) {
    if (req.user['role'] !== 'admin') throw new ForbiddenException('Accès refusé');
    return this.reviewsService.getPending();
  }
}
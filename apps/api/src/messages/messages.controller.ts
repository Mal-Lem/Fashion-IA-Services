import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Mes conversations' })
  @Get()
  async getConversations(@Req() req: Request) {
    return this.messagesService.getConversations(req.user['id']);
  }

  @ApiOperation({ summary: "Messages d'une conversation" })
  @Get(':orderId')
  async getMessages(
    @Param('orderId') orderId: string,
    @Req() req: Request,
    @Query('limit') limit = 50,
  ) {
    return this.messagesService.getMessages(orderId, req.user['id'], +limit);
  }

  @ApiOperation({ summary: 'Envoyer un message' })
  @Post(':orderId')
  async sendMessage(
    @Param('orderId') orderId: string,
    @Req() req: Request,
    @Body() body: { content: string; attachmentUrl?: string },
  ) {
    return this.messagesService.sendMessage(orderId, req.user['id'], body.content, body.attachmentUrl);
  }
}
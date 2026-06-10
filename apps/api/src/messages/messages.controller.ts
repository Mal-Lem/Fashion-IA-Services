import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
    private storage: StorageService,
  ) {}

  @ApiOperation({ summary: 'Mes conversations' })
  @Get()
  async getConversations(@Req() req: Request) {
    const conversations = await this.messagesService.getConversations(req.user['id']);
    return conversations.map(c => ({
      ...c,
      partner: {
        ...c.partner,
        isOnline: this.messagesGateway.isUserOnline(c.partner?.id),
      },
    }));
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

  @ApiOperation({ summary: 'Upload une image pour un message' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Seules les images sont acceptees'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadAttachment(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const url = await this.storage.uploadImage(base64, 'designs', `messages/${Date.now()}.jpg`);
    return { url };
  }

  @ApiOperation({ summary: 'Envoyer un message' })
  @Post(':orderId')
  async sendMessage(
    @Param('orderId') orderId: string,
    @Req() req: Request,
    @Body() body: { content: string; attachmentUrls?: string[] },
  ) {
    const message = await this.messagesService.sendMessage(orderId, req.user['id'], body.content, body.attachmentUrls);
    this.messagesGateway.broadcastToConversation(orderId, 'new_message', message);
    return message;
  }
}
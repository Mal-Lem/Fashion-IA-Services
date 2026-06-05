import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  // Lister les conversations d'un utilisateur
  async getConversations(userId: string) {
    // Trouver toutes les commandes où l'utilisateur est client ou couturière
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { clientId: userId },
          { couturiere: { userId } },
        ],
      },
      include: {
        design: { select: { name: true, selectedImageUrl: true, thumbnailUrl: true } },
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        couturiere: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return orders.map(order => {
      const lastMessage = order.messages[0];
      const isClient = order.clientId === userId;
      const partner = isClient ? order.couturiere.user : order.client;

      return {
        orderId: order.id,
        status: order.status,
        design: order.design,
        partner,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isSystem: lastMessage.isSystem,
        } : null,
      };
    });
  }

  // Charger les messages d'une conversation
  async getMessages(orderId: string, userId: string, limit = 50) {
    // Vérifier l'accès
    await this.checkAccess(orderId, userId);

    const messages = await this.prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } },
      },
    });

    // Marquer les messages comme lus
    await this.prisma.message.updateMany({
      where: {
        orderId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return messages;
  }

  // Envoyer un message
  async sendMessage(orderId: string, senderId: string, content: string, attachmentUrl?: string) {
    await this.checkAccess(orderId, senderId);

    const message = await this.prisma.message.create({
      data: {
        orderId,
        senderId,
        messageType: attachmentUrl ? 'image' : 'text',
        content,
        attachmentUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } },
      },
    });

    // Émettre l'événement data
    await this.eventsService.emit('message_sent', senderId, {
      order_id: orderId,
      message_id: message.id,
    });

    return message;
  }

  // Vérifier que l'utilisateur a accès à la conversation
  async checkAccess(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { couturiere: { select: { userId: true } } },
    });

    if (!order) throw new NotFoundException('Conversation non trouvee');

    const isClient = order.clientId === userId;
    const isCouturiere = order.couturiere.userId === userId;

    if (!isClient && !isCouturiere) {
      throw new ForbiddenException('Acces refuse a cette conversation');
    }

    return order;
  }
}
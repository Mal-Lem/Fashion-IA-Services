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

  async getConversations(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { clientId: userId },
          { couturiere: { userId } },
        ],
      },
      include: {
        design: { select: { name: true, selectedImageUrl: true } },
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, lastSeenAt: true } },
        couturiere: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, lastSeenAt: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });

    const orderIds = orders.map(o => o.id);
    const unreadCounts = orderIds.length > 0 ? await this.prisma.message.groupBy({
      by: ['orderId'],
      where: {
        orderId: { in: orderIds },
        senderId: { not: userId },
        readAt: null,
      },
      _count: { id: true },
    }) : [];
    const unreadMap = new Map(unreadCounts.map(r => [r.orderId, r._count.id]));

    return orders.map(order => {
      const lastMessage = order.messages[0];
      const isClient = order.clientId === userId;
      const partner = isClient ? order.couturiere.user : order.client;

      return {
        orderId: order.id,
        status: order.status,
        design: order.design,
        partner,
        unreadCount: unreadMap.get(order.id) || 0,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isSystem: lastMessage.isSystem,
          attachmentUrls: lastMessage.attachmentUrls,
        } : null,
      };
    });
  }

  async getMessages(orderId: string, userId: string, limit = 50) {
    await this.checkAccess(orderId, userId);

    const messages = await this.prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } },
      },
    });

    await this.prisma.message.updateMany({
      where: {
        orderId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return messages.reverse();
  }

  // Envoyer un message
  async sendMessage(orderId: string, senderId: string, content: string, attachmentUrls?: string[]) {
    await this.checkAccess(orderId, senderId);

    const message = await this.prisma.message.create({
      data: {
        orderId,
        senderId,
        messageType: attachmentUrls?.length ? 'image' : 'text',
        content,
        attachmentUrls: attachmentUrls || [],
      },
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } },
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { lastMessageAt: new Date() },
    });

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
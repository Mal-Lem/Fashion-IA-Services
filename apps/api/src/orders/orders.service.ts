import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async create(clientId: string, dto: CreateOrderDto) {
    if (!dto.designId && !dto.description) {
      throw new BadRequestException('Fournissez un design ou une description');
    }

    let designName = 'Commande';
    if (dto.designId) {
      const design = await this.prisma.design.findUnique({ where: { id: dto.designId } });
      if (!design) throw new NotFoundException('Design non trouve');
      if (design.userId !== clientId) throw new ForbiddenException('Ce design ne vous appartient pas');
      designName = design.name;
    }

    const couturiere = await this.prisma.couturiereProfile.findUnique({
      where: { id: dto.couturiereId },
      include: { user: { select: { id: true, firstName: true, email: true } } },
    });
    if (!couturiere) throw new NotFoundException('Couturiere non trouvee');
    if (couturiere.availabilityStatus === 'busy') {
      throw new BadRequestException('Cette couturiere nest pas disponible actuellement');
    }

    const order = await this.prisma.order.create({
      data: {
        designId: dto.designId || null,
        clientId,
        couturiereId: dto.couturiereId,
        description: dto.description,
        clientMessage: dto.clientMessage,
        status: 'pending',
      },
      include: {
        design: { select: { id: true, name: true, selectedImageUrl: true } },
        couturiere: { select: { atelierName: true, locationCity: true } },
      },
    });

    const messageContent = dto.description
      ? `Nouvelle demande : ${dto.description}`
      : `Nouvelle demande de realisation avec le design "${designName}"`;

    await this.prisma.message.create({
      data: {
        orderId: order.id,
        senderId: clientId,
        messageType: 'system',
        isSystem: true,
        content: messageContent,
      },
    });

    await this.eventsService.emit('order_requested', clientId, {
      order_id: order.id,
      design_id: dto.designId,
      couturiere_id: dto.couturiereId,
    });

    this.logger.log(`Commande creee : ${order.id}`);
    return order;
  }

  async findAll(userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = role === 'couturiere'
      ? { couturiere: { userId } }
      : { clientId: userId };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          design: { select: { id: true, name: true, selectedImageUrl: true, thumbnailUrl: true } },
          client: { select: { firstName: true, lastName: true, avatarUrl: true } },
          couturiere: { select: { atelierName: true, locationCity: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        design: true,
        client: { select: { firstName: true, lastName: true, avatarUrl: true } },
        couturiere: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { sender: { select: { firstName: true, avatarUrl: true } } },
        },
      },
    });

    if (!order) throw new NotFoundException('Commande non trouvee');

    // Vérifier que l'utilisateur est le client ou la couturière
    const isCouturiere = order.couturiere.userId === userId;
    const isClient = order.clientId === userId;
    if (!isCouturiere && !isClient) throw new ForbiddenException('Acces refuse');

    return order;
  }

  async updateStatus(id: string, userId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { couturiere: true },
    });

    if (!order) throw new NotFoundException('Commande non trouvee');

    const isCouturiere = order.couturiere.userId === userId;
    const isClient = order.clientId === userId;

    // Vérifier les permissions selon le statut
    if (dto.status === 'accepted' || dto.status === 'refused') {
      if (!isCouturiere) throw new ForbiddenException('Seule la couturiere peut accepter ou refuser');
    }

    if (dto.status === 'cancelled') {
      if (!isClient) throw new ForbiddenException('Seul le client peut annuler');
    }

    if (dto.status === 'completed') {
      if (!isCouturiere && !isClient) throw new ForbiddenException('Acces refuse');
    }

    // Calculer la commission (13%)
    let commissionAmount = null;
    let netAmount = null;
    if (dto.agreedAmount) {
      commissionAmount = Math.round(dto.agreedAmount * 0.13);
      netAmount = dto.agreedAmount - commissionAmount;
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status as any,
        couturiereMessage: dto.couturiereMessage,
        refusalReason: dto.refusalReason,
        agreedAmount: dto.agreedAmount,
        commissionAmount,
        netAmount,
        completedAt: dto.status === 'completed' ? new Date() : undefined,
      },
    });

    // Message système automatique
    const statusMessages: Record<string, string> = {
      accepted: 'La couturiere a accepte votre demande',
      refused: 'La couturiere a refuse votre demande',
      in_progress: 'La realisation est en cours',
      completed: 'La commande est terminee',
      cancelled: 'La commande a ete annulee',
    };

    await this.prisma.message.create({
      data: {
        orderId: id,
        senderId: userId,
        messageType: 'system',
        isSystem: true,
        content: statusMessages[dto.status] || `Statut mis a jour : ${dto.status}`,
      },
    });

    // Émettre l'événement
    await this.eventsService.emit('order_status_changed', userId, {
      order_id: id,
      old_status: order.status,
      new_status: dto.status,
    });

    return updated;
  }
}
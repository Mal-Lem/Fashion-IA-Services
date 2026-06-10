import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).includes(userId);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.connectedUsers.set(client.id, payload.sub);
      this.logger.log(`Client connecte : ${client.id} (user: ${payload.sub})`);
    } catch (err) {
      this.logger.warn(`Tentative connexion WebSocket échouée — token invalide (IP: ${client.handshake.address})`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      }).catch(() => {});
    }
    this.logger.log(`Client deconnecte : ${client.id}`);
  }

  // Rejoindre une conversation
  @SubscribeMessage('join_conversation')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { orderId: string }) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      await this.messagesService.checkAccess(data.orderId, userId);
      client.join(`order_${data.orderId}`);
      client.emit('joined', { orderId: data.orderId });
      this.logger.log(`User ${userId} a rejoint la conversation ${data.orderId}`);
    } catch (err) {
      this.logger.warn(`Accès refusé conversation ${data.orderId} pour user ${userId}`);
      client.emit('error', { message: 'Accès refusé' });
    }
  }

  // Envoyer un message
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; content: string; attachmentUrls?: string[] },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      const message = await this.messagesService.sendMessage(
        data.orderId,
        userId,
        data.content,
        data.attachmentUrls,
      );

      // Diffuser le message à tous les membres de la conversation
      this.server.to(`order_${data.orderId}`).emit('new_message', message);

      this.logger.log(`Message envoye dans ${data.orderId} par ${userId}`);
    } catch (error) {
      this.logger.error(`Échec envoi message dans ${data.orderId} par ${userId}: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Envoyer un message depuis le service (ex: message système)
  broadcastToConversation(orderId: string, event: string, data: any) {
    this.server.to(`order_${orderId}`).emit(event, data);
  }
}
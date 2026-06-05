import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

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
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
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
    } catch {
      client.emit('error', { message: 'Acces refuse' });
    }
  }

  // Envoyer un message
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; content: string; attachmentUrl?: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      const message = await this.messagesService.sendMessage(
        data.orderId,
        userId,
        data.content,
        data.attachmentUrl,
      );

      // Diffuser le message à tous les membres de la conversation
      this.server.to(`order_${data.orderId}`).emit('new_message', message);

      this.logger.log(`Message envoye dans ${data.orderId} par ${userId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Envoyer un message depuis le service (ex: message système)
  broadcastToConversation(orderId: string, event: string, data: any) {
    this.server.to(`order_${orderId}`).emit(event, data);
  }
}
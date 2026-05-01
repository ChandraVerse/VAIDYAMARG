import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: '*' },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(OrderGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Patient joins a room keyed by their userId so they receive
   * updates only for their own orders.
   */
  @SubscribeMessage('join_user_room')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user_${data.userId}`);
    this.logger.log(`Socket ${client.id} joined room user_${data.userId}`);
  }

  /**
   * Called by AdminOrdersService when an order status changes.
   * Emits 'order_updated' to everyone in the patient's room.
   */
  notifyOrderUpdate(userId: string, orderId: string, status: string) {
    this.server.to(`user_${userId}`).emit('order_updated', { orderId, status });
    this.logger.log(`Emitted order_updated -> user_${userId}: ${orderId} = ${status}`);
  }
}

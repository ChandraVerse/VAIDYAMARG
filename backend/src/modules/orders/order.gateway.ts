import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
    this.logger.log(`WS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS client disconnected: ${client.id}`);
  }

  /**
   * Patient sends { userId } to join their personal room.
   * All order updates for this user are pushed to this room.
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
   * Called by OrdersService whenever an order status changes.
   * Unified method name used consistently across the codebase.
   *
   * Previously named notifyOrderUpdate — renamed to emitOrderUpdate
   * to match orders.service.ts call sites.
   */
  emitOrderUpdate(orderId: string, userId: string, status: string) {
    this.server.to(`user_${userId}`).emit('order_updated', { orderId, status });
    this.logger.log(`[WS] order_updated → user_${userId}: ${orderId} = ${status}`);
  }
}

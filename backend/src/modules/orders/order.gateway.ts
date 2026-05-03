import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger }         from '@nestjs/common';

/**
 * Real-time order tracking gateway.
 *
 * Namespace : /orders
 * Transport : Socket.io (requires IoAdapter in main.ts)
 *
 * ─── Client events (emit from mobile / admin) ───────────────────────────────
 *
 *  join_user_room   { userId: string }
 *    Join room `user_{userId}` — receives ALL order updates for this user.
 *    Use this on the "My Orders" list screen.
 *
 *  join_order_room  { orderId: string }
 *    Join room `order_{orderId}` — receives updates for ONE specific order.
 *    Use this on the "Order Tracking" detail screen.
 *
 *  leave_user_room  { userId: string }   — clean teardown on screen unmount
 *  leave_order_room { orderId: string }  — clean teardown on screen unmount
 *
 * ─── Server events (listen on mobile / admin) ───────────────────────────────
 *
 *  order_updated  { orderId: string; status: string }
 *    Emitted whenever an order status changes (admin panel or partner app).
 */
@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: '*' },
})
export class OrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(OrderGateway.name);

  afterInit() {
    this.logger.log('OrderGateway initialised on namespace /orders');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`WS connected   : ${client.id} (total: ${this.server.sockets.size})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`WS disconnected: ${client.id} (total: ${this.server.sockets.size})`);
  }

  // ─── Room management ────────────────────────────────────────────────────────

  /** Patient subscribes to ALL their order updates ("My Orders" list). */
  @SubscribeMessage('join_user_room')
  handleJoinUser(
    @MessageBody()    data:   { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user_${data.userId}`;
    client.join(room);
    this.logger.log(`[join] ${client.id} → ${room}`);
    return { event: 'joined', room };
  }

  /** Patient subscribes to ONE specific order ("Order Tracking" screen). */
  @SubscribeMessage('join_order_room')
  handleJoinOrder(
    @MessageBody()    data:   { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order_${data.orderId}`;
    client.join(room);
    this.logger.log(`[join] ${client.id} → ${room}`);
    return { event: 'joined', room };
  }

  /** Leave user room (call on screen unmount to avoid stale listeners). */
  @SubscribeMessage('leave_user_room')
  handleLeaveUser(
    @MessageBody()    data:   { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `user_${data.userId}`;
    client.leave(room);
    this.logger.log(`[leave] ${client.id} ← ${room}`);
    return { event: 'left', room };
  }

  /** Leave order room (call on screen unmount). */
  @SubscribeMessage('leave_order_room')
  handleLeaveOrder(
    @MessageBody()    data:   { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order_${data.orderId}`;
    client.leave(room);
    this.logger.log(`[leave] ${client.id} ← ${room}`);
    return { event: 'left', room };
  }

  // ─── Emit ────────────────────────────────────────────────────────────────────

  /**
   * Called by OrdersService and AdminOrdersService whenever an order
   * status changes. Broadcasts to both rooms simultaneously:
   *   - user_{userId}   → "My Orders" list screen
   *   - order_{orderId} → "Order Tracking" detail screen
   */
  emitOrderUpdate(orderId: string, userId: string, status: string) {
    const payload = { orderId, status, updatedAt: new Date().toISOString() };
    this.server.to(`user_${userId}`).emit('order_updated', payload);
    this.server.to(`order_${orderId}`).emit('order_updated', payload);
    this.logger.log(`[emit] order_updated → user_${userId} + order_${orderId} | status=${status}`);
  }
}

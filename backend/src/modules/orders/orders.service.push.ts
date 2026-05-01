/**
 * orders.service.push.ts  —  INTEGRATION GUIDE
 *
 * This file documents exactly which calls to add to OrdersService
 * so that every order status change fires an FCM push notification.
 *
 * ─── 1. Inject dependencies in OrdersService constructor ─────────────────────
 *
 *   constructor(
 *     private readonly prisma: PrismaService,
 *     private readonly notifications: NotificationsService,   // ADD
 *     private readonly remindersScheduler: RemindersScheduler, // ADD
 *   ) {}
 *
 * ─── 2. Import the enum ───────────────────────────────────────────────────────
 *
 *   import { NotificationsService, NotificationType } from
 *     '../notifications/notifications.service';
 *   import { RemindersScheduler } from
 *     '../notifications/reminders.scheduler';
 *
 * ─── 3. After order CREATE (placeOrder / createOrder) ─────────────────────────
 *
 *   await this.notifications.send(userId, NotificationType.ORDER_PLACED, {
 *     orderId: order.id,
 *     amount:  order.totalAmount,
 *   });
 *
 * ─── 4. In updateOrderStatus() — add a status → type map ─────────────────────
 *
 *   const STATUS_TO_NOTIF: Partial<Record<OrderStatus, NotificationType>> = {
 *     CONFIRMED:  NotificationType.ORDER_CONFIRMED,
 *     PROCESSING: NotificationType.ORDER_PACKED,
 *     SHIPPED:    NotificationType.ORDER_DISPATCHED,
 *     DELIVERED:  NotificationType.ORDER_DELIVERED,
 *     CANCELLED:  NotificationType.ORDER_CANCELLED,
 *   };
 *
 *   const notifType = STATUS_TO_NOTIF[newStatus];
 *   if (notifType) {
 *     await this.notifications.send(order.userId, notifType, {
 *       orderId:      order.id,
 *       amount:       order.totalAmount,
 *       savings:      order.savings ?? 0,
 *       trackingNote: order.trackingNote ?? '',
 *     });
 *   }
 *
 *   // Auto-enroll reminders when delivered
 *   if (newStatus === 'DELIVERED') {
 *     await this.remindersScheduler.enrollRemindersForOrder(order.id, order.userId);
 *   }
 *
 * ─── 5. Add NotificationsModule to OrdersModule imports ──────────────────────
 *
 *   // orders.module.ts
 *   imports: [PrismaModule, NotificationsModule, PaymentsModule]
 *
 * ─── 6. PAYMENT_SUCCESS — in payments.service.ts verifyPayment() ──────────────
 *
 *   await this.notifications.send(order.userId, NotificationType.PAYMENT_SUCCESS, {
 *     orderId: order.id,
 *     amount:  order.totalAmount,
 *   });
 */

export {};

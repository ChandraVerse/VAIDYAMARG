import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';

export enum NotificationType {
  ORDER_PLACED      = 'ORDER_PLACED',
  ORDER_CONFIRMED   = 'ORDER_CONFIRMED',
  ORDER_PACKED      = 'ORDER_PACKED',
  ORDER_DISPATCHED  = 'ORDER_DISPATCHED',
  ORDER_DELIVERED   = 'ORDER_DELIVERED',
  ORDER_CANCELLED   = 'ORDER_CANCELLED',
  PRESCRIPTION_VERIFIED = 'PRESCRIPTION_VERIFIED',
  PRESCRIPTION_REJECTED = 'PRESCRIPTION_REJECTED',
  LOW_STOCK_ALERT   = 'LOW_STOCK_ALERT',
  PAYMENT_SUCCESS   = 'PAYMENT_SUCCESS',
  REFILL_REMINDER   = 'REFILL_REMINDER',
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; body: (data: any) => string }> = {
  ORDER_PLACED: {
    title: '🛒 Order Placed!',
    body: (d) => `Your order #${d.orderId?.slice(-6).toUpperCase()} has been placed. Total: ₹${d.amount}`,
  },
  ORDER_CONFIRMED: {
    title: '✅ Order Confirmed',
    body: (d) => `Your order #${d.orderId?.slice(-6).toUpperCase()} has been confirmed by the pharmacy.`,
  },
  ORDER_PACKED: {
    title: '📦 Order Packed',
    body: (d) => `Your order #${d.orderId?.slice(-6).toUpperCase()} is packed and ready for dispatch.`,
  },
  ORDER_DISPATCHED: {
    title: '🚚 Out for Delivery',
    body: (d) => `Your order #${d.orderId?.slice(-6).toUpperCase()} is on the way! ${d.trackingNote || ''}`,
  },
  ORDER_DELIVERED: {
    title: '🎉 Order Delivered!',
    body: (d) => `Order #${d.orderId?.slice(-6).toUpperCase()} delivered. You saved ₹${d.savings || 0} with generics!`,
  },
  ORDER_CANCELLED: {
    title: '❌ Order Cancelled',
    body: (d) => `Order #${d.orderId?.slice(-6).toUpperCase()} has been cancelled. Refund (if any) in 3-5 days.`,
  },
  PRESCRIPTION_VERIFIED: {
    title: '✅ Prescription Verified',
    body: () => 'Your prescription has been verified by a pharmacist. You can now place your order.',
  },
  PRESCRIPTION_REJECTED: {
    title: '❌ Prescription Rejected',
    body: (d) => `Your prescription was rejected. Reason: ${d.reason || 'Please upload a clearer image.'}`,
  },
  LOW_STOCK_ALERT: {
    title: '⚠️ Low Stock Alert',
    body: (d) => `${d.medicineName} is running low (${d.stock} units left). Please restock soon.`,
  },
  PAYMENT_SUCCESS: {
    title: '💳 Payment Successful',
    body: (d) => `Payment of ₹${d.amount} received for order #${d.orderId?.slice(-6).toUpperCase()}.`,
  },
  REFILL_REMINDER: {
    title: '💊 Medicine Refill Reminder',
    body: (d) => `Time to refill ${d.medicineName}! Order now and save with generics.`,
  },
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly push: PushService,
  ) {}

  // ─── Send Notification (main entry point) ──────────────────────────────────
  async send(
    userId: string,
    type: NotificationType,
    data: Record<string, any> = {},
  ) {
    const template = NOTIFICATION_TEMPLATES[type];
    const title    = template.title;
    const body     = template.body(data);

    try {
      // 1. Save to DB
      await this.prisma.notification.create({
        data: { userId, type, title, body, metadata: JSON.stringify(data) },
      });

      // 2. Push notification (Firebase)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true, phone: true },
      });

      if (user?.fcmToken) {
        await this.push.send(user.fcmToken, title, body, data).catch((err) =>
          this.logger.warn(`Push failed for ${userId}: ${err.message}`),
        );
      }

      // 3. SMS for critical events
      const smsEvents: NotificationType[] = [
        NotificationType.ORDER_DISPATCHED,
        NotificationType.ORDER_DELIVERED,
        NotificationType.PRESCRIPTION_VERIFIED,
        NotificationType.PRESCRIPTION_REJECTED,
      ];

      if (user?.phone && smsEvents.includes(type)) {
        await this.sms.send(user.phone, body).catch((err) =>
          this.logger.warn(`SMS failed for ${userId}: ${err.message}`),
        );
      }

      this.logger.log(`Notification sent [${type}] to user: ${userId}`);
    } catch (err) {
      // Notifications are non-critical — never crash the main flow
      this.logger.error(`Notification failed for ${userId}: ${err.message}`);
    }
  }

  // ─── Get Notifications ────────────────────────────────────────────────────────
  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: notifications, total: notifications.length };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { success: true, data: { unreadCount: count } };
  }

  async markAsRead(userId: string, notifId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id: notifId } });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.userId !== userId) throw new NotFoundException('Notification not found');

    await this.prisma.notification.update({
      where: { id: notifId },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true, message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true, message: 'All notifications marked as read' };
  }

  // ─── FCM Token ─────────────────────────────────────────────────────────────
  async registerFcmToken(userId: string, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });
    return { success: true, message: 'Push notification enabled' };
  }
}

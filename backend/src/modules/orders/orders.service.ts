import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService }       from '../../prisma/prisma.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { RemindersScheduler }  from '../notifications/reminders.scheduler';
import { OrderGateway }        from './order.gateway';

enum OrderStatus {
  PENDING    = 'PENDING',
  CONFIRMED  = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED    = 'SHIPPED',
  DELIVERED  = 'DELIVERED',
  CANCELLED  = 'CANCELLED',
}

const STATUS_TO_NOTIF: Partial<Record<OrderStatus, NotificationType>> = {
  [OrderStatus.CONFIRMED]:  NotificationType.ORDER_CONFIRMED,
  [OrderStatus.PROCESSING]: NotificationType.ORDER_PACKED,
  [OrderStatus.SHIPPED]:    NotificationType.ORDER_DISPATCHED,
  [OrderStatus.DELIVERED]:  NotificationType.ORDER_DELIVERED,
  [OrderStatus.CANCELLED]:  NotificationType.ORDER_CANCELLED,
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma:             PrismaService,
    private readonly notifications:      NotificationsService,
    private readonly remindersScheduler: RemindersScheduler,
    // forwardRef: OrderGateway <-> OrdersService live in the same module;
    // forwardRef avoids the circular dependency NestJS would otherwise throw.
    @Inject(forwardRef(() => OrderGateway))
    private readonly gateway: OrderGateway,
  ) {}

  // ─── Place Order ─────────────────────────────────────────────────────────────
  async placeOrder(userId: string, dto: {
    addressId:      string;
    items:          { medicineId: string; quantity: number }[];
    prescriptionId?: string;
    couponCode?:    string;
  }) {
    // Validate address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Fetch medicines + validate stock
    const medicineIds = dto.items.map((i) => i.medicineId);
    const medicines   = await this.prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });

    const itemsData: {
      medicineId: string;
      medicineName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];
    let totalAmount = 0;

    for (const lineItem of dto.items) {
      const med = medicines.find((m) => m.id === lineItem.medicineId);
      if (!med) throw new NotFoundException(`Medicine ${lineItem.medicineId} not found`);
      if (med.stock < lineItem.quantity)
        throw new BadRequestException(`Insufficient stock for ${med.name}`);

      const lineTotal = Number(med.discountedPrice ?? med.mrp) * lineItem.quantity;
      totalAmount += lineTotal;

      itemsData.push({
        medicineId:   med.id,
        medicineName: med.name,
        quantity:     lineItem.quantity,
        unitPrice:    Number(med.discountedPrice ?? med.mrp),
        totalPrice:   lineTotal,
      });
    }

    // Create order + decrement stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          addressId:      dto.addressId,
          prescriptionId: dto.prescriptionId,
          status:         OrderStatus.PENDING,
          totalAmount,
          paymentStatus:  'PENDING',
          items: { create: itemsData },
        },
        include: { items: true },
      });

      // Decrement stock
      await Promise.all(
        dto.items.map((i) =>
          tx.medicine.update({
            where: { id: i.medicineId },
            data:  { stock: { decrement: i.quantity } },
          }),
        ),
      );

      return created;
    });

    // Push: order placed
    await this.notifications.send(userId, NotificationType.ORDER_PLACED, {
      orderId: order.id,
      amount:  order.totalAmount,
    });

    this.logger.log(`Order placed: ${order.id} by user ${userId}`);
    return { success: true, data: order };
  }

  // ─── Get User Orders ─────────────────────────────────────────────────────────
  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items:   { select: { medicineName: true, quantity: true, totalPrice: true } },
        address: { select: { street: true, city: true, pincode: true } },
      },
    });
    return { success: true, data: orders, total: orders.length };
  }

  // ─── Get Single Order ─────────────────────────────────────────────────────────
  async getOrderById(userId: string, orderId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items:        true,
        address:      true,
        prescription: { select: { imageUrl: true, status: true } },
        user:         isAdmin ? { select: { name: true, phone: true, email: true } } : false,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId !== userId)
      throw new ForbiddenException('Access denied');

    return { success: true, data: order };
  }

  // ─── Update Order Status (admin / partner) ────────────────────────────────────
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    updatedBy: 'ADMIN' | 'PARTNER',
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Validate transition
    const ALLOWED_NEXT: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]:    [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]:  [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]:    [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]:  [],
      [OrderStatus.CANCELLED]:  [],
    };

    if (!ALLOWED_NEXT[order.status as OrderStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot move order from ${order.status} to ${newStatus}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data:  {
        status: newStatus,
        ...(newStatus === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
      },
    });

    // ── Real-time Socket.io push ──────────────────────────────────────────
    // Fires BEFORE the FCM push so the mobile app can update the UI
    // immediately if the patient has the app open, then handle the
    // background FCM notification if they don't.
    this.gateway.emitOrderUpdate(order.id, order.userId, newStatus);

    // ── FCM / SMS push notification ───────────────────────────────────────
    const notifType = STATUS_TO_NOTIF[newStatus];
    if (notifType) {
      await this.notifications.send(order.userId, notifType, {
        orderId:      order.id,
        amount:       order.totalAmount,
        savings:      (order as any).savings ?? 0,
        trackingNote: (order as any).trackingNote ?? '',
      });
    }

    // Auto-enroll refill reminders when delivered
    if (newStatus === OrderStatus.DELIVERED) {
      await this.remindersScheduler.enrollRemindersForOrder(order.id, order.userId);
    }

    this.logger.log(`Order ${orderId}: ${order.status} → ${newStatus} by ${updatedBy}`);
    return { success: true, data: updated };
  }

  // ─── Cancel Order (user self-cancel) ─────────────────────────────────────────
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data:  { status: OrderStatus.CANCELLED },
    });

    // Restore stock
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    await Promise.all(
      items.map((i) =>
        this.prisma.medicine.update({
          where: { id: i.medicineId },
          data:  { stock: { increment: i.quantity } },
        }),
      ),
    );

    // ── Real-time cancel confirmation ─────────────────────────────────────
    this.gateway.emitOrderUpdate(order.id, order.userId, OrderStatus.CANCELLED);

    await this.notifications.send(userId, NotificationType.ORDER_CANCELLED, {
      orderId: order.id,
    });

    return { success: true, data: updated };
  }

  // ─── Admin: list all orders ───────────────────────────────────────────────────
  async getAllOrders(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const where = filters.status ? { status: filters.status as OrderStatus } : {};

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user:    { select: { name: true, phone: true } },
          address: { select: { city: true, pincode: true } },
          items:   { select: { medicineName: true, quantity: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { success: true, data: orders, total, page, limit };
  }
}

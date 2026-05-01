import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService } from './payment.service';
import { OrderGateway } from './order.gateway';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { RemindersService } from '../reminders/reminders.service';
import { PartnersService } from '../partners/partners.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma:       PrismaService,
    private readonly paymentSvc:   PaymentService,
    private readonly gateway:      OrderGateway,
    private readonly notifications: NotificationsService,
    private readonly reminders:    RemindersService,
    private readonly partners:     PartnersService,
  ) {}

  // ─── CREATE ORDER ───────────────────────────────────────────────────────────────────
  async create(dto: CreateOrderDto, userId: string) {
    const itemsWithDetails = await Promise.all(
      dto.items.map(async (item) => {
        const medicine = await this.prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });
        if (!medicine || !medicine.isActive)
          throw new NotFoundException(`Medicine ID "${item.medicineId}" not found`);
        if (medicine.stock < item.quantity)
          throw new BadRequestException(
            `Insufficient stock for "${medicine.name}". Available: ${medicine.stock}`,
          );
        return {
          ...item,
          medicine,
          unitPrice:  medicine.genericPrice,
          totalPrice: +(medicine.genericPrice * item.quantity).toFixed(2),
        };
      }),
    );

    const totalAmount = +itemsWithDetails
      .reduce((sum, i) => sum + i.totalPrice, 0)
      .toFixed(2);

    const razorpayOrder = await this.paymentSvc.createOrder(totalAmount);

    const order = await this.prisma.order.create({
      data: {
        userId,
        prescriptionId:  dto.prescriptionId ?? null,
        totalAmount,
        deliveryAddress: dto.deliveryAddress,
        notes:           dto.notes ?? null,
        status:          'PENDING',
        paymentStatus:   'PENDING',
        paymentId:       razorpayOrder.id,
        items: {
          create: itemsWithDetails.map((i) => ({
            medicineId: i.medicineId,
            quantity:   i.quantity,
            unitPrice:  i.unitPrice,
            totalPrice: i.totalPrice,
          })),
        },
      },
      include: { items: { include: { medicine: true } } },
    });

    await this.notifications.send(userId, NotificationType.ORDER_PLACED, {
      orderId: order.id,
      amount:  totalAmount,
    });

    this.logger.log(`Order created: ${order.id} | ₹${totalAmount}`);

    return {
      order,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        amount:          razorpayOrder.amount,
        currency:        razorpayOrder.currency,
        keyId:           this.paymentSvc.getKeyId(),
      },
    };
  }

  // ─── VERIFY PAYMENT ───────────────────────────────────────────────────────────────
  async verifyPayment(dto: VerifyPaymentDto, userId: string) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

    const isValid = this.paymentSvc.verifySignature(
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    );
    if (!isValid)
      throw new BadRequestException('Payment verification failed. Invalid signature.');

    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where:   { id: orderId },
      data:    { paymentStatus: 'PAID', paymentId: razorpayPaymentId, status: 'CONFIRMED' },
      include: { items: { include: { medicine: true } } },
    });

    // Deduct stock for every item
    await Promise.all(
      updatedOrder.items.map((item) =>
        this.prisma.medicine.update({
          where: { id: item.medicineId },
          data:  { stock: { decrement: item.quantity } },
        }),
      ),
    );

    await this.notifications.send(userId, NotificationType.PAYMENT_SUCCESS, {
      orderId: order.id, amount: order.totalAmount,
    });
    await this.notifications.send(userId, NotificationType.ORDER_CONFIRMED, {
      orderId: order.id,
    });

    this.gateway.emitOrderUpdate(order.id, userId, 'CONFIRMED');

    this.logger.log(`Payment verified for order ${orderId}`);
    return {
      message: '🎉 Payment successful! Your order is confirmed.',
      order: updatedOrder,
    };
  }

  // ─── ORDER HISTORY ─────────────────────────────────────────────────────────────────
  async getHistory(userId: string) {
    const orders = await this.prisma.order.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            medicine: { select: { id: true, name: true, genericName: true, imageUrl: true } },
          },
        },
      },
    });
    return { orders, total: orders.length };
  }

  // ─── TRACK ORDER ───────────────────────────────────────────────────────────────────
  async track(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where:  { id: orderId, userId },
      select: {
        id: true, status: true, paymentStatus: true,
        createdAt: true, updatedAt: true,
        deliveryAddress: true, totalAmount: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const timeline = [
      { step: 'PENDING',    label: 'Order Placed',     done: true },
      { step: 'CONFIRMED',  label: 'Order Confirmed',  done: ['CONFIRMED','PROCESSING','DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'PROCESSING', label: 'Being Packed',     done: ['PROCESSING','DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'DISPATCHED', label: 'Out for Delivery', done: ['DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'DELIVERED',  label: 'Delivered',        done: order.status === 'DELIVERED' },
    ];

    return { order, timeline };
  }

  // ─── FIND ONE ──────────────────────────────────────────────────────────────────────
  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where:   { id: orderId, userId },
      include: { items: { include: { medicine: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── CANCEL ────────────────────────────────────────────────────────────────────────
  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');

    if (!['PENDING','CONFIRMED'].includes(order.status))
      throw new BadRequestException(
        `Order cannot be cancelled. Current status: ${order.status}`,
      );

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data:  { status: 'CANCELLED' },
    });

    await this.notifications.send(userId, NotificationType.ORDER_CANCELLED, {
      orderId: order.id,
    });
    this.gateway.emitOrderUpdate(orderId, userId, 'CANCELLED');

    this.logger.log(`Order cancelled: ${orderId}`);
    return { message: 'Order cancelled successfully', order: updated };
  }

  // ─── UPDATE STATUS (Admin / Pharmacist) ───────────────────────────────────────────
  async updateStatus(orderId: string, status: string) {
    const validStatuses = ['CONFIRMED','PROCESSING','DISPATCHED','DELIVERED','CANCELLED'];
    if (!validStatuses.includes(status))
      throw new BadRequestException(`Invalid status: ${status}`);

    const order = await this.prisma.order.findUnique({
      where:   { id: orderId },
      include: { items: { include: { medicine: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data:  { status: status as any },
    });

    // ── Notification per status ───────────────────────────────────────────────
    const notifMap: Record<string, NotificationType> = {
      CONFIRMED:  NotificationType.ORDER_CONFIRMED,
      PROCESSING: NotificationType.ORDER_PACKED,
      DISPATCHED: NotificationType.ORDER_DISPATCHED,
      DELIVERED:  NotificationType.ORDER_DELIVERED,
      CANCELLED:  NotificationType.ORDER_CANCELLED,
    };
    if (notifMap[status]) {
      await this.notifications.send(order.userId, notifMap[status], {
        orderId: order.id,
        trackingNote: status === 'DISPATCHED' ? 'Estimated delivery: today' : undefined,
        savings: status === 'DELIVERED'
          ? +(order.items.reduce(
              (s, i) => s + ((i.medicine as any).mrp - i.unitPrice) * i.quantity, 0,
            )).toFixed(2)
          : undefined,
      });
    }

    // ── Real-time Socket.io push ─────────────────────────────────────────────────
    this.gateway.emitOrderUpdate(orderId, order.userId, status);

    // ── On DELIVERED: auto-enroll reminders + record partner earning ───────────
    if (status === 'DELIVERED') {
      // Refill reminders for chronic medicines in this order
      await this.reminders.autoEnrollFromOrder(order.userId, orderId);

      // Partner earning row — idempotent upsert, safe against duplicate webhooks.
      // Looks up whether the order's patient is served by a partner pharmacy.
      // If no partner pharmacy is linked, recordEarning() is a silent no-op.
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { ownerId: order.userId, status: 'APPROVED', isActive: true },
      });
      if (pharmacy) {
        await this.partners.recordEarning(
          pharmacy.id,
          orderId,
          order.totalAmount,
        );
        this.logger.log(`Partner earning recorded: pharmacy ${pharmacy.id} | order ${orderId}`);
      }
    }

    return { message: `Order status updated to ${status}`, order: updated };
  }
}

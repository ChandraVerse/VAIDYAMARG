import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  // -------------------------------------------------------
  // CREATE ORDER
  // -------------------------------------------------------
  async create(dto: CreateOrderDto, userId: string) {
    // 1. Validate all medicines and check stock
    const itemsWithDetails = await Promise.all(
      dto.items.map(async (item) => {
        const medicine = await this.prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });
        if (!medicine || !medicine.isActive) {
          throw new NotFoundException(`Medicine ID "${item.medicineId}" not found`);
        }
        if (medicine.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${medicine.name}". Available: ${medicine.stock}`,
          );
        }
        return {
          ...item,
          medicine,
          unitPrice: medicine.genericPrice,
          totalPrice: +(medicine.genericPrice * item.quantity).toFixed(2),
        };
      }),
    );

    // 2. Calculate total amount
    const totalAmount = +itemsWithDetails
      .reduce((sum, item) => sum + item.totalPrice, 0)
      .toFixed(2);

    // 3. Create Razorpay order
    const razorpayOrder = await this.paymentService.createOrder(totalAmount);

    // 4. Save order in DB (status: PENDING until payment verified)
    const order = await this.prisma.order.create({
      data: {
        userId,
        prescriptionId: dto.prescriptionId ?? null,
        totalAmount,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes ?? null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentId: razorpayOrder.id,
        items: {
          create: itemsWithDetails.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: { include: { medicine: true } } },
    });

    this.logger.log(`Order created: ${order.id} | Amount: ₹${totalAmount}`);

    return {
      order,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,       // in paise
        currency: razorpayOrder.currency,
        keyId: this.paymentService.getKeyId(),
      },
    };
  }

  // -------------------------------------------------------
  // VERIFY PAYMENT (called after Razorpay success)
  // -------------------------------------------------------
  async verifyPayment(dto: VerifyPaymentDto, userId: string) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = dto;

    // 1. Verify Razorpay signature
    const isValid = this.paymentService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
    if (!isValid) {
      throw new BadRequestException('Payment verification failed. Invalid signature.');
    }

    // 2. Find our order
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    // 3. Update order — mark as paid and confirmed
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpayPaymentId,
        status: 'CONFIRMED',
      },
      include: { items: { include: { medicine: true } } },
    });

    // 4. Deduct stock for each medicine
    await Promise.all(
      updatedOrder.items.map((item) =>
        this.prisma.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    this.logger.log(`Payment verified for order ${orderId}`);

    return {
      message: '🎉 Payment successful! Your order is confirmed.',
      order: updatedOrder,
    };
  }

  // -------------------------------------------------------
  // ORDER HISTORY
  // -------------------------------------------------------
  async getHistory(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            medicine: {
              select: { id: true, name: true, genericName: true, imageUrl: true },
            },
          },
        },
      },
    });
    return { orders, total: orders.length };
  }

  // -------------------------------------------------------
  // TRACK ORDER
  // -------------------------------------------------------
  async track(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        deliveryAddress: true,
        totalAmount: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Timeline of statuses
    const timeline = [
      { step: 'PENDING',    label: 'Order Placed',      done: true },
      { step: 'CONFIRMED',  label: 'Order Confirmed',   done: ['CONFIRMED','PROCESSING','DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'PROCESSING', label: 'Being Packed',      done: ['PROCESSING','DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'DISPATCHED', label: 'Out for Delivery',  done: ['DISPATCHED','DELIVERED'].includes(order.status) },
      { step: 'DELIVERED',  label: 'Delivered',         done: order.status === 'DELIVERED' },
    ];

    return { order, timeline };
  }

  // -------------------------------------------------------
  // FIND ONE
  // -------------------------------------------------------
  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { medicine: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // -------------------------------------------------------
  // CANCEL
  // -------------------------------------------------------
  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const cancellable = ['PENDING', 'CONFIRMED'];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be cancelled. Current status: ${order.status}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Order cancelled: ${orderId}`);
    return { message: 'Order cancelled successfully', order: updated };
  }

  // -------------------------------------------------------
  // UPDATE STATUS (Admin/Pharmacist)
  // -------------------------------------------------------
  async updateStatus(orderId: string, status: string) {
    const validStatuses = ['CONFIRMED','PROCESSING','DISPATCHED','DELIVERED','CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
    return { message: `Order status updated to ${status}`, order: updated };
  }
}

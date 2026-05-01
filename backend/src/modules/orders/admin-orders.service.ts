import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderGateway } from './order.gateway';

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: OrderGateway,
  ) {}

  async listOrders(opts: { search?: string; status?: string; page: number; limit: number }) {
    const { search, status, page, limit } = opts;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          items: { include: { medicine: { select: { name: true } } } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit } };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user:  { select: { id: true, name: true, phone: true } },
        items: { include: { medicine: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { success: true, data: order };
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data:  { status: status as any },
    });
    // Push real-time update to patient
    this.gateway.notifyOrderUpdate(order.userId, order.id, status);
    return { success: true, data: order };
  }
}

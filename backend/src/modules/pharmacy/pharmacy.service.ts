import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PharmacyService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Dashboard KPIs
  // ---------------------------------------------------------------------------
  async getDashboardStats() {
    const [totalOrders, totalUsers, pendingRx, revenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count(),
      this.prisma.prescription.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['CANCELLED'] } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        totalUsers,
        pendingRx,
        totalRevenue: Number(revenue._sum.total ?? 0),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Revenue chart (last 30 days, grouped by date)
  // ---------------------------------------------------------------------------
  async getRevenueChart() {
    const since = subDays(new Date(), 30);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { notIn: ['CANCELLED'] },
      },
      select: { total: true, createdAt: true },
    });

    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      map[format(subDays(new Date(), i), 'dd MMM')] = 0;
    }
    for (const o of orders) {
      const key = format(o.createdAt, 'dd MMM');
      if (key in map) map[key] += Number(o.total);
    }

    return {
      success: true,
      data: Object.entries(map).map(([date, revenue]) => ({ date, revenue })),
    };
  }

  // ---------------------------------------------------------------------------
  // Orders-per-day chart (last 30 days)
  // ---------------------------------------------------------------------------
  async getOrdersChart() {
    const since = subDays(new Date(), 30);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      map[format(subDays(new Date(), i), 'dd MMM')] = 0;
    }
    for (const o of orders) {
      const key = format(o.createdAt, 'dd MMM');
      if (key in map) map[key] += 1;
    }

    return {
      success: true,
      data: Object.entries(map).map(([date, orders]) => ({ date, orders })),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays, format } from 'date-fns';

@Injectable()
export class PharmacyService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Dashboard KPIs
  // ---------------------------------------------------------------------------
  async getDashboardStats() {
    const [totalOrders, totalUsers, pendingRx, revenue, lowStock] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'PATIENT' } }),
      this.prisma.prescription.count({ where: { status: 'PENDING' } }),
      // ✅ correct field: totalAmount (not "total")
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { notIn: ['CANCELLED'] } },
      }),
      this.prisma.medicine.count({ where: { stock: { lte: 10 }, isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        totalUsers,
        pendingRx,
        totalRevenue: Number(revenue._sum.totalAmount ?? 0),
        lowStockAlerts: lowStock,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Revenue chart (last 30 days, grouped by date)
  // ---------------------------------------------------------------------------
  async getRevenueChart() {
    const since = subDays(new Date(), 30);

    // ✅ correct field: totalAmount (not "total")
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { notIn: ['CANCELLED'] },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      map[format(subDays(new Date(), i), 'dd MMM')] = 0;
    }
    for (const o of orders) {
      const key = format(o.createdAt, 'dd MMM');
      if (key in map) map[key] += Number(o.totalAmount);
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
      select: { createdAt: true, status: true },
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

  // ---------------------------------------------------------------------------
  // Admin: list users
  // ---------------------------------------------------------------------------
  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, phone: true, email: true,
          role: true, isActive: true, createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);
    return { success: true, data: users, total, page, limit };
  }
}

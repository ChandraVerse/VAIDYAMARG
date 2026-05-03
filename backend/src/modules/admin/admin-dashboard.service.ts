import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus, PharmacyStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── KPI Stats ────────────────────────────────────────────────────────────

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalOrders,
      revenueAgg,
      totalMedicines,
      pendingOrders,
      pendingPrescriptions,
      savingsAgg,
      activePharmacies,
      newUsersToday,
      ordersToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.medicine.count({ where: { isActive: true } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.prescription.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        _sum: { genericSavings: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.pharmacy.count({ where: { status: PharmacyStatus.APPROVED, isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue:         revenueAgg._sum.totalAmount  ?? 0,
        totalMedicines,
        pendingOrders,
        pendingPrescriptions,
        totalGenericSavings:  savingsAgg._sum.genericSavings ?? 0,
        activePharmacies,
        newUsersToday,
        ordersToday,
      },
    };
  }

  // ─── Daily Revenue ────────────────────────────────────────────────────────

  async getRevenue(period: number) {
    const days = this.buildDayBuckets(period);

    const from = new Date(days[0].date);
    from.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        createdAt:     { gte: from },
      },
      select: { totalAmount: true, createdAt: true },
    });

    for (const order of orders) {
      const label = this.toDateLabel(order.createdAt);
      const bucket = days.find((d) => d.label === label);
      if (bucket) {
        bucket.revenue += order.totalAmount;
        bucket.orders  += 1;
      }
    }

    return { success: true, data: days };
  }

  // ─── Orders Chart (status breakdown per day) ──────────────────────────────

  async getOrdersChart(period: number) {
    const days = this.buildDayBuckets(period);

    const from = new Date(days[0].date);
    from.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where:  { createdAt: { gte: from } },
      select: { status: true, createdAt: true },
    });

    for (const order of orders) {
      const label = this.toDateLabel(order.createdAt);
      const bucket = days.find((d) => d.label === label) as any;
      if (bucket) {
        bucket[order.status] = (bucket[order.status] ?? 0) + 1;
        bucket.total         = (bucket.total         ?? 0) + 1;
      }
    }

    return { success: true, data: days };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private buildDayBuckets(period: number) {
    const buckets: { label: string; date: string; revenue: number; orders: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        label:   this.toDateLabel(d),
        date:    d.toISOString().split('T')[0],
        revenue: 0,
        orders:  0,
      });
    }
    return buckets;
  }

  private toDateLabel(date: Date): string {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }
}

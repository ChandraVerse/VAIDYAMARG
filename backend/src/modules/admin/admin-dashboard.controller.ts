import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../../common/guards/roles.guard';
import { Roles }         from '../../common/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  /**
   * GET /admin/dashboard/stats
   * KPI tiles: total users, orders, revenue, medicines,
   * pending orders, pending prescriptions, generic savings,
   * active pharmacies, new users today, orders today.
   */
  @Get('stats')
  stats() {
    return this.dashboardService.getStats();
  }

  /**
   * GET /admin/dashboard/revenue?period=7|30|90
   * Daily revenue + order count for the last N days.
   * Default period: 30.
   */
  @Get('revenue')
  revenue(@Query('period') period = '30') {
    const p = Math.min(Math.max(Number(period) || 30, 7), 90);
    return this.dashboardService.getRevenue(p);
  }

  /**
   * GET /admin/dashboard/orders-chart?period=7|30|90
   * Daily order-count breakdown by status for the last N days.
   * Default period: 30.
   */
  @Get('orders-chart')
  ordersChart(@Query('period') period = '30') {
    const p = Math.min(Math.max(Number(period) || 30, 7), 90);
    return this.dashboardService.getOrdersChart(p);
  }
}

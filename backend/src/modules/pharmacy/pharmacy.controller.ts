import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PHARMACIST')
@Controller('admin/dashboard')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ── GET /admin/dashboard/stats ──────────────────────────────────────────
  @Get('stats')
  @ApiOperation({
    summary: 'Dashboard KPIs',
    description:
      'Returns total orders, total patients, pending prescription count, ' +
      'total revenue (non-cancelled orders), and low-stock medicine alerts. ' +
      'Accessible by ADMIN and PHARMACIST roles.',
  })
  @ApiOkResponse({
    description: 'KPI summary',
    schema: {
      example: {
        success: true,
        data: {
          totalOrders:     142,
          totalUsers:      87,
          pendingRx:       5,
          totalRevenue:    48320,
          lowStockAlerts:  3,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role (PATIENT not allowed)' })
  getStats() {
    return this.pharmacyService.getDashboardStats();
  }

  // ── GET /admin/dashboard/revenue ────────────────────────────────────────
  @Get('revenue')
  @ApiOperation({
    summary: 'Revenue chart data (last 30 days)',
    description:
      'Returns daily revenue totals for the past 30 days, ' +
      'ready to feed into the Recharts AreaChart on the admin panel.',
  })
  @ApiOkResponse({
    description: 'Array of { date, revenue } objects',
    schema: {
      example: {
        success: true,
        data: [
          { date: '02 Apr', revenue: 1240 },
          { date: '03 Apr', revenue: 980 },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  getRevenue() {
    return this.pharmacyService.getRevenueChart();
  }

  // ── GET /admin/dashboard/orders ─────────────────────────────────────────
  @Get('orders')
  @ApiOperation({
    summary: 'Orders-per-day chart data (last 30 days)',
    description:
      'Returns daily order counts grouped by status for the past 30 days. ' +
      'Used to drive the BarChart on the admin analytics page.',
  })
  @ApiOkResponse({
    description: 'Array of { date, orders } objects',
    schema: {
      example: {
        success: true,
        data: [
          { date: '02 Apr', orders: 8  },
          { date: '03 Apr', orders: 11 },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  getOrdersChart() {
    return this.pharmacyService.getOrdersChart();
  }
}

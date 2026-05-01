import { Controller, Get, UseGuards } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PHARMACIST')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('stats')
  getStats() {
    return this.pharmacyService.getDashboardStats();
  }

  @Get('revenue')
  getRevenue() {
    return this.pharmacyService.getRevenueChart();
  }

  @Get('orders')
  getOrdersChart() {
    return this.pharmacyService.getOrdersChart();
  }
}

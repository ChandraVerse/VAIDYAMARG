import {
  Controller, Get, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PHARMACIST')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page')   page = '1',
    @Query('limit')  limit = '20',
  ) {
    return this.adminOrdersService.listOrders({
      search,
      status,
      page:  Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.adminOrdersService.getOrder(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.adminOrdersService.updateStatus(id, body.status);
  }
}

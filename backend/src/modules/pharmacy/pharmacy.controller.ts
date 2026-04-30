import {
  Controller, Get, Post, Patch, Body,
  Param, UseGuards, ParseUUIDPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RegisterPharmacyDto } from './dto/register-pharmacy.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ─── Registration ─────────────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register pharmacy as a VaidyaMarg partner' })
  async register(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterPharmacyDto,
  ) {
    return this.pharmacyService.registerPharmacy(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my pharmacy profile' })
  async getMyPharmacy(@CurrentUser() user: { id: string }) {
    return this.pharmacyService.getMyPharmacy(user.id);
  }

  // ─── Inventory ─────────────────────────────────────────────────────────────
  @Get('inventory')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get my pharmacy inventory' })
  async getInventory(@CurrentUser() user: { id: string }) {
    return this.pharmacyService.getInventory(user.id);
  }

  @Patch('inventory/:medicineId')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Update stock for a medicine' })
  async updateStock(
    @CurrentUser() user: { id: string },
    @Param('medicineId', ParseUUIDPipe) medicineId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.pharmacyService.updateStock(user.id, medicineId, dto);
  }

  @Get('inventory/low-stock')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get medicines with low stock (below threshold)' })
  async getLowStock(@CurrentUser() user: { id: string }) {
    return this.pharmacyService.getLowStockAlerts(user.id);
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────
  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get all orders assigned to my pharmacy' })
  async getPharmacyOrders(@CurrentUser() user: { id: string }) {
    return this.pharmacyService.getPharmacyOrders(user.id);
  }

  @Patch('orders/:orderId/status')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Update order status (Confirmed → Packed → Dispatched)' })
  async updateOrderStatus(
    @CurrentUser() user: { id: string },
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.pharmacyService.updateOrderStatus(user.id, orderId, dto);
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Pharmacy partner dashboard — revenue, orders, alerts' })
  async getDashboard(@CurrentUser() user: { id: string }) {
    return this.pharmacyService.getPharmacyDashboard(user.id);
  }

  // ─── Admin: All Pharmacies ──────────────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list all registered pharmacies' })
  async getAllPharmacies() {
    return this.pharmacyService.getAllPharmacies();
  }

  @Patch('admin/:pharmacyId/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: approve or suspend a pharmacy' })
  async approvePharmacy(
    @Param('pharmacyId', ParseUUIDPipe) pharmacyId: string,
    @Body() body: { approved: boolean; reason?: string },
  ) {
    return this.pharmacyService.approvePharmacy(pharmacyId, body.approved, body.reason);
  }
}

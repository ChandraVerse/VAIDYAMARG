import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterPharmacyDto } from './dto/register-pharmacy.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const LOW_STOCK_THRESHOLD = 10; // alert when stock falls below this

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Register Pharmacy ───────────────────────────────────────────────────────
  async registerPharmacy(userId: string, dto: RegisterPharmacyDto) {
    // One user = one pharmacy
    const existing = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (existing) throw new ConflictException('You already have a registered pharmacy');

    // Check drug license uniqueness
    const licenseExists = await this.prisma.pharmacy.findUnique({
      where: { drugLicense: dto.drugLicense },
    });
    if (licenseExists) throw new ConflictException('Drug license already registered');

    const pharmacy = await this.prisma.pharmacy.create({
      data: {
        ownerId: userId,
        name: dto.name,
        ownerName: dto.ownerName,
        phone: dto.phone,
        email: dto.email || null,
        drugLicense: dto.drugLicense,
        gstNumber: dto.gstNumber || null,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        status: 'PENDING_APPROVAL',
      },
    });

    // Upgrade user role to PHARMACIST
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'PHARMACIST' },
    });

    this.logger.log(`Pharmacy registered: ${pharmacy.id} by user: ${userId}`);

    return {
      success: true,
      message: 'Pharmacy registered! Awaiting admin approval (usually within 24 hours).',
      data: { pharmacyId: pharmacy.id, status: pharmacy.status },
    };
  }

  // ─── Get My Pharmacy ─────────────────────────────────────────────────────────
  async getMyPharmacy(userId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { ownerId: userId },
      include: {
        _count: { select: { orders: true, inventory: true } },
      },
    });
    if (!pharmacy) throw new NotFoundException('No pharmacy found for your account');
    return { success: true, data: pharmacy };
  }

  // ─── Inventory ──────────────────────────────────────────────────────────────
  async getInventory(userId: string) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const inventory = await this.prisma.inventory.findMany({
      where: { pharmacyId: pharmacy.id },
      include: {
        medicine: {
          select: { id: true, name: true, genericName: true, category: true, unit: true },
        },
      },
      orderBy: { medicine: { name: 'asc' } },
    });

    return { success: true, data: inventory, total: inventory.length };
  }

  async updateStock(userId: string, medicineId: string, dto: UpdateStockDto) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const inventory = await this.prisma.inventory.upsert({
      where: {
        pharmacyId_medicineId: { pharmacyId: pharmacy.id, medicineId },
      },
      update: {
        stock: dto.stock,
        price: dto.price,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        isAvailable: dto.stock > 0,
      },
      create: {
        pharmacyId: pharmacy.id,
        medicineId,
        stock: dto.stock,
        price: dto.price,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isAvailable: dto.stock > 0,
      },
    });

    if (inventory.stock <= LOW_STOCK_THRESHOLD) {
      this.logger.warn(`Low stock alert: medicine ${medicineId} at pharmacy ${pharmacy.id} — only ${inventory.stock} left`);
    }

    return { success: true, message: 'Stock updated', data: inventory };
  }

  async getLowStockAlerts(userId: string) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const lowStock = await this.prisma.inventory.findMany({
      where: {
        pharmacyId: pharmacy.id,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
      include: {
        medicine: { select: { id: true, name: true, genericName: true } },
      },
      orderBy: { stock: 'asc' },
    });

    return {
      success: true,
      data: lowStock,
      total: lowStock.length,
      message: lowStock.length > 0
        ? `⚠️ ${lowStock.length} medicines are running low`
        : '✅ All medicines well stocked',
    };
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────
  async getPharmacyOrders(userId: string) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const orders = await this.prisma.order.findMany({
      where: { pharmacyId: pharmacy.id },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        items: {
          include: {
            medicine: { select: { id: true, name: true, genericName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const grouped = {
      PENDING:    orders.filter(o => o.status === 'PENDING'),
      CONFIRMED:  orders.filter(o => o.status === 'CONFIRMED'),
      PACKED:     orders.filter(o => o.status === 'PACKED'),
      DISPATCHED: orders.filter(o => o.status === 'DISPATCHED'),
      DELIVERED:  orders.filter(o => o.status === 'DELIVERED'),
      CANCELLED:  orders.filter(o => o.status === 'CANCELLED'),
    };

    return { success: true, data: grouped, total: orders.length };
  }

  async updateOrderStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.pharmacyId !== pharmacy.id) throw new ForbiddenException('This order does not belong to your pharmacy');

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING:    ['CONFIRMED', 'CANCELLED'],
      CONFIRMED:  ['PACKED',    'CANCELLED'],
      PACKED:     ['DISPATCHED'],
      DISPATCHED: ['DELIVERED'],
    };

    if (!validTransitions[order.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move order from ${order.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.status === 'DISPATCHED' && { dispatchedAt: new Date() }),
        ...(dto.status === 'DELIVERED'  && { deliveredAt:  new Date() }),
        ...(dto.trackingNote && { trackingNote: dto.trackingNote }),
      },
    });

    this.logger.log(`Order ${orderId} status updated to ${dto.status} by pharmacy ${pharmacy.id}`);

    return {
      success: true,
      message: `Order marked as ${dto.status}`,
      data: { orderId: updated.id, status: updated.status },
    };
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  async getPharmacyDashboard(userId: string) {
    const pharmacy = await this.getPharmacyOrThrow(userId);

    const [totalOrders, pendingOrders, deliveredOrders, lowStock, revenue] =
      await Promise.all([
        this.prisma.order.count({ where: { pharmacyId: pharmacy.id } }),
        this.prisma.order.count({ where: { pharmacyId: pharmacy.id, status: 'PENDING' } }),
        this.prisma.order.count({ where: { pharmacyId: pharmacy.id, status: 'DELIVERED' } }),
        this.prisma.inventory.count({
          where: { pharmacyId: pharmacy.id, stock: { lte: LOW_STOCK_THRESHOLD } },
        }),
        this.prisma.order.aggregate({
          where: { pharmacyId: pharmacy.id, status: 'DELIVERED' },
          _sum: { totalAmount: true },
        }),
      ]);

    const recentOrders = await this.prisma.order.findMany({
      where: { pharmacyId: pharmacy.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, phone: true } },
      },
    });

    return {
      success: true,
      data: {
        pharmacy: { name: pharmacy.name, status: pharmacy.status },
        stats: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          lowStockAlerts: lowStock,
          totalRevenue: `₹${(revenue._sum.totalAmount || 0).toFixed(2)}`,
        },
        recentOrders,
      },
    };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async getAllPharmacies() {
    const pharmacies = await this.prisma.pharmacy.findMany({
      include: {
        owner: { select: { id: true, name: true, phone: true } },
        _count: { select: { orders: true, inventory: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: pharmacies, total: pharmacies.length };
  }

  async approvePharmacy(pharmacyId: string, approved: boolean, reason?: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found');

    await this.prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        status: approved ? 'ACTIVE' : 'SUSPENDED',
        rejectionReason: approved ? null : (reason || 'Did not meet requirements'),
        approvedAt: approved ? new Date() : null,
      },
    });

    return {
      success: true,
      message: `Pharmacy ${approved ? 'approved' : 'suspended'} successfully`,
    };
  }

  // ─── Private Helper ──────────────────────────────────────────────────────────
  private async getPharmacyOrThrow(userId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found for your account');
    if (pharmacy.status === 'SUSPENDED') throw new ForbiddenException('Your pharmacy has been suspended');
    return pharmacy;
  }
}

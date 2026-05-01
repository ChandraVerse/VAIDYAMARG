import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { OnboardPartnerDto } from './dto/onboard-partner.dto';
import { ReviewPartnerDto } from './dto/review-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { subDays, format } from 'date-fns';

@Injectable()
export class PartnersService {
  private readonly logger = new Logger(PartnersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Onboard (Pharmacist submits application) ───────────────────────────────
  async onboard(dto: OnboardPartnerDto, userId: string) {
    // One pharmacy per user
    const existing = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (existing) {
      throw new ConflictException('You have already submitted a pharmacy application.');
    }

    // Drug license must be unique
    const licenseConflict = await this.prisma.pharmacy.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });
    if (licenseConflict) {
      throw new ConflictException('A pharmacy with this drug license number already exists.');
    }

    const pharmacy = await this.prisma.pharmacy.create({
      data: {
        ownerId:        userId,
        name:           dto.name,
        licenseNumber:  dto.licenseNumber,
        gstNumber:      dto.gstNumber,
        email:          dto.email,
        phone:          dto.phone,
        address:        dto.address,
        city:           dto.city,
        state:          dto.state,
        pincode:        dto.pincode,
        operatingHours: dto.operatingHours,
        deliveryRadius: dto.deliveryRadius,
        status:         'PENDING',
      },
    });

    this.logger.log(`Pharmacy onboarding submitted: ${pharmacy.id} by user ${userId}`);

    return {
      success: true,
      message: 'Pharmacy application submitted. You will be notified once reviewed.',
      data: { pharmacyId: pharmacy.id, status: pharmacy.status },
    };
  }

  // ─── Get Own Pharmacy (Pharmacist) ─────────────────────────────────────────
  async getMyPharmacy(userId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where:   { ownerId: userId },
      include: { earnings: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    if (!pharmacy) throw new NotFoundException('No pharmacy profile found.');
    return { success: true, data: pharmacy };
  }

  // ─── Update Own Pharmacy Profile ────────────────────────────────────────────
  async updateMyPharmacy(dto: UpdatePartnerDto, userId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (!pharmacy) throw new NotFoundException('No pharmacy profile found.');
    if (pharmacy.status === 'SUSPENDED') {
      throw new ForbiddenException('Your pharmacy account is suspended. Contact support.');
    }

    const updated = await this.prisma.pharmacy.update({
      where: { ownerId: userId },
      data: {
        operatingHours: dto.operatingHours,
        deliveryRadius: dto.deliveryRadius,
        email:          dto.email,
        address:        dto.address,
        city:           dto.city,
        state:          dto.state,
        pincode:        dto.pincode,
      },
    });

    return { success: true, message: 'Pharmacy profile updated.', data: updated };
  }

  // ─── Partner Analytics (last 30 days) ──────────────────────────────────────
  async getMyAnalytics(userId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (!pharmacy) throw new NotFoundException('No pharmacy profile found.');

    const since = subDays(new Date(), 30);

    const [earnings, recentEarnings, totalOrders] = await Promise.all([
      // Total settled vs pending
      this.prisma.pharmacyEarning.aggregate({
        where: { pharmacyId: pharmacy.id },
        _sum:  { netEarning: true, commission: true, orderAmount: true },
      }),
      // Daily breakdown last 30 days
      this.prisma.pharmacyEarning.findMany({
        where:   { pharmacyId: pharmacy.id, createdAt: { gte: since } },
        select:  { netEarning: true, orderAmount: true, createdAt: true, settledAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Total order count
      this.prisma.pharmacyEarning.count({ where: { pharmacyId: pharmacy.id } }),
    ]);

    // Build daily chart
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      dailyMap[format(subDays(new Date(), i), 'dd MMM')] = { revenue: 0, orders: 0 };
    }
    for (const e of recentEarnings) {
      const key = format(e.createdAt, 'dd MMM');
      if (key in dailyMap) {
        dailyMap[key].revenue += Number(e.netEarning);
        dailyMap[key].orders  += 1;
      }
    }

    return {
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue:    Number(earnings._sum.orderAmount ?? 0),
          totalCommission: Number(earnings._sum.commission  ?? 0),
          netEarnings:     Number(earnings._sum.netEarning  ?? 0),
        },
        daily: Object.entries(dailyMap).map(([date, v]) => ({ date, ...v })),
      },
    };
  }

  // ─── Partner Earnings History (paginated) ───────────────────────────────────
  async getMyEarnings(userId: string, page = 1, limit = 20) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { ownerId: userId } });
    if (!pharmacy) throw new NotFoundException('No pharmacy profile found.');

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.pharmacyEarning.findMany({
        where:   { pharmacyId: pharmacy.id },
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacyEarning.count({ where: { pharmacyId: pharmacy.id } }),
    ]);

    return { success: true, data: items, total, page, limit };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Admin: List All Pharmacies ─────────────────────────────────────────────
  async adminListPharmacies(status?: string, page = 1, limit = 20) {
    const skip  = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [pharmacies, total] = await Promise.all([
      this.prisma.pharmacy.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, phone: true, email: true } },
          _count: { select: { earnings: true } },
        },
      }),
      this.prisma.pharmacy.count({ where }),
    ]);

    return { success: true, data: pharmacies, total, page, limit };
  }

  // ─── Admin: Get Single Pharmacy ─────────────────────────────────────────────
  async adminGetPharmacy(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where:   { id },
      include: {
        owner:    { select: { id: true, name: true, phone: true, email: true } },
        earnings: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found.');
    return { success: true, data: pharmacy };
  }

  // ─── Admin: Approve or Reject Application ──────────────────────────────────
  async adminReviewPharmacy(id: string, dto: ReviewPartnerDto, adminId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id } });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found.');
    if (pharmacy.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING applications can be reviewed.');
    }

    const updated = await this.prisma.pharmacy.update({
      where: { id },
      data: {
        status:          dto.approved ? 'APPROVED' : 'REJECTED',
        approvedById:    dto.approved ? adminId : null,
        approvedAt:      dto.approved ? new Date() : null,
        rejectionReason: dto.approved ? null : (dto.rejectionReason ?? 'Application rejected.'),
        isActive:        dto.approved,
      },
    });

    // Notify the pharmacy owner
    await this.notifications.send(
      pharmacy.ownerId,
      dto.approved ? NotificationType.PARTNER_APPROVED : NotificationType.PARTNER_REJECTED,
      { reason: dto.rejectionReason },
    );

    this.logger.log(
      `Pharmacy ${id} ${dto.approved ? 'APPROVED' : 'REJECTED'} by admin ${adminId}`,
    );

    return {
      success: true,
      message: `Pharmacy ${dto.approved ? 'approved' : 'rejected'} successfully.`,
      data: { pharmacyId: id, status: updated.status },
    };
  }

  // ─── Admin: Suspend / Reinstate ─────────────────────────────────────────────
  async adminToggleSuspend(id: string, suspend: boolean, adminId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id } });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found.');

    await this.prisma.pharmacy.update({
      where: { id },
      data: {
        status:   suspend ? 'SUSPENDED' : 'APPROVED',
        isActive: !suspend,
      },
    });

    await this.notifications.send(
      pharmacy.ownerId,
      suspend ? NotificationType.PARTNER_SUSPENDED : NotificationType.PARTNER_APPROVED,
    );

    return {
      success: true,
      message: `Pharmacy ${suspend ? 'suspended' : 'reinstated'}.`,
    };
  }

  // ─── Admin: Record Earning (called internally when order DELIVERED) ─────────
  async recordEarning(pharmacyId: string, orderId: string, orderAmount: number) {
    const pharmacy = await this.prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) return; // no-op if not a partner order

    const commission  = (pharmacy.commissionRate / 100) * orderAmount;
    const netEarning  = orderAmount - commission;

    await this.prisma.pharmacyEarning.upsert({
      where:  { orderId },
      create: { pharmacyId, orderId, orderAmount, commission, netEarning },
      update: {},  // idempotent — never overwrite
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddAddressDto } from './dto/add-address.dto';
import { AddHealthRecordDto } from './dto/add-health-record.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Get Profile ────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            prescriptions: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: user };
  }

  // ─── Update Profile ─────────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check email uniqueness if being updated
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Email already in use');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.avatar && { avatar: dto.avatar }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender && { gender: dto.gender }),
      },
      select: {
        id: true, name: true, email: true,
        avatar: true, dateOfBirth: true, gender: true,
      },
    });

    return { success: true, message: 'Profile updated', data: updated };
  }

  // ─── Addresses ──────────────────────────────────────────────────────────────
  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: addresses };
  }

  async addAddress(userId: string, dto: AddAddressDto) {
    // If this is first address or marked default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2 || null,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        landmark: dto.landmark || null,
        isDefault: dto.isDefault ?? false,
      },
    });

    return { success: true, message: 'Address added', data: address };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Access denied');

    // Unset all, then set this one
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return { success: true, message: 'Default address updated' };
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true, message: 'Address deleted' };
  }

  // ─── Health Records ─────────────────────────────────────────────────────────
  async getHealthRecords(userId: string) {
    const records = await this.prisma.healthRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: records };
  }

  async addHealthRecord(userId: string, dto: AddHealthRecordDto) {
    const record = await this.prisma.healthRecord.create({
      data: {
        userId,
        type: dto.type,        // ALLERGY | CONDITION | SURGERY | MEDICATION
        name: dto.name,
        details: dto.details || null,
        severity: dto.severity || null,
        diagnosedAt: dto.diagnosedAt ? new Date(dto.diagnosedAt) : null,
      },
    });
    return { success: true, message: 'Health record added', data: record };
  }

  async deleteHealthRecord(userId: string, recordId: string) {
    const record = await this.prisma.healthRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Record not found');
    if (record.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.healthRecord.delete({ where: { id: recordId } });
    return { success: true, message: 'Health record deleted' };
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  async getDashboard(userId: string) {
    const [user, orders, prescriptions, addresses] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, phone: true, avatar: true },
      }),
      this.prisma.order.findMany({
        where: { patientId: userId },
        select: { id: true, status: true, totalAmount: true, genericSavings: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.prescription.findMany({
        where: { patientId: userId },
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.address.count({ where: { userId } }),
    ]);

    // Calculate total savings
    const allOrders = await this.prisma.order.findMany({
      where: { patientId: userId, status: 'DELIVERED' },
      select: { genericSavings: true },
    });
    const totalSavings = allOrders.reduce((sum, o) => sum + (o.genericSavings || 0), 0);

    return {
      success: true,
      data: {
        user,
        stats: {
          totalOrders: await this.prisma.order.count({ where: { patientId: userId } }),
          totalSavings: `₹${totalSavings.toFixed(2)}`,
          totalPrescriptions: await this.prisma.prescription.count({ where: { patientId: userId } }),
          savedAddresses: addresses,
        },
        recentOrders: orders,
        recentPrescriptions: prescriptions,
      },
    };
  }

  // ─── Admin: All Users ───────────────────────────────────────────────────────
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true, name: true, phone: true,
        email: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: users, total: users.length };
  }
}

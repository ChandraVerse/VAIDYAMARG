import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(opts: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = opts;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          name:      true,
          phone:     true,
          email:     true,
          createdAt: true,
          _count:    { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { success: true, data, meta: { total, page, limit } };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, phone: true, email: true,
        createdAt: true,
        addresses: true,
        _count: { select: { orders: true, prescriptions: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: user };
  }
}

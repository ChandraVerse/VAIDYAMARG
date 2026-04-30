import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchMedicineDto } from './dto/search-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';

@Injectable()
export class MedicinesService {
  private readonly logger = new Logger(MedicinesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------
  // SEARCH
  // -------------------------------------------------------
  async search(dto: SearchMedicineDto) {
    const { q, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const where = q
      ? {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { genericName: { contains: q, mode: 'insensitive' as const } },
            { brandName: { contains: q, mode: 'insensitive' as const } },
            { category: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : { isActive: true };

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          genericName: true,
          brandName: true,
          category: true,
          dosageForm: true,
          strength: true,
          mrp: true,
          genericPrice: true,
          discount: true,
          stock: true,
          imageUrl: true,
          requiresRx: true,
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      medicines: medicines.map((m) => this.addSavingsInfo(m)),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------
  // COMPARE: Brand vs Generic  — Core VaidyaMarg Feature
  // -------------------------------------------------------
  async compareBrandVsGeneric(brandName: string) {
    if (!brandName) throw new NotFoundException('Brand name is required');

    // Find the branded medicine
    const branded = await this.prisma.medicine.findFirst({
      where: {
        isActive: true,
        OR: [
          { brandName: { contains: brandName, mode: 'insensitive' } },
          { name: { contains: brandName, mode: 'insensitive' } },
        ],
      },
    });

    if (!branded) {
      throw new NotFoundException(
        `No medicine found matching "${brandName}". Try searching by generic name.`,
      );
    }

    // Find all generics with same generic molecule
    const generics = await this.prisma.medicine.findMany({
      where: {
        isActive: true,
        genericName: { contains: branded.genericName, mode: 'insensitive' },
        id: { not: branded.id },
      },
      orderBy: { genericPrice: 'asc' },
    });

    const bestGeneric = generics[0] ?? null;
    const savings = bestGeneric
      ? {
          amountSaved: +(branded.mrp - bestGeneric.genericPrice).toFixed(2),
          percentSaved: +(((branded.mrp - bestGeneric.genericPrice) / branded.mrp) * 100).toFixed(1),
        }
      : null;

    return {
      branded: this.addSavingsInfo(branded),
      generics: generics.map((g) => this.addSavingsInfo(g)),
      bestDeal: bestGeneric ? this.addSavingsInfo(bestGeneric) : null,
      savings,
      summary: savings
        ? `💰 Switch to generic and save ₹${savings.amountSaved} (${savings.percentSaved}% cheaper!)`
        : 'No generic alternative found in our catalogue yet.',
    };
  }

  // -------------------------------------------------------
  // GET CATEGORIES
  // -------------------------------------------------------
  async getCategories() {
    const categories = await this.prisma.medicine.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return categories.map((c) => c.category);
  }

  // -------------------------------------------------------
  // FIND ONE
  // -------------------------------------------------------
  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });
    if (!medicine || !medicine.isActive) {
      throw new NotFoundException(`Medicine with ID "${id}" not found`);
    }
    return this.addSavingsInfo(medicine);
  }

  // -------------------------------------------------------
  // CREATE  (Admin only)
  // -------------------------------------------------------
  async create(dto: CreateMedicineDto) {
    const medicine = await this.prisma.medicine.create({ data: dto });
    this.logger.log(`New medicine added: ${medicine.name} (${medicine.id})`);
    return medicine;
  }

  // -------------------------------------------------------
  // PRIVATE: Attach savings info to every medicine
  // -------------------------------------------------------
  private addSavingsInfo(medicine: any) {
    const savingsVsMrp = +(medicine.mrp - medicine.genericPrice).toFixed(2);
    const savingsPercent = +(((medicine.mrp - medicine.genericPrice) / medicine.mrp) * 100).toFixed(1);
    return {
      ...medicine,
      savingsVsMrp,
      savingsPercent,
      savingsLabel:
        savingsPercent > 0
          ? `${savingsPercent}% cheaper than branded`
          : 'Already at best price',
    };
  }
}

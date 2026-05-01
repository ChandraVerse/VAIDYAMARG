import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { VerifyPrescriptionDto } from './dto/verify-prescription.dto';
import axios from 'axios';

export enum PrescriptionStatus {
  PENDING        = 'PENDING',
  VERIFIED       = 'VERIFIED',
  REJECTED       = 'REJECTED',
  OCR_PROCESSING = 'OCR_PROCESSING',
  OCR_COMPLETE   = 'OCR_COMPLETE',
}

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);
  private readonly ocrServiceUrl =
    process.env.OCR_SERVICE_URL || 'http://ocr-service:8001';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Upload Prescription ─────────────────────────────────────────────────────
  async uploadPrescription(file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('No file uploaded');

    const uploadResult = await this.cloudinary.uploadPrescription(file, userId);

    // ✅ field names match schema: userId, imageUrl, publicId, fileType, fileName, fileSize
    const prescription = await this.prisma.prescription.create({
      data: {
        userId,
        imageUrl:  uploadResult.secure_url,
        publicId:  uploadResult.public_id,
        status:    PrescriptionStatus.PENDING,
        fileType:  file.mimetype,
        fileName:  file.originalname,
        fileSize:  file.size,
      },
    });

    this.logger.log(`Prescription uploaded: ${prescription.id} by user: ${userId}`);

    return {
      success: true,
      message: 'Prescription uploaded successfully. Awaiting pharmacist verification.',
      data: {
        prescriptionId: prescription.id,
        status:         prescription.status,
        uploadedAt:     prescription.createdAt,
        imageUrl:       uploadResult.secure_url,
      },
    };
  }

  // ─── Get Prescriptions by User ─────────────────────────────────────────────────
  async getPrescriptionsByUser(userId: string) {
    const prescriptions = await this.prisma.prescription.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, status: true, fileName: true, fileType: true,
        createdAt: true, verifiedAt: true, ocrResult: true, rejectionReason: true,
      },
    });
    return { success: true, data: prescriptions, total: prescriptions.length };
  }

  // ─── Get Single Prescription ────────────────────────────────────────────────────
  async getPrescriptionById(id: string, user: { id: string; role: string }) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription not found');

    if (
      prescription.userId !== user.id &&
      !['PHARMACIST', 'ADMIN'].includes(user.role)
    ) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: prescription };
  }

  // ─── Pharmacist Verify ───────────────────────────────────────────────────────
  async verifyPrescription(
    id: string,
    dto: VerifyPrescriptionDto,
    pharmacistId: string,
  ) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription not found');
    if (prescription.status === PrescriptionStatus.VERIFIED)
      throw new BadRequestException('Prescription already verified');

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status:          dto.approved ? PrescriptionStatus.VERIFIED : PrescriptionStatus.REJECTED,
        verifiedById:    pharmacistId,
        verifiedAt:      new Date(),
        rejectionReason: dto.approved ? null : (dto.rejectionReason ?? null),
        pharmacistNotes: dto.notes ?? null,
      },
    });

    // ✅ Fire patient notification on verify/reject
    await this.notifications.send(
      prescription.userId,
      dto.approved
        ? NotificationType.PRESCRIPTION_VERIFIED
        : NotificationType.PRESCRIPTION_REJECTED,
      { reason: dto.rejectionReason },
    );

    this.logger.log(
      `Prescription ${id} ${
        dto.approved ? 'VERIFIED' : 'REJECTED'
      } by pharmacist ${pharmacistId}`,
    );

    return {
      success: true,
      message: `Prescription ${dto.approved ? 'verified' : 'rejected'} successfully`,
      data: { prescriptionId: updated.id, status: updated.status, verifiedAt: updated.verifiedAt },
    };
  }

  // ─── Trigger OCR ─────────────────────────────────────────────────────────────────
  async triggerOcr(id: string, userId: string) {
    const prescription = await this.prisma.prescription.findUnique({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription not found');
    if (prescription.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.OCR_PROCESSING },
    });

    try {
      const ocrResponse = await axios.post(
        `${this.ocrServiceUrl}/ocr/extract`,
        { image_url: prescription.imageUrl, prescription_id: id },
        { timeout: 30000 },
      );

      const ocrResult = ocrResponse.data;

      await this.prisma.prescription.update({
        where: { id },
        data: {
          status:         PrescriptionStatus.OCR_COMPLETE,
          ocrResult:      JSON.stringify(ocrResult),
          ocrProcessedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'OCR completed successfully',
        data: {
          prescriptionId:     id,
          extractedMedicines: ocrResult.medicines    || [],
          doctorName:         ocrResult.doctor_name  || null,
          patientName:        ocrResult.patient_name || null,
          confidence:         ocrResult.confidence   || 0,
        },
      };
    } catch (error) {
      await this.prisma.prescription.update({
        where: { id },
        data: { status: PrescriptionStatus.PENDING },
      });
      this.logger.error(`OCR failed for prescription ${id}: ${error.message}`);
      return {
        success: false,
        message: 'OCR service temporarily unavailable. Prescription saved for manual review.',
        data: { prescriptionId: id, status: PrescriptionStatus.PENDING },
      };
    }
  }

  // ─── Get Pending Prescriptions (Pharmacist queue) ─────────────────────────────
  async getPendingPrescriptions() {
    const prescriptions = await this.prisma.prescription.findMany({
      where:   { status: PrescriptionStatus.PENDING },
      orderBy: { createdAt: 'asc' },  // FIFO
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
    return { success: true, data: prescriptions, total: prescriptions.length };
  }
}

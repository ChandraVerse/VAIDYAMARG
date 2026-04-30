import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifyPrescriptionDto } from './dto/verify-prescription.dto';
import { memoryStorage } from 'multer';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  // ─── Upload Prescription ────────────────────────────────────────────────────
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a prescription image (Patient)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG, WEBP, or PDF files are allowed'), false);
        }
      },
    }),
  )
  async uploadPrescription(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.prescriptionsService.uploadPrescription(file, user.id);
  }

  // ─── Get My Prescriptions ───────────────────────────────────────────────────
  @Get('my')
  @ApiOperation({ summary: 'Get all prescriptions for current patient' })
  async getMyPrescriptions(@CurrentUser() user: { id: string }) {
    return this.prescriptionsService.getPrescriptionsByUser(user.id);
  }

  // ─── Get Single Prescription ────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get single prescription by ID' })
  async getPrescription(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.prescriptionsService.getPrescriptionById(id, user);
  }

  // ─── Pharmacist Verify ──────────────────────────────────────────────────────
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Pharmacist verifies or rejects a prescription' })
  async verifyPrescription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPrescriptionDto,
    @CurrentUser() pharmacist: { id: string },
  ) {
    return this.prescriptionsService.verifyPrescription(id, dto, pharmacist.id);
  }

  // ─── Trigger OCR ────────────────────────────────────────────────────────────
  @Post(':id/ocr')
  @ApiOperation({ summary: 'Trigger AI OCR on an uploaded prescription' })
  async triggerOcr(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.prescriptionsService.triggerOcr(id, user.id);
  }

  // ─── Admin: All Pending ──────────────────────────────────────────────────────
  @Get('admin/pending')
  @UseGuards(RolesGuard)
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get all prescriptions pending verification' })
  async getPendingPrescriptions() {
    return this.prescriptionsService.getPendingPrescriptions();
  }
}

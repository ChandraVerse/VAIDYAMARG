import { ApiProperty } from '@nestjs/swagger';

export class UploadPrescriptionDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Prescription image (JPEG/PNG/WEBP/PDF, max 5MB)' })
  file: any;
}

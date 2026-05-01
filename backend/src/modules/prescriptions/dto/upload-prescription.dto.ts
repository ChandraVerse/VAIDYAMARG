import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPrescriptionDto {
  @ApiPropertyOptional({
    example: 'Dr. Anjali Singh',
    description: 'Doctor name as printed on prescription',
  })
  @IsOptional() @IsString()
  doctorName?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Date prescription was issued (ISO 8601)',
  })
  @IsOptional() @IsDateString()
  issuedDate?: string;

  @ApiPropertyOptional({ example: 'Priya Sharma' })
  @IsOptional() @IsString()
  patientName?: string;

  @ApiPropertyOptional({ example: 'Please process urgently' })
  @IsOptional() @IsString()
  notes?: string;
}
// Note: the actual file is received as multipart/form-data via @UploadedFile().
// This DTO covers only the text body fields that accompany the upload.

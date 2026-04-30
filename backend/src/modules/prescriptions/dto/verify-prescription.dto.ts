import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPrescriptionDto {
  @ApiProperty({ description: 'Approve (true) or Reject (false) the prescription' })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({ description: 'Pharmacist notes (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Reason for rejection (required if approved = false)' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  rejectionReason?: string;
}

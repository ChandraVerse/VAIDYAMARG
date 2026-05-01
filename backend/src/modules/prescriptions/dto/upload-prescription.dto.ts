import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPrescriptionDto {
  @ApiPropertyOptional({
    description: 'Optional note from the patient about the prescription',
    example: 'Post-surgery follow-up prescription from Dr. Mehta',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

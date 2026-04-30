import { IsString, IsOptional, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum HealthRecordType {
  ALLERGY     = 'ALLERGY',
  CONDITION   = 'CONDITION',  // e.g. Diabetes, Hypertension
  SURGERY     = 'SURGERY',
  MEDICATION  = 'MEDICATION', // ongoing medicines
}

enum Severity {
  MILD     = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE   = 'SEVERE',
}

export class AddHealthRecordDto {
  @ApiProperty({ enum: HealthRecordType, example: 'ALLERGY' })
  @IsEnum(HealthRecordType)
  type: HealthRecordType;

  @ApiProperty({ example: 'Penicillin' })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Causes severe rash' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;

  @ApiPropertyOptional({ enum: Severity })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({ example: '2020-01-15' })
  @IsOptional()
  @IsDateString()
  diagnosedAt?: string;
}

import { IsUUID, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetReminderDto {
  @ApiProperty({
    description: 'UUID of the medicine to set a refill reminder for',
    example: 'c2a8e3f0-1234-5678-abcd-ef0123456789',
  })
  @IsUUID()
  medicineId: string;

  @ApiPropertyOptional({
    description: 'Refill interval in days (default: 30). Min 7, Max 180.',
    example: 30,
    minimum: 7,
    maximum: 180,
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(180)
  intervalDays?: number = 30;

  @ApiPropertyOptional({
    description: 'Enable or disable this reminder',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = true;
}

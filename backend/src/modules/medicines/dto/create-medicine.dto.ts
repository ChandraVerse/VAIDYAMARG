import {
  IsString, IsNumber, IsBoolean, IsOptional,
  IsNotEmpty, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Amoxicillin 500mg' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Amoxicillin', description: 'INN / generic name' })
  @IsString() @IsNotEmpty()
  genericName: string;

  @ApiPropertyOptional({ example: 'Mox' })
  @IsOptional() @IsString()
  brandName?: string;

  @ApiPropertyOptional({ example: 'Ranbaxy' })
  @IsOptional() @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Antibiotic' })
  @IsString() @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Capsule', description: 'Tablet | Capsule | Syrup | Injection | Cream | Drops' })
  @IsString() @IsNotEmpty()
  dosageForm: string;

  @ApiProperty({ example: '500mg' })
  @IsString() @IsNotEmpty()
  strength: string;

  @ApiProperty({ example: 85.00, description: 'Maximum retail price in INR' })
  @Type(() => Number) @IsNumber() @Min(0)
  mrp: number;

  @ApiProperty({ example: 32.00, description: 'Generic / discounted price in INR' })
  @Type(() => Number) @IsNumber() @Min(0)
  genericPrice: number;

  @ApiPropertyOptional({ example: 10, description: 'Discount percentage 0–100', default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100)
  discount?: number;

  @ApiPropertyOptional({ example: 500, default: 0 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: false, description: 'Requires prescription' })
  @IsOptional() @IsBoolean()
  requiresRx?: boolean;
}

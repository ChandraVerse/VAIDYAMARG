import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsPositive,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  genericName: string;

  @ApiPropertyOptional({ example: 'Crocin 500' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ example: 'GSK Pharmaceuticals' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Analgesic' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Tablet', description: 'tablet / syrup / capsule / injection / ointment' })
  @IsString()
  dosageForm: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  strength: string;

  @ApiProperty({ example: 30.00, description: 'MRP — branded price in INR' })
  @IsNumber()
  @IsPositive()
  mrp: number;

  @ApiProperty({ example: 8.50, description: 'Our generic price in INR' })
  @IsNumber()
  @IsPositive()
  genericPrice: number;

  @ApiPropertyOptional({ example: 0, description: 'Additional discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiPropertyOptional({ example: 500, description: 'Available stock units' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: false, description: 'Does this medicine require a prescription?' })
  @IsOptional()
  @IsBoolean()
  requiresRx?: boolean;
}

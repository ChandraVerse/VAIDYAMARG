import { IsInt, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ example: 150, description: 'Current stock quantity' })
  @IsInt() @Min(0)
  stock: number;

  @ApiProperty({ example: 28.50, description: 'Your selling price for this medicine' })
  @IsNumber() @Min(0)
  price: number;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Expiry date of current batch' })
  @IsOptional() @IsDateString()
  expiryDate?: string;
}

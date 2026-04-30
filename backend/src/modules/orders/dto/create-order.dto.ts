import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 'clx1234abcd', description: 'Medicine ID' })
  @IsString()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ example: 2, description: 'Quantity to order' })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'List of medicines and quantities',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    example: '12, Rabindra Sarani, Bhatpara, West Bengal - 743123',
    description: 'Full delivery address',
  })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiPropertyOptional({ example: 'clx5678efgh', description: 'Prescription ID (required for Rx medicines)' })
  @IsOptional()
  @IsString()
  prescriptionId?: string;

  @ApiPropertyOptional({ example: 'Please deliver before 6 PM' })
  @IsOptional()
  @IsString()
  notes?: string;
}

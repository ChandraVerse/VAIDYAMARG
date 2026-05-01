import {
  IsString, IsNotEmpty, IsOptional,
  IsArray, ValidateNested, IsNumber, Min, IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 'seed-med-001', description: 'Medicine ID (cuid)' })
  @IsString() @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt() @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'At least one item required',
    example: [{ medicineId: 'seed-med-001', quantity: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    example: '7 Nehru Nagar, Jaipur, Rajasthan 302001',
    description: 'Full delivery address as a single string',
  })
  @IsString() @IsNotEmpty()
  deliveryAddress: string;

  @ApiPropertyOptional({ example: 'seed-rx-001', description: 'Prescription ID if order requires Rx medicines' })
  @IsOptional() @IsString()
  prescriptionId?: string;

  @ApiPropertyOptional({ example: 'Please deliver before 6 PM' })
  @IsOptional() @IsString()
  notes?: string;
}

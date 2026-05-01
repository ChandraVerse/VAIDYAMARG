import { Type } from 'class-transformer';
import {
  IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  UPI     = 'UPI',
  CARD    = 'CARD',
  NETBANKING = 'NETBANKING',
  COD     = 'COD',
}

export class OrderItemDto {
  @ApiProperty({ description: 'UUID of the medicine', example: 'c2a8e3f0-...' })
  @IsUUID()
  medicineId: string;

  @ApiProperty({ description: 'Quantity to order', example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of medicines and quantities',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Delivery address ID (from user address book)',
    example: 'a1b2c3d4-...',
  })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiPropertyOptional({
    description: 'Prescription ID (required for Rx medicines)',
    example: 'b5c6d7e8-...',
  })
  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @ApiPropertyOptional({ description: 'Optional delivery note', example: 'Ring doorbell twice' })
  @IsOptional()
  @IsString()
  deliveryNote?: string;
}

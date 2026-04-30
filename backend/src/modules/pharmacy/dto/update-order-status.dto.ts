import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum OrderStatus {
  CONFIRMED  = 'CONFIRMED',
  PACKED     = 'PACKED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED  = 'DELIVERED',
  CANCELLED  = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Package handed to delivery partner' })
  @IsOptional() @IsString() @MaxLength(300)
  trackingNote?: string;
}

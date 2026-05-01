import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  ORDER_UPDATE     = 'ORDER_UPDATE',
  PRESCRIPTION     = 'PRESCRIPTION',
  REFILL_REMINDER  = 'REFILL_REMINDER',
  PROMOTION        = 'PROMOTION',
  SYSTEM           = 'SYSTEM',
}

export class SendNotificationDto {
  @ApiProperty({
    description: 'Notification title shown in push / in-app notification',
    example: 'Your order has been dispatched',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body / message',
    example: 'Order #ORD-001 is out for delivery. Expected by 6:00 PM.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    enum: NotificationType,
    description: 'Category of the notification',
    example: NotificationType.ORDER_UPDATE,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Target user IDs. If omitted the notification is broadcast to all patients.',
    example: ['cuid-user-001', 'cuid-user-002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Arbitrary key-value data passed to the FCM payload',
    example: { orderId: 'cuid-order-001', screen: 'OrderDetail' },
  })
  @IsOptional()
  data?: Record<string, string>;
}

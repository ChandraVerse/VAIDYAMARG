import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'clx1234abcd', description: 'Our internal Order ID' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'order_NiRmaIYWjFCzfW', description: 'Razorpay Order ID' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_NiRmaIYWjFCzfW', description: 'Razorpay Payment ID' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({ example: 'abc123...', description: 'Razorpay HMAC-SHA256 signature' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}

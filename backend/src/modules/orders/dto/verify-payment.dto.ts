import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Razorpay payment ID returned after successful payment',
    example: 'pay_Abcd1234XYZ',
  })
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_Abcd1234XYZ',
  })
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'HMAC-SHA256 signature from Razorpay for payment verification',
    example: 'abc123def456...',
  })
  @IsString()
  razorpaySignature: string;
}

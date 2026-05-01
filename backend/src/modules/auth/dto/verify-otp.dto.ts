import { IsString, IsNotEmpty, Length, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Mobile number in E.164 format',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: '6-digit OTP sent via SMS',
    example: '482910',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

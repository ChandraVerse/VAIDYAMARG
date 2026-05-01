import { IsString, IsMobilePhone, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Indian mobile number (10 digits, without country code)',
    example: '9876543210',
  })
  @IsString()
  @IsMobilePhone('en-IN')
  phone: string;

  @ApiProperty({
    description: '6-digit OTP received via SMS',
    example: '482910',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    description: "User's display name (required on first-time registration only)",
    example: 'Ravi Kumar',
    required: false,
  })
  @IsString()
  name?: string;
}

import { IsString, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Indian mobile number (10 digits, without country code)',
    example: '9876543210',
  })
  @IsString()
  @IsMobilePhone('en-IN')
  phone: string;
}

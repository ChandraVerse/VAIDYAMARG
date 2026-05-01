import { IsString, IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Mobile number in E.164 format',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}

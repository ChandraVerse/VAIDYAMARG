import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'Firebase Cloud Messaging device token', example: 'fGH7k2...' })
  @IsString()
  @MinLength(10)
  token: string;
}

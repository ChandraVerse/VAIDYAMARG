import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Priya Sharma' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'priya.sharma@gmail.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '7 Nehru Nagar' })
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Jaipur' })
  @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Rajasthan' })
  @IsOptional() @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '302001', minLength: 6, maxLength: 6 })
  @IsOptional() @IsString() @Length(6, 6)
  pincode?: string;
}

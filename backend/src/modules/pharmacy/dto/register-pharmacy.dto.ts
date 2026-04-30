import { IsString, IsOptional, IsEmail, IsNumber, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPharmacyDto {
  @ApiProperty({ example: 'Bhatpara Generic Pharmacy' })
  @IsString() @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'Chandra Sekhar Chakraborty' })
  @IsString() @MaxLength(100)
  ownerName: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phone: string;

  @ApiPropertyOptional({ example: 'pharmacy@email.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiProperty({ example: 'WB-DL-2024-123456', description: 'Drug license number' })
  @IsString() @MaxLength(50)
  drugLicense: string;

  @ApiPropertyOptional({ example: '19AABCT3518Q1ZV' })
  @IsOptional() @IsString() @MaxLength(20)
  gstNumber?: string;

  @ApiProperty({ example: '12, Station Road, Bhatpara' })
  @IsString() @MaxLength(300)
  address: string;

  @ApiProperty({ example: 'Bhatpara' })
  @IsString() @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'West Bengal' })
  @IsString() @MaxLength(100)
  state: string;

  @ApiProperty({ example: '743123' })
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Invalid pincode' })
  pincode: string;

  @ApiPropertyOptional({ example: 22.8456 })
  @IsOptional() @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 88.3953 })
  @IsOptional() @IsNumber()
  longitude?: number;
}

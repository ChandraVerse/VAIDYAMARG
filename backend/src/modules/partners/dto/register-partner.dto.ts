import {
  IsString, IsNotEmpty, IsEmail, IsOptional,
  IsNumber, Min, Max, IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterPartnerDto {
  /* ---- Business details ---- */
  @ApiProperty({ example: 'Apollo Pharmacy — Park Street' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'WB-KOL-2024-00123', description: 'Drug license number' })
  @IsString() @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({ example: '19AABCA1234F1Z5', description: 'GST registration number' })
  @IsOptional() @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: 'parkstreet@apollo.pharmacy' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiProperty({ example: '+919000000002', description: 'Pharmacy contact number (E.164)' })
  @IsPhoneNumber()
  phone: string;

  /* ---- Address ---- */
  @ApiProperty({ example: '22 Park Street' })
  @IsString() @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Kolkata' })
  @IsString() @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'West Bengal' })
  @IsString() @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '700016' })
  @IsString() @IsNotEmpty()
  pincode: string;

  /* ---- Operations ---- */
  @ApiPropertyOptional({ example: '09:00–21:00' })
  @IsOptional() @IsString()
  operatingHours?: string;

  @ApiPropertyOptional({ example: 8, description: 'Delivery radius in km', minimum: 1, maximum: 50 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50)
  deliveryRadius?: number;
}

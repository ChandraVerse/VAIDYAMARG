import {
  IsString, IsNotEmpty, IsEmail, IsOptional,
  IsPhoneNumber, Matches, Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for B2B pharmacy partner onboarding.
 * Used by POST /partners/register
 */
export class RegisterPartnerDto {
  // ── Owner / contact ───────────────────────────────────────────────────

  @ApiProperty({ example: 'Dr. Ramesh Sharma', description: 'Full name of the pharmacist / owner' })
  @IsString() @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile number in E.164 format' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'ramesh@sharmamedical.in', description: 'Business email address' })
  @IsEmail()
  email: string;

  // ── Pharmacy details ──────────────────────────────────────────────────

  @ApiProperty({ example: 'Sharma Medical Hall', description: 'Registered pharmacy / store name' })
  @IsString() @IsNotEmpty()
  pharmacyName: string;

  @ApiProperty({
    example: 'WB-DL-2024-001',
    description: 'State Drug Licence number as printed on the licence certificate',
  })
  @IsString() @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({
    example: '19AABCU9603R1ZX',
    description: 'GST registration number (15 chars)',
    minLength: 15,
    maxLength: 15,
  })
  @IsOptional()
  @IsString()
  @Length(15, 15)
  gstNumber?: string;

  // ── Address ───────────────────────────────────────────────────────────

  @ApiProperty({ example: '12, Rabindra Sarani', description: 'Street address' })
  @IsString() @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Kolkata' })
  @IsString() @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'West Bengal' })
  @IsString() @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '700001', description: '6-digit Indian postal code' })
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'pincode must be a valid 6-digit Indian postal code' })
  pincode: string;

  // ── Operational ───────────────────────────────────────────────────────

  @ApiPropertyOptional({
    example: '09:00-21:00',
    description: 'Operating hours in HH:MM-HH:MM format',
  })
  @IsOptional()
  @IsString()
  operatingHours?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Delivery radius in kilometres',
  })
  @IsOptional()
  deliveryRadius?: number;
}

import {
  IsString, IsNotEmpty, IsOptional, IsEmail,
  IsPhoneNumber, IsNumber, Min, Max,
} from 'class-validator';

export class OnboardPartnerDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  licenseNumber: string;  // Drug license — must be unique

  @IsOptional() @IsString()
  gstNumber?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsString() @IsNotEmpty()
  phone: string;

  @IsString() @IsNotEmpty()
  address: string;

  @IsString() @IsNotEmpty()
  city: string;

  @IsString() @IsNotEmpty()
  state: string;

  @IsString() @IsNotEmpty()
  pincode: string;

  @IsOptional() @IsString()
  operatingHours?: string;  // e.g. "09:00-21:00"

  @IsOptional() @IsNumber()
  @Min(1) @Max(100)
  deliveryRadius?: number;  // km
}

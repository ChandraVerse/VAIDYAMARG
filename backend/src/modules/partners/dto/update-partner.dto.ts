import {
  IsOptional, IsString, IsEmail, IsNumber, Min, Max, IsBoolean,
} from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional() @IsString()
  operatingHours?: string;

  @IsOptional() @IsNumber() @Min(1) @Max(100)
  deliveryRadius?: number;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsString()
  pincode?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

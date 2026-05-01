import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewPartnerDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional() @IsString()
  rejectionReason?: string;  // Required when approved = false
}

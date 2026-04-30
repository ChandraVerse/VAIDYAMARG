import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddAddressDto {
  @ApiProperty({ example: 'Home', description: 'Label like Home, Office, etc.' })
  @IsString()
  @MaxLength(50)
  label: string;

  @ApiProperty({ example: '12, Rabindra Sarani' })
  @IsString()
  @MaxLength(200)
  line1: string;

  @ApiPropertyOptional({ example: 'Near State Bank' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiProperty({ example: 'Bhatpara' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'West Bengal' })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '743123' })
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Invalid Indian pincode' })
  pincode: string;

  @ApiPropertyOptional({ example: 'Near Bhatpara Market' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  landmark?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

import { PartialType } from '@nestjs/swagger';
import { CreateMedicineDto } from './create-medicine.dto';

/**
 * All fields optional — inherits @ApiProperty from CreateMedicineDto
 * via PartialType (swagger-safe version from @nestjs/swagger).
 */
export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {
  // Stock and isActive can be updated independently
  // All other fields inherited as optional from CreateMedicineDto
}

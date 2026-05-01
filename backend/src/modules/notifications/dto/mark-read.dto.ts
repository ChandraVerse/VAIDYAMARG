import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiPropertyOptional({
    description: 'Notification ID to mark as read. Omit to mark all as read.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  notificationId?: string;
}

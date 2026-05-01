import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { CloudinaryService } from './cloudinary.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // needed for PRESCRIPTION_VERIFIED / PRESCRIPTION_REJECTED
  ],
  controllers: [PrescriptionsController],
  providers:   [PrescriptionsService, CloudinaryService],
  exports:     [PrescriptionsService],
})
export class PrescriptionsModule {}

import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { FcmService } from './fcm.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SmsService, PushService, FcmService],
  // Export NotificationsService so ANY other module can inject it
  exports: [NotificationsService],
})
export class NotificationsModule {}

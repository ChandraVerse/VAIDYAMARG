import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global() // Available everywhere without importing
@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SmsService, PushService],
  exports: [NotificationsService, SmsService, PushService],
})
export class NotificationsModule {}

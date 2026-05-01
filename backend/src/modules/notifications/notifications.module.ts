import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { FcmService } from './fcm.service';
import { RemindersScheduler } from './reminders.scheduler';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // ScheduleModule must also be registered in AppModule (forRoot());
    // registering here is a no-op if already registered globally.
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    SmsService,
    PushService,
    FcmService,
    RemindersScheduler,   // daily cron + enrollRemindersForOrder()
  ],
  exports: [
    NotificationsService,
    RemindersScheduler,   // exported so OrdersService can call enrollRemindersForOrder()
  ],
})
export class NotificationsModule {}

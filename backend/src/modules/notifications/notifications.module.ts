import { Module }           from '@nestjs/common';
import { ScheduleModule }   from '@nestjs/schedule';
import { NotificationsService }         from './notifications.service';
import { NotificationsController, AdminNotificationsController } from './notifications.controller';
import { SmsService }       from './sms.service';
import { PushService }      from './push.service';
import { FcmService }       from './fcm.service';
import { RemindersScheduler } from './reminders.scheduler';
import { PrismaModule }     from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    NotificationsController,        // patient-facing
    AdminNotificationsController,   // admin manual push
  ],
  providers: [
    NotificationsService,
    SmsService,
    PushService,
    FcmService,
    RemindersScheduler,
  ],
  exports: [
    NotificationsService,
    RemindersScheduler,
  ],
})
export class NotificationsModule {}

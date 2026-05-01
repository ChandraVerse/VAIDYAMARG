import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';
import { RemindersProcessor } from './reminders.processor';
import { RemindersController } from './reminders.controller';
import { RemindersScheduler } from './reminders.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'reminders' }),
    NotificationsModule,
    PrismaModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersProcessor, RemindersScheduler],
  exports: [RemindersService],
})
export class RemindersModule {}

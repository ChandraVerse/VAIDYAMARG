import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { RemindersService } from './reminders.service';
import { REMINDERS_QUEUE, REMINDER_JOB } from './reminders.constants';

export interface RefillReminderJobData {
  reminderId:   string;
  userId:       string;
  medicineId:   string;
  medicineName: string;
  userName:     string;
  intervalDays: number;
}

@Processor(REMINDERS_QUEUE)
export class RemindersProcessor {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly reminders: RemindersService,
  ) {}

  @Process(REMINDER_JOB.SEND_REFILL)
  async handleSendRefill(job: Job<RefillReminderJobData>) {
    const { reminderId, userId, medicineName, intervalDays } = job.data;

    this.logger.log(`Processing refill reminder job ${job.id} for user ${userId}`);

    try {
      // 1. Send FCM + SMS notification
      await this.notifications.send(userId, NotificationType.REFILL_REMINDER, {
        medicineName,
        intervalDays,
      });

      // 2. Advance the next reminder date so it fires again next cycle
      await this.reminders.advanceReminder(reminderId, intervalDays);

      this.logger.log(
        `Refill reminder sent — user: ${userId}, medicine: ${medicineName}, ` +
        `next in ${intervalDays}d`,
      );
    } catch (err) {
      this.logger.error(
        `Refill reminder job ${job.id} failed: ${err.message}`,
      );
      throw err; // Re-throw so Bull retries the job
    }
  }
}

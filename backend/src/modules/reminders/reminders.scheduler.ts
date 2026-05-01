import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(private readonly remindersService: RemindersService) {}

  /**
   * Runs every day at 09:00 AM IST (03:30 UTC).
   * Scans for all reminders where nextRemindAt <= now and enqueues a Bull job
   * for each one.
   */
  @Cron('30 3 * * *', { timeZone: 'Asia/Kolkata' })
  async scheduleDailyReminders() {
    this.logger.log('Running daily refill reminder scan...');
    const count = await this.remindersService.enqueueDueReminders();
    this.logger.log(`Daily scan complete — ${count} reminder(s) enqueued`);
  }
}

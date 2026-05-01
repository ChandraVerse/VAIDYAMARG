import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService, NotificationType } from './notifications.service';

/**
 * RemindersScheduler
 *
 * Runs every day at 08:00 IST (02:30 UTC).
 * Finds all active reminders whose nextDueAt is today or overdue,
 * fires a REFILL_REMINDER push + SMS to the user,
 * then advances nextDueAt by the reminder's frequencyDays.
 *
 * Prerequisites:
 *   npm install @nestjs/schedule  (already in package.json via ScheduleModule)
 *   ScheduleModule.forRoot() must be in AppModule imports.
 */
@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Fires daily at 08:00 IST = 02:30 UTC.
   * Cron: seconds minutes hours day month weekday
   */
  @Cron('0 30 2 * * *', { name: 'refill-reminders', timeZone: 'UTC' })
  async processRefillReminders() {
    this.logger.log('Running refill reminder job…');

    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight UTC today

    // Find all active reminders due today or overdue
    const reminders = await this.prisma.medicineReminder.findMany({
      where: {
        isActive:   true,
        nextDueAt: { lte: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, // due within next 24h
      },
      include: {
        user:     { select: { id: true, name: true } },
        medicine: { select: { name: true } },
      },
    });

    this.logger.log(`Found ${reminders.length} reminder(s) to process`);

    await Promise.allSettled(
      reminders.map(async (reminder) => {
        try {
          // Fire push + SMS
          await this.notifications.send(
            reminder.userId,
            NotificationType.REFILL_REMINDER,
            {
              medicineName: reminder.medicine?.name ?? reminder.medicineName,
              reminderId:   reminder.id,
            },
          );

          // Advance nextDueAt by frequencyDays
          const next = new Date(reminder.nextDueAt ?? now);
          next.setDate(next.getDate() + (reminder.frequencyDays ?? 30));

          await this.prisma.medicineReminder.update({
            where: { id: reminder.id },
            data:  { nextDueAt: next, lastSentAt: now },
          });

          this.logger.log(
            `Reminder sent [✓] userId=${reminder.userId} medicine=${
              reminder.medicine?.name ?? reminder.medicineName
            } nextDue=${next.toISOString()}`,
          );
        } catch (err) {
          this.logger.error(`Reminder failed for id=${reminder.id}: ${err.message}`);
        }
      }),
    );

    this.logger.log('Refill reminder job complete');
  }

  /**
   * Auto-enroll reminder when an order is delivered.
   * Called directly from OrdersService after status → DELIVERED.
   *
   * For each order item that doesn't already have an active reminder,
   * creates one with a default 30-day frequency.
   */
  async enrollRemindersForOrder(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { medicine: { select: { id: true, name: true } } },
          },
        },
      });
      if (!order) return;

      for (const item of order.items) {
        const existing = await this.prisma.medicineReminder.findFirst({
          where: { userId, medicineId: item.medicineId, isActive: true },
        });
        if (existing) continue;

        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + 30);

        await this.prisma.medicineReminder.create({
          data: {
            userId,
            medicineId:    item.medicineId,
            medicineName:  item.medicine?.name ?? 'Medicine',
            frequencyDays: 30,
            nextDueAt:     nextDue,
            isActive:      true,
          },
        });

        this.logger.log(
          `Auto-enrolled reminder: userId=${userId} medicine=${item.medicine?.name}`,
        );
      }
    } catch (err) {
      this.logger.warn(`enrollRemindersForOrder failed: ${err.message}`);
    }
  }
}

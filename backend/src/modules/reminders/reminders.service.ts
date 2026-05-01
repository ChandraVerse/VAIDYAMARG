import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { SetReminderDto } from './dto/set-reminder.dto';
import { REMINDERS_QUEUE, REMINDER_JOB, DEFAULT_REFILL_DAYS } from './reminders.constants';
import { addDays } from 'date-fns';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectQueue(REMINDERS_QUEUE) private readonly remindersQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------------------------------------------------------------------
  // Patient: create or update a reminder preference
  // ---------------------------------------------------------------------------
  async setReminder(userId: string, dto: SetReminderDto) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id: dto.medicineId },
    });
    if (!medicine) throw new NotFoundException('Medicine not found');

    const intervalDays =
      dto.intervalDays ??
      DEFAULT_REFILL_DAYS[medicine.category] ??
      30;

    const nextRemindAt = addDays(new Date(), intervalDays);

    const reminder = await this.prisma.refillReminder.upsert({
      where: {
        userId_medicineId: { userId, medicineId: dto.medicineId },
      },
      update: {
        intervalDays,
        enabled: dto.enabled ?? true,
        nextRemindAt,
      },
      create: {
        userId,
        medicineId: dto.medicineId,
        intervalDays,
        enabled: true,
        nextRemindAt,
      },
    });

    this.logger.log(
      `Reminder set for user ${userId}, medicine ${medicine.name}, every ${intervalDays}d`,
    );

    return { success: true, data: reminder };
  }

  // ---------------------------------------------------------------------------
  // Patient: list their active reminders
  // ---------------------------------------------------------------------------
  async getReminders(userId: string) {
    const reminders = await this.prisma.refillReminder.findMany({
      where: { userId },
      include: { medicine: { select: { id: true, name: true, category: true, price: true } } },
      orderBy: { nextRemindAt: 'asc' },
    });
    return { success: true, data: reminders };
  }

  // ---------------------------------------------------------------------------
  // Patient: delete a reminder
  // ---------------------------------------------------------------------------
  async deleteReminder(userId: string, reminderId: string) {
    const reminder = await this.prisma.refillReminder.findUnique({
      where: { id: reminderId },
    });
    if (!reminder || reminder.userId !== userId) {
      throw new NotFoundException('Reminder not found');
    }
    await this.prisma.refillReminder.delete({ where: { id: reminderId } });
    return { success: true, message: 'Reminder deleted' };
  }

  // ---------------------------------------------------------------------------
  // Scheduler: enqueue due reminders (called daily by RemindersScheduler)
  // ---------------------------------------------------------------------------
  async enqueueDueReminders(): Promise<number> {
    const now = new Date();

    const due = await this.prisma.refillReminder.findMany({
      where: {
        enabled: true,
        nextRemindAt: { lte: now },
      },
      include: {
        user:     { select: { id: true, name: true } },
        medicine: { select: { id: true, name: true, category: true } },
      },
    });

    let enqueued = 0;
    for (const reminder of due) {
      await this.remindersQueue.add(
        REMINDER_JOB.SEND_REFILL,
        {
          reminderId:   reminder.id,
          userId:       reminder.userId,
          medicineId:   reminder.medicineId,
          medicineName: reminder.medicine.name,
          userName:     reminder.user.name,
          intervalDays: reminder.intervalDays,
        },
        {
          attempts:    3,
          backoff:     { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      enqueued++;
    }

    if (enqueued > 0) {
      this.logger.log(`Enqueued ${enqueued} refill reminder job(s)`);
    }

    return enqueued;
  }

  // ---------------------------------------------------------------------------
  // After a job fires: advance nextRemindAt to the next interval
  // ---------------------------------------------------------------------------
  async advanceReminder(reminderId: string, intervalDays: number) {
    await this.prisma.refillReminder.update({
      where: { id: reminderId },
      data: { nextRemindAt: addDays(new Date(), intervalDays) },
    });
  }

  // ---------------------------------------------------------------------------
  // Auto-enroll: called after an order is delivered for chronic medicines
  // ---------------------------------------------------------------------------
  async autoEnrollFromOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { medicine: true } } },
    });
    if (!order) return;

    const CHRONIC_CATEGORIES = [
      'Antidiabetic', 'Antihypertensive', 'Thyroid',
      'Statin', 'Beta-blocker', 'Antiasthmatic',
    ];

    for (const item of order.items) {
      if (!CHRONIC_CATEGORIES.includes(item.medicine.category)) continue;

      const existing = await this.prisma.refillReminder.findUnique({
        where: { userId_medicineId: { userId, medicineId: item.medicine.id } },
      });

      // Only create if no reminder exists — never overwrite patient's custom settings
      if (!existing) {
        const intervalDays = DEFAULT_REFILL_DAYS[item.medicine.category] ?? 30;
        await this.prisma.refillReminder.create({
          data: {
            userId,
            medicineId: item.medicine.id,
            intervalDays,
            enabled: true,
            nextRemindAt: addDays(new Date(), intervalDays),
          },
        });
        this.logger.log(
          `Auto-enrolled refill reminder: user ${userId}, medicine ${item.medicine.name}`,
        );
      }
    }
  }
}

/** Bull queue name — matches BullModule.registerQueue({ name: 'reminders' }) */
export const REMINDERS_QUEUE = 'reminders';

/** Job types within the reminders queue */
export const REMINDER_JOB = {
  SEND_REFILL:    'send-refill-reminder',
  DIGEST_ENQUEUE: 'digest-enqueue',
} as const;

/** Chronic condition categories that warrant auto-reminders */
export const CHRONIC_CATEGORIES = [
  'Antidiabetic',
  'Antihypertensive',
  'Thyroid',
  'Statin',
  'Beta-blocker',
  'Antiasthmatic',
] as const;

/** Default refill interval in days per category */
export const DEFAULT_REFILL_DAYS: Record<string, number> = {
  Antidiabetic:     30,
  Antihypertensive: 30,
  Thyroid:          30,
  Statin:           30,
  'Beta-blocker':   30,
  Antiasthmatic:    28,
};

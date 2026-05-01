-- VaidyaMarg: RefillReminder table
-- Run via: npx prisma migrate dev --name add_refill_reminders

CREATE TABLE IF NOT EXISTS "RefillReminder" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "medicineId"   TEXT NOT NULL,
    "intervalDays" INTEGER NOT NULL DEFAULT 30,
    "enabled"      BOOLEAN NOT NULL DEFAULT true,
    "nextRemindAt" TIMESTAMP(3) NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefillReminder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefillReminder_userId_medicineId_key"
    ON "RefillReminder"("userId", "medicineId");

ALTER TABLE "RefillReminder"
    ADD CONSTRAINT "RefillReminder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RefillReminder"
    ADD CONSTRAINT "RefillReminder_medicineId_fkey"
    FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

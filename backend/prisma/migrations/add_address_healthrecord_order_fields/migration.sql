-- VaidyaMarg: Add Address, HealthRecord models + Order fields
-- Run via: npx prisma migrate dev --name add_address_healthrecord_order_fields

-- ── Address table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "addresses" (
  "id"        TEXT        NOT NULL,
  "userId"    TEXT        NOT NULL,
  "label"     TEXT,
  "line1"     TEXT        NOT NULL,
  "line2"     TEXT,
  "city"      TEXT        NOT NULL,
  "state"     TEXT        NOT NULL,
  "pincode"   TEXT        NOT NULL,
  "landmark"  TEXT,
  "isDefault" BOOLEAN     NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");

ALTER TABLE "addresses"
  ADD CONSTRAINT "addresses_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── HealthRecord table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "health_records" (
  "id"          TEXT         NOT NULL,
  "userId"      TEXT         NOT NULL,
  "type"        TEXT         NOT NULL,
  "name"        TEXT         NOT NULL,
  "details"     TEXT,
  "severity"    TEXT,
  "diagnosedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "health_records_userId_idx" ON "health_records"("userId");

ALTER TABLE "health_records"
  ADD CONSTRAINT "health_records_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Orders: add addressId FK + genericSavings column ────────────────────────
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "addressId"       TEXT,
  ADD COLUMN IF NOT EXISTS "generic_savings" FLOAT NOT NULL DEFAULT 0;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Users: add avatar, dateOfBirth, gender columns (used by profile service) ─
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "avatar"       TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfBirth"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "gender"       TEXT;

-- Rename fcmToken to fcm_token if not already done
ALTER TABLE "users"
  RENAME COLUMN IF EXISTS "fcmToken" TO "fcm_token";

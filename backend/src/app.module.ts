import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // ── Global config ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate limiting ──────────────────────────────────────────────────────
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // ── Bull / Redis (shared queue connection) ────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // ── Cron / task scheduling ─────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Shared infra ───────────────────────────────────────────────────────
    PrismaModule,

    // ── Feature modules ───────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    MedicinesModule,
    OrdersModule,
    PrescriptionsModule,
    NotificationsModule,
    PharmacyModule,
    RemindersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Global config — reads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting — prevent API abuse
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // 1 minute window
        limit: 100,  // 100 requests per window
      },
    ]),

    // Feature modules will be added here one by one:
    // AuthModule
    // UsersModule
    // MedicinesModule
    // OrdersModule
    // PrescriptionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/**
 * RedisModule
 * -----------
 * Provides a shared ioredis client as the REDIS_CLIENT injection token.
 * Declared @Global() so any module that imports RedisModule once can
 * inject the client without re-importing the module in every feature.
 *
 * Usage in any provider:
 *   constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
 */
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject:  [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const client = new Redis({
          host:     config.get<string>('REDIS_HOST', 'localhost'),
          port:     config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          // Reconnect automatically — critical for production
          retryStrategy: (times) => Math.min(times * 100, 3000),
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          lazyConnect: false,
        });

        client.on('connect',   () => console.log('\x1b[36m[Redis]\x1b[0m Connected'));
        client.on('error',     (e) => console.error('\x1b[31m[Redis]\x1b[0m Error', e.message));
        client.on('reconnecting', () => console.warn('\x1b[33m[Redis]\x1b[0m Reconnecting…'));

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}

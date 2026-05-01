import {
  Injectable,
  Logger,
  InternalServerErrorException,
  TooManyRequestsException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

/** OTP TTL in seconds (10 minutes) */
const OTP_TTL_SECONDS = 600;

/** Rate-limit: max attempts per window */
const MAX_OTP_ATTEMPTS = 5;
const ATTEMPTS_WINDOW_SECONDS = 600; // same 10-min window

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ──────────────────────────────────────────────────────────────────────
  // Generate OTP and store in Redis with 10-minute TTL
  // ──────────────────────────────────────────────────────────────────────
  async generateOtp(phone: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // setEx: atomic SET + EXPIRE in one command
    // Key pattern:  otp:{phone}
    // Overwrites any previous OTP for this number (resend flow)
    await this.redis.setEx(`otp:${phone}`, OTP_TTL_SECONDS, otp);
    return otp;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Verify OTP — single-use, deleted immediately on success
  // ──────────────────────────────────────────────────────────────────────
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const stored = await this.redis.get(`otp:${phone}`);
    if (!stored) return false;       // expired or never generated
    if (stored !== otp) return false;
    // Delete immediately — one-time use
    await this.redis.del(`otp:${phone}`);
    return true;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Rate-limit guard: max 5 OTP sends per phone per 10 minutes
  // Call this BEFORE generateOtp() in auth.service.ts
  // ──────────────────────────────────────────────────────────────────────
  async checkRateLimit(phone: string): Promise<void> {
    const key = `otp_attempts:${phone}`;
    // INCR is atomic — safe across multiple instances
    const attempts = await this.redis.incr(key);
    if (attempts === 1) {
      // First attempt in this window — set the expiry
      await this.redis.expire(key, ATTEMPTS_WINDOW_SECONDS);
    }
    if (attempts > MAX_OTP_ATTEMPTS) {
      const ttl = await this.redis.ttl(key);
      throw new TooManyRequestsException(
        `Too many OTP requests. Try again in ${Math.ceil(ttl / 60)} minute(s).`,
      );
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // Send OTP via SMS (MSG91)
  // ──────────────────────────────────────────────────────────────────────
  async sendSms(phone: string, otp: string): Promise<void> {
    const authKey    = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

    // Dev mode: skip real SMS, log OTP to console
    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.warn(`[DEV] OTP for ${phone}: ${otp}`);
      return;
    }

    try {
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: authKey,
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile:      phone.startsWith('+91') ? phone.slice(1) : `91${phone}`,
          otp,
        }),
      });

      if (!response.ok) {
        throw new Error(`MSG91 responded with ${response.status}: ${response.statusText}`);
      }
      this.logger.log(`OTP SMS dispatched to ${phone}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS: ${error.message}`);
      throw new InternalServerErrorException('Failed to send OTP. Please try again.');
    }
  }
}

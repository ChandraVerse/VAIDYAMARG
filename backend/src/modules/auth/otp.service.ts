import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// In-memory OTP store for MVP (replace with Redis in production)
// Key: phone number | Value: { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly configService: ConfigService) {}

  // Generate a 6-digit OTP and store it
  async generateOtp(phone: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    otpStore.set(phone, { otp, expiresAt });
    return otp;
  }

  // Verify OTP against store
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const record = otpStore.get(phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return false;
    }
    if (record.otp !== otp) return false;
    otpStore.delete(phone); // OTP is one-time use
    return true;
  }

  // Send OTP via SMS (MSG91)
  async sendSms(phone: string, otp: string): Promise<void> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

    // In development mode: just log OTP (skip real SMS)
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.warn(`[DEV MODE] OTP for ${phone}: ${otp}`);
      return;
    }

    // Production: call MSG91 API
    try {
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: authKey,
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: `91${phone}`,
          otp,
        }),
      });

      if (!response.ok) {
        throw new Error(`MSG91 error: ${response.statusText}`);
      }
      this.logger.log(`OTP SMS dispatched to ${phone}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS: ${error.message}`);
      throw new InternalServerErrorException('Failed to send OTP. Please try again.');
    }
  }
}

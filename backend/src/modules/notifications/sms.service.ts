import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey   = process.env.MSG91_API_KEY;
  private readonly senderId = process.env.MSG91_SENDER_ID || 'VAIDYA';
  private readonly isDev    = process.env.NODE_ENV !== 'production';

  // ─── Send SMS (MSG91) ───────────────────────────────────────────────────
  async send(phone: string, message: string): Promise<void> {
    if (this.isDev || !this.apiKey) {
      this.logger.debug(`[DEV SMS] To: +91${phone} | Message: ${message}`);
      return;
    }

    await axios.post(
      'https://api.msg91.com/api/v5/flow/',
      {
        sender: this.senderId,
        short_url: '0',
        mobiles: `91${phone}`,
        message,
      },
      {
        headers: {
          authkey: this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    this.logger.log(`SMS sent to +91${phone}`);
  }

  // ─── Send OTP (MSG91 OTP flow) ────────────────────────────────────────────
  async sendOtp(phone: string, otp: string): Promise<void> {
    if (this.isDev || !this.apiKey) {
      this.logger.debug(`[DEV OTP] +91${phone} → OTP: ${otp}`);
      return;
    }

    await axios.post(
      'https://api.msg91.com/api/v5/flow/',
      {
        flow_id: process.env.MSG91_OTP_FLOW_ID,
        sender: this.senderId,
        mobiles: `91${phone}`,
        OTP: otp,
      },
      {
        headers: { authkey: this.apiKey, 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    this.logger.log(`OTP sent to +91${phone}`);
  }
}

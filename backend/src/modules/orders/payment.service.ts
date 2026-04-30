import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', '');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', '');
  }

  getKeyId(): string {
    return this.keyId;
  }

  // -------------------------------------------------------
  // Create Razorpay Order
  // -------------------------------------------------------
  async createOrder(amountInRupees: number): Promise<any> {
    const amountInPaise = Math.round(amountInRupees * 100);

    // In development: return a mock Razorpay order
    if (!this.keyId || this.keyId.startsWith('rzp_test_xxx')) {
      this.logger.warn('[DEV MODE] Returning mock Razorpay order');
      return {
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      };
    }

    try {
      const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `vaidya_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Razorpay error: ${err}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`);
      throw new InternalServerErrorException('Payment service unavailable. Please try again.');
    }
  }

  // -------------------------------------------------------
  // Verify Razorpay Signature
  // -------------------------------------------------------
  verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }
}

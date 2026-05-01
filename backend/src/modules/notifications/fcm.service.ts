import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * FCM Push Notification Service
 *
 * Uses the Firebase Admin SDK (firebase-admin) to send push notifications
 * to Android and iOS devices via Firebase Cloud Messaging.
 *
 * Install: npm install firebase-admin  (in /backend)
 * Set env: FIREBASE_SERVICE_ACCOUNT_JSON='{...json...}' or a path to the JSON file.
 */
@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private messaging: any;

  constructor(private readonly config: ConfigService) {
    this._init();
  }

  private _init() {
    try {
      // Dynamic import so the app still boots if firebase-admin is not yet installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const admin = require('firebase-admin');

      if (admin.apps.length === 0) {
        const raw = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
        if (!raw) {
          this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — FCM disabled');
          return;
        }

        const serviceAccount = typeof raw === 'string' && raw.trim().startsWith('{')
          ? JSON.parse(raw)
          : raw; // allow file path

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      this.messaging = admin.messaging();
      this.logger.log('Firebase Admin SDK initialised — FCM ready');
    } catch (err) {
      this.logger.warn(`FCM init failed (firebase-admin not installed?): ${err}`);
    }
  }

  /**
   * Send a push notification to a single FCM token.
   */
  async sendToToken(opts: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    if (!this.messaging) {
      this.logger.warn('FCM not initialised — skipping push notification');
      return;
    }

    try {
      await this.messaging.send({
        token: opts.token,
        notification: { title: opts.title, body: opts.body },
        data: opts.data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'vaidyamarg_orders' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
      this.logger.log(`FCM sent to token ${opts.token.slice(0, 12)}...`);
    } catch (err) {
      this.logger.error(`FCM send failed: ${err}`);
    }
  }

  /**
   * Send to multiple tokens (multicast).
   */
  async sendMulticast(opts: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    if (!this.messaging || !opts.tokens.length) return;

    try {
      await this.messaging.sendEachForMulticast({
        tokens:       opts.tokens,
        notification: { title: opts.title, body: opts.body },
        data:         opts.data ?? {},
      });
    } catch (err) {
      this.logger.error(`FCM multicast failed: ${err}`);
    }
  }
}

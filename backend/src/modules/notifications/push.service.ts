import { Injectable, Logger } from '@nestjs/common';

// We use firebase-admin for push notifications
// Install: npm install firebase-admin
let admin: any;
try {
  admin = require('firebase-admin');
} catch {
  // firebase-admin not installed yet — safe fallback
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private initialized = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    if (!admin) return;
    if (admin.apps.length > 0) { this.initialized = true; return; }

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled');
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
      this.initialized = true;
      this.logger.log('Firebase initialized successfully');
    } catch (err) {
      this.logger.error(`Firebase init failed: ${err.message}`);
    }
  }

  // ─── Send push to single device ───────────────────────────────────────────
  async send(
    fcmToken: string,
    title: string,
    body: string,
    data: Record<string, any> = {},
  ): Promise<void> {
    if (!this.initialized || !admin) {
      this.logger.debug(`[DEV PUSH] ${title}: ${body}`);
      return;
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)]),
      ),
      android: {
        priority: 'high' as const,
        notification: { sound: 'default', channelId: 'vaidyamarg_orders' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    await admin.messaging().send(message);
    this.logger.log(`Push sent: "${title}"`);
  }

  // ─── Send push to multiple devices ──────────────────────────────────────
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, any> = {},
  ): Promise<void> {
    if (!this.initialized || !admin || tokens.length === 0) return;

    const message = {
      tokens,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)]),
      ),
      android: { priority: 'high' as const },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    this.logger.log(`Multicast push: ${response.successCount}/${tokens.length} delivered`);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService, NotificationType } from '../notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SmsService } from '../sms.service';
import { PushService } from '../push.service';

// ── Shared mocks ─────────────────────────────────────────────────────────────
const mockPrisma = {
  notification: {
    create:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    count:      jest.fn(),
    update:     jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update:     jest.fn(),
  },
};

const mockPush = { send: jest.fn() };
const mockSms  = { send: jest.fn() };

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PushService,   useValue: mockPush },
        { provide: SmsService,    useValue: mockSms },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  // ── send() ─────────────────────────────────────────────────────────────────
  describe('send()', () => {
    const userId = 'user-uuid-1';

    it('saves notification to DB', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: null, phone: null });

      await service.send(userId, NotificationType.ORDER_PLACED, { orderId: 'abc123', amount: 250 });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId, type: NotificationType.ORDER_PLACED }),
        }),
      );
    });

    it('sends push notification when fcmToken is present', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({
        fcmToken: 'fcm-token-abc',
        phone: null,
      });
      mockPush.send.mockResolvedValue(undefined);

      await service.send(userId, NotificationType.ORDER_CONFIRMED, { orderId: 'abc123' });

      expect(mockPush.send).toHaveBeenCalledWith(
        'fcm-token-abc',
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
    });

    it('does NOT send push when fcmToken is absent', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: null, phone: null });

      await service.send(userId, NotificationType.ORDER_CONFIRMED, { orderId: 'abc123' });

      expect(mockPush.send).not.toHaveBeenCalled();
    });

    it('sends SMS for ORDER_DISPATCHED when phone is present', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({
        fcmToken: null,
        phone: '+919876543210',
      });
      mockSms.send.mockResolvedValue(undefined);

      await service.send(userId, NotificationType.ORDER_DISPATCHED, { orderId: 'abc123' });

      expect(mockSms.send).toHaveBeenCalledWith('+919876543210', expect.any(String));
    });

    it('does NOT send SMS for non-critical event (ORDER_PACKED)', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({
        fcmToken: null,
        phone: '+919876543210',
      });

      await service.send(userId, NotificationType.ORDER_PACKED, { orderId: 'abc123' });

      expect(mockSms.send).not.toHaveBeenCalled();
    });

    it('does not throw even when push fails', async () => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: 'bad-token', phone: null });
      mockPush.send.mockRejectedValue(new Error('FCM quota exceeded'));

      await expect(
        service.send(userId, NotificationType.PRESCRIPTION_VERIFIED, {}),
      ).resolves.not.toThrow();
    });

    it('does not throw even when DB create fails', async () => {
      mockPrisma.notification.create.mockRejectedValue(new Error('DB connection lost'));
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: null, phone: null });

      await expect(
        service.send(userId, NotificationType.PAYMENT_SUCCESS, { orderId: 'x', amount: 100 }),
      ).resolves.not.toThrow();
    });
  });

  // ── getNotifications() ─────────────────────────────────────────────────────
  describe('getNotifications()', () => {
    it('returns paginated notifications in desc order', async () => {
      const fakeNotifs = [
        { id: 'n1', type: NotificationType.ORDER_PLACED, isRead: false },
        { id: 'n2', type: NotificationType.ORDER_CONFIRMED, isRead: true },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(fakeNotifs);

      const result = await service.getNotifications('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });
  });

  // ── getUnreadCount() ───────────────────────────────────────────────────────
  describe('getUnreadCount()', () => {
    it('returns correct unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('user-1');

      expect(result.data.unreadCount).toBe(3);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
      });
    });
  });

  // ── markAsRead() ───────────────────────────────────────────────────────────
  describe('markAsRead()', () => {
    it('marks a notification as read', async () => {
      const fakeNotif = { id: 'n1', userId: 'user-1' };
      mockPrisma.notification.findUnique.mockResolvedValue(fakeNotif);
      mockPrisma.notification.update.mockResolvedValue({});

      const result = await service.markAsRead('user-1', 'n1');

      expect(result.success).toBe(true);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'n1' } }),
      );
    });

    it('throws NotFoundException when notification does not exist', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('user-1', 'missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when notification belongs to different user', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 'n1', userId: 'other-user' });

      await expect(service.markAsRead('user-1', 'n1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── markAllRead() ──────────────────────────────────────────────────────────
  describe('markAllRead()', () => {
    it('marks all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllRead('user-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: expect.objectContaining({ isRead: true }),
      });
    });
  });

  // ── registerFcmToken() ────────────────────────────────────────────────────
  describe('registerFcmToken()', () => {
    it('updates user fcmToken in DB', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.registerFcmToken('user-1', 'new-fcm-token');

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { fcmToken: 'new-fcm-token' },
      });
    });
  });

  // ── Template coverage ─────────────────────────────────────────────────────
  describe('Notification templates', () => {
    const userId = 'tmpl-user';

    beforeEach(() => {
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: null, phone: null });
    });

    const cases: [NotificationType, Record<string, any>][] = [
      [NotificationType.ORDER_PLACED,            { orderId: 'abc123', amount: 500 }],
      [NotificationType.ORDER_CONFIRMED,         { orderId: 'abc123' }],
      [NotificationType.ORDER_PACKED,            { orderId: 'abc123' }],
      [NotificationType.ORDER_DISPATCHED,        { orderId: 'abc123' }],
      [NotificationType.ORDER_DELIVERED,         { orderId: 'abc123', savings: 50 }],
      [NotificationType.ORDER_CANCELLED,         { orderId: 'abc123' }],
      [NotificationType.PRESCRIPTION_VERIFIED,   {}],
      [NotificationType.PRESCRIPTION_REJECTED,   { reason: 'Blurry image' }],
      [NotificationType.LOW_STOCK_ALERT,         { medicineName: 'Metformin', stock: 5 }],
      [NotificationType.PAYMENT_SUCCESS,         { orderId: 'abc123', amount: 250 }],
      [NotificationType.REFILL_REMINDER,         { medicineName: 'Omeprazole' }],
    ];

    it.each(cases)('sends %s without throwing', async (type, data) => {
      await expect(service.send(userId, type, data)).resolves.not.toThrow();
    });
  });
});

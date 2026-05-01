import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from '../reminders.service';
import { getQueueToken } from '@nestjs/bull';
import { REMINDERS_QUEUE } from '../reminders.constants';

const mockPrisma = {
  medicine: {
    findUnique: jest.fn(),
  },
  refillReminder: {
    upsert:     jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    delete:     jest.fn(),
    update:     jest.fn(),
    create:     jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
  },
};

const mockQueue = { add: jest.fn() };

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: 'PrismaService', useValue: mockPrisma },
        { provide: getQueueToken(REMINDERS_QUEUE), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setReminder', () => {
    it('should throw NotFoundException if medicine does not exist', async () => {
      mockPrisma.medicine.findUnique.mockResolvedValue(null);
      await expect(
        service.setReminder('user-1', { medicineId: 'invalid-id' }),
      ).rejects.toThrow('Medicine not found');
    });

    it('should upsert reminder with correct intervalDays', async () => {
      mockPrisma.medicine.findUnique.mockResolvedValue({
        id: 'med-1', name: 'Metformin', category: 'Antidiabetic',
      });
      mockPrisma.refillReminder.upsert.mockResolvedValue({ id: 'rem-1', intervalDays: 30 });

      const result = await service.setReminder('user-1', {
        medicineId: 'med-1',
        intervalDays: 30,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.refillReminder.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('enqueueDueReminders', () => {
    it('should enqueue one job per due reminder', async () => {
      mockPrisma.refillReminder.findMany.mockResolvedValue([
        {
          id: 'rem-1', userId: 'u1', medicineId: 'm1', intervalDays: 30,
          user: { id: 'u1', name: 'Ravi' },
          medicine: { id: 'm1', name: 'Metformin', category: 'Antidiabetic' },
        },
      ]);

      const count = await service.enqueueDueReminders();
      expect(count).toBe(1);
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-refill-reminder',
        expect.objectContaining({ userId: 'u1', medicineName: 'Metformin' }),
        expect.any(Object),
      );
    });

    it('should return 0 and not call queue.add when no due reminders', async () => {
      mockPrisma.refillReminder.findMany.mockResolvedValue([]);
      const count = await service.enqueueDueReminders();
      expect(count).toBe(0);
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });
});

/**
 * VaidyaMarg — Prisma Seed File
 * ================================
 * Run:  npx prisma db seed
 *   or: make seed
 *
 * Prerequisites in package.json:
 *   "prisma": { "seed": "ts-node --project tsconfig.json prisma/seed.ts" }
 *
 * All passwords are bcrypt hashes of: Password@123
 * Safe to re-run — uses upsert throughout.
 */

import { PrismaClient, Role, PharmacyStatus, OrderStatus, PaymentStatus,
         PrescriptionStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const HASH = bcrypt.hashSync('Password@123', 10);

// ────────────────────────────────────────────────────────────────────────────
const USERS = [
  {
    id:         'seed-admin-001',
    phone:      '+919000000001',
    name:       'VaidyaMarg Admin',
    email:      'admin@vaidyamarg.in',
    role:       Role.ADMIN,
    isVerified: true,
    isActive:   true,
    address:    '10 MG Road',
    city:       'Bengaluru',
    state:      'Karnataka',
    pincode:    '560001',
  },
  {
    id:         'seed-pharmacist-001',
    phone:      '+919000000002',
    name:       'Ramesh Gupta',
    email:      'ramesh@apollo.pharmacy',
    role:       Role.PHARMACIST,
    isVerified: true,
    isActive:   true,
    address:    '22 Park Street',
    city:       'Kolkata',
    state:      'West Bengal',
    pincode:    '700016',
  },
  {
    id:         'seed-patient-001',
    phone:      '+919000000003',
    name:       'Priya Sharma',
    email:      'priya.sharma@gmail.com',
    role:       Role.PATIENT,
    isVerified: true,
    isActive:   true,
    address:    '7 Nehru Nagar',
    city:       'Jaipur',
    state:      'Rajasthan',
    pincode:    '302001',
  },
  {
    id:         'seed-patient-002',
    phone:      '+919000000004',
    name:       'Arjun Mehta',
    email:      'arjun.mehta@outlook.com',
    role:       Role.PATIENT,
    isVerified: true,
    isActive:   true,
    address:    '3 Connaught Place',
    city:       'New Delhi',
    state:      'Delhi',
    pincode:    '110001',
  },
  {
    id:         'seed-patient-003',
    phone:      '+919000000005',
    name:       'Sunita Patel',
    email:      'sunita.patel@yahoo.com',
    role:       Role.PATIENT,
    isVerified: false,
    isActive:   true,
    address:    '15 CG Road',
    city:       'Ahmedabad',
    state:      'Gujarat',
    pincode:    '380009',
  },
];

// ────────────────────────────────────────────────────────────────────────────
const MEDICINES = [
  // — Antibiotics—
  { id: 'seed-med-001', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin',
    brandName: 'Mox', manufacturer: 'Ranbaxy', category: 'Antibiotic',
    dosageForm: 'Capsule', strength: '500mg', mrp: 85, genericPrice: 32,
    discount: 10, stock: 500, requiresRx: true, isActive: true },
  { id: 'seed-med-002', name: 'Azithromycin 500mg', genericName: 'Azithromycin',
    brandName: 'Azee', manufacturer: 'Cipla', category: 'Antibiotic',
    dosageForm: 'Tablet', strength: '500mg', mrp: 110, genericPrice: 42,
    discount: 12, stock: 300, requiresRx: true, isActive: true },
  { id: 'seed-med-003', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl',
    brandName: 'Zyrtec', manufacturer: 'UCB India', category: 'Antihistamine',
    dosageForm: 'Tablet', strength: '10mg', mrp: 38, genericPrice: 12,
    discount: 5, stock: 800, requiresRx: false, isActive: true },

  // — Cardiac —
  { id: 'seed-med-004', name: 'Atenolol 50mg', genericName: 'Atenolol',
    brandName: 'Tenormin', manufacturer: 'AstraZeneca', category: 'Cardiac',
    dosageForm: 'Tablet', strength: '50mg', mrp: 55, genericPrice: 20,
    discount: 8, stock: 600, requiresRx: true, isActive: true },
  { id: 'seed-med-005', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate',
    brandName: 'Amlip', manufacturer: 'Cipla', category: 'Cardiac',
    dosageForm: 'Tablet', strength: '5mg', mrp: 45, genericPrice: 15,
    discount: 10, stock: 700, requiresRx: true, isActive: true },
  { id: 'seed-med-006', name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin',
    brandName: 'Rozavel', manufacturer: 'Sun Pharma', category: 'Cardiac',
    dosageForm: 'Tablet', strength: '10mg', mrp: 120, genericPrice: 48,
    discount: 15, stock: 400, requiresRx: true, isActive: true },

  // — Diabetic —
  { id: 'seed-med-007', name: 'Metformin 500mg', genericName: 'Metformin HCl',
    brandName: 'Glycomet', manufacturer: 'USV', category: 'Diabetic',
    dosageForm: 'Tablet', strength: '500mg', mrp: 35, genericPrice: 10,
    discount: 5, stock: 1000, requiresRx: true, isActive: true },
  { id: 'seed-med-008', name: 'Glimepiride 2mg', genericName: 'Glimepiride',
    brandName: 'Amaryl', manufacturer: 'Sanofi', category: 'Diabetic',
    dosageForm: 'Tablet', strength: '2mg', mrp: 75, genericPrice: 28,
    discount: 10, stock: 500, requiresRx: true, isActive: true },
  { id: 'seed-med-009', name: 'Sitagliptin 100mg', genericName: 'Sitagliptin Phosphate',
    brandName: 'Januvia', manufacturer: 'MSD', category: 'Diabetic',
    dosageForm: 'Tablet', strength: '100mg', mrp: 280, genericPrice: 95,
    discount: 18, stock: 200, requiresRx: true, isActive: true },

  // — Analgesic / Pain —
  { id: 'seed-med-010', name: 'Paracetamol 500mg', genericName: 'Paracetamol',
    brandName: 'Calpol', manufacturer: 'GSK', category: 'Analgesic',
    dosageForm: 'Tablet', strength: '500mg', mrp: 28, genericPrice: 8,
    discount: 5, stock: 2000, requiresRx: false, isActive: true },
  { id: 'seed-med-011', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen',
    brandName: 'Brufen', manufacturer: 'Abbott', category: 'Analgesic',
    dosageForm: 'Tablet', strength: '400mg', mrp: 42, genericPrice: 14,
    discount: 8, stock: 1200, requiresRx: false, isActive: true },
  { id: 'seed-med-012', name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium',
    brandName: 'Voveran', manufacturer: 'Novartis', category: 'Analgesic',
    dosageForm: 'Tablet', strength: '50mg', mrp: 38, genericPrice: 12,
    discount: 5, stock: 900, requiresRx: false, isActive: true },

  // — GI —
  { id: 'seed-med-013', name: 'Omeprazole 20mg', genericName: 'Omeprazole',
    brandName: 'Omez', manufacturer: 'Dr. Reddy\'s', category: 'GI',
    dosageForm: 'Capsule', strength: '20mg', mrp: 52, genericPrice: 18,
    discount: 10, stock: 800, requiresRx: false, isActive: true },
  { id: 'seed-med-014', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium',
    brandName: 'Pan-D', manufacturer: 'Alkem', category: 'GI',
    dosageForm: 'Tablet', strength: '40mg', mrp: 65, genericPrice: 22,
    discount: 12, stock: 700, requiresRx: false, isActive: true },
  { id: 'seed-med-015', name: 'Ondansetron 4mg', genericName: 'Ondansetron HCl',
    brandName: 'Emeset', manufacturer: 'Cipla', category: 'GI',
    dosageForm: 'Tablet', strength: '4mg', mrp: 48, genericPrice: 16,
    discount: 8, stock: 600, requiresRx: false, isActive: true },

  // — Vitamins / Supplements —
  { id: 'seed-med-016', name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol',
    brandName: 'Calcirol', manufacturer: 'Cadila', category: 'Vitamins',
    dosageForm: 'Capsule', strength: '60000 IU', mrp: 95, genericPrice: 38,
    discount: 5, stock: 500, requiresRx: false, isActive: true },
  { id: 'seed-med-017', name: 'Calcium + D3 500mg', genericName: 'Calcium Carbonate + Vit D3',
    brandName: 'Shelcal', manufacturer: 'Torrent', category: 'Vitamins',
    dosageForm: 'Tablet', strength: '500mg', mrp: 78, genericPrice: 28,
    discount: 5, stock: 600, requiresRx: false, isActive: true },
  { id: 'seed-med-018', name: 'Multivitamin Daily', genericName: 'Multivitamin + Mineral',
    brandName: 'Supradyn', manufacturer: 'Bayer', category: 'Vitamins',
    dosageForm: 'Tablet', strength: 'Standard', mrp: 145, genericPrice: 58,
    discount: 10, stock: 400, requiresRx: false, isActive: true },
  { id: 'seed-med-019', name: 'Folic Acid 5mg', genericName: 'Folic Acid',
    brandName: 'Folvite', manufacturer: 'Pfizer', category: 'Vitamins',
    dosageForm: 'Tablet', strength: '5mg', mrp: 22, genericPrice: 7,
    discount: 0, stock: 800, requiresRx: false, isActive: true },
  { id: 'seed-med-020', name: 'Zinc 50mg', genericName: 'Zinc Sulphate',
    brandName: 'Zincovit', manufacturer: 'Apex', category: 'Vitamins',
    dosageForm: 'Tablet', strength: '50mg', mrp: 35, genericPrice: 12,
    discount: 0, stock: 700, requiresRx: false, isActive: true },
];

// ────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding VaidyaMarg database…\n');

  // ── 1. USERS ────────────────────────────────────────────────────────────────────
  console.log('  → Users…');
  for (const u of USERS) {
    await prisma.user.upsert({
      where:  { id: u.id },
      update: {},
      create: { ...u, password: HASH } as any,
    });
  }
  console.log(`     ✓ ${USERS.length} users`);

  // ── 2. PHARMACY PARTNER ────────────────────────────────────────────────────────
  console.log('  → Pharmacy…');
  const pharmacy = await prisma.pharmacy.upsert({
    where:  { id: 'seed-pharmacy-001' },
    update: {},
    create: {
      id:            'seed-pharmacy-001',
      ownerId:       'seed-pharmacist-001',
      name:          'Apollo Pharmacy — Park Street',
      licenseNumber: 'WB-KOL-2024-00123',
      gstNumber:     '19AABCA1234F1Z5',
      email:         'parkstreet@apollo.pharmacy',
      phone:         '+919000000002',
      address:       '22 Park Street',
      city:          'Kolkata',
      state:         'West Bengal',
      pincode:       '700016',
      status:        PharmacyStatus.APPROVED,
      approvedById:  'seed-admin-001',
      approvedAt:    new Date('2024-11-01'),
      isActive:      true,
      operatingHours:'09:00–21:00',
      deliveryRadius: 8,
      commissionRate: 10,
    },
  });
  console.log(`     ✓ Pharmacy: ${pharmacy.name}`);

  // ── 3. MEDICINES ──────────────────────────────────────────────────────────────────
  console.log('  → Medicines…');
  for (const m of MEDICINES) {
    await prisma.medicine.upsert({
      where:  { id: m.id },
      update: { stock: m.stock },
      create: m,
    });
  }
  console.log(`     ✓ ${MEDICINES.length} medicines`);

  // ── 4. PRESCRIPTIONS ─────────────────────────────────────────────────────────────
  console.log('  → Prescriptions…');
  await prisma.prescription.upsert({
    where:  { id: 'seed-rx-001' },
    update: {},
    create: {
      id:          'seed-rx-001',
      userId:      'seed-patient-001',
      imageUrl:    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      status:      PrescriptionStatus.VERIFIED,
      fileType:    'image/jpeg',
      fileName:    'prescription_priya.jpg',
      fileSize:    204800,
      doctorName:  'Dr. Anjali Singh',
      patientName: 'Priya Sharma',
      issuedDate:  new Date('2025-12-01'),
      verifiedById:'seed-admin-001',
      verifiedAt:  new Date('2025-12-02'),
      ocrResult:   'Amoxicillin 500mg - 1 capsule TDS x 5 days',
    },
  });
  await prisma.prescription.upsert({
    where:  { id: 'seed-rx-002' },
    update: {},
    create: {
      id:          'seed-rx-002',
      userId:      'seed-patient-002',
      imageUrl:    'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
      status:      PrescriptionStatus.PENDING,
      fileType:    'image/png',
      fileName:    'prescription_arjun.png',
      fileSize:    512000,
      doctorName:  'Dr. Rajan Verma',
      patientName: 'Arjun Mehta',
      issuedDate:  new Date('2026-01-10'),
    },
  });
  console.log('     ✓ 2 prescriptions');

  // ── 5. ORDERS ─────────────────────────────────────────────────────────────────────
  console.log('  → Orders…');

  // Order 1: DELIVERED (Priya)
  const order1 = await prisma.order.upsert({
    where:  { id: 'seed-order-001' },
    update: {},
    create: {
      id:              'seed-order-001',
      userId:          'seed-patient-001',
      prescriptionId:  'seed-rx-001',
      status:          OrderStatus.DELIVERED,
      totalAmount:     290,
      deliveryAddress: '7 Nehru Nagar, Jaipur, Rajasthan 302001',
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_001',
      createdAt:       new Date('2025-12-10'),
      updatedAt:       new Date('2025-12-12'),
    },
  });
  // Items for order 1
  for (const [medId, qty, unit] of [
    ['seed-med-001', 2, 85],
    ['seed-med-010', 3, 28],
    ['seed-med-016', 1, 95],
  ] as [string, number, number][]) {
    await prisma.orderItem.upsert({
      where:  { id: `${order1.id}-${medId}` },
      update: {},
      create: {
        id:         `${order1.id}-${medId}`,
        orderId:    order1.id,
        medicineId: medId,
        quantity:   qty,
        unitPrice:  unit,
        totalPrice: qty * unit,
      },
    });
  }

  // Order 2: PROCESSING (Arjun)
  const order2 = await prisma.order.upsert({
    where:  { id: 'seed-order-002' },
    update: {},
    create: {
      id:              'seed-order-002',
      userId:          'seed-patient-002',
      status:          OrderStatus.PROCESSING,
      totalAmount:     195,
      deliveryAddress: '3 Connaught Place, New Delhi, Delhi 110001',
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_002',
      createdAt:       new Date('2026-04-28'),
      updatedAt:       new Date('2026-04-29'),
    },
  });
  for (const [medId, qty, unit] of [
    ['seed-med-007', 3, 35],
    ['seed-med-004', 2, 55],
  ] as [string, number, number][]) {
    await prisma.orderItem.upsert({
      where:  { id: `${order2.id}-${medId}` },
      update: {},
      create: {
        id:         `${order2.id}-${medId}`,
        orderId:    order2.id,
        medicineId: medId,
        quantity:   qty,
        unitPrice:  unit,
        totalPrice: qty * unit,
      },
    });
  }

  // Order 3: PENDING (Sunita)
  const order3 = await prisma.order.upsert({
    where:  { id: 'seed-order-003' },
    update: {},
    create: {
      id:              'seed-order-003',
      userId:          'seed-patient-003',
      status:          OrderStatus.PENDING,
      totalAmount:     213,
      deliveryAddress: '15 CG Road, Ahmedabad, Gujarat 380009',
      paymentStatus:   PaymentStatus.PENDING,
      createdAt:       new Date('2026-05-01'),
      updatedAt:       new Date('2026-05-01'),
    },
  });
  for (const [medId, qty, unit] of [
    ['seed-med-013', 2, 52],
    ['seed-med-018', 1, 145],
  ] as [string, number, number][]) {
    await prisma.orderItem.upsert({
      where:  { id: `${order3.id}-${medId}` },
      update: {},
      create: {
        id:         `${order3.id}-${medId}`,
        orderId:    order3.id,
        medicineId: medId,
        quantity:   qty,
        unitPrice:  unit,
        totalPrice: qty * unit,
      },
    });
  }
  console.log('     ✓ 3 orders + 7 order items');

  // ── 6. PHARMACY EARNINGS ─────────────────────────────────────────────────────────
  console.log('  → Pharmacy earnings…');
  await prisma.pharmacyEarning.upsert({
    where:  { id: 'seed-earn-001' },
    update: {},
    create: {
      id:          'seed-earn-001',
      pharmacyId:  'seed-pharmacy-001',
      orderId:     'seed-order-001',
      orderAmount: 290,
      commission:  29,   // 10%
      netEarning:  261,
      settledAt:   new Date('2025-12-15'),
      createdAt:   new Date('2025-12-12'),
    },
  });
  await prisma.pharmacyEarning.upsert({
    where:  { id: 'seed-earn-002' },
    update: {},
    create: {
      id:          'seed-earn-002',
      pharmacyId:  'seed-pharmacy-001',
      orderId:     'seed-order-002',
      orderAmount: 195,
      commission:  19.5,
      netEarning:  175.5,
      settledAt:   null, // pending settlement
      createdAt:   new Date('2026-04-29'),
    },
  });
  console.log('     ✓ 2 pharmacy earnings');

  // ── 7. NOTIFICATIONS ───────────────────────────────────────────────────────────
  console.log('  → Notifications…');
  const notifs = [
    {
      id: 'seed-notif-001', userId: 'seed-patient-001',
      type: NotificationType.ORDER_DELIVERED,
      title: '🎉 Order Delivered!',
      body:  'Order #ORDER-001 delivered. You saved ₹58 with generics!',
      isRead: true, readAt: new Date('2025-12-13'),
      createdAt: new Date('2025-12-12'),
    },
    {
      id: 'seed-notif-002', userId: 'seed-patient-002',
      type: NotificationType.ORDER_PLACED,
      title: '🛒 Order Placed!',
      body:  'Your order #ORDER-002 has been placed. Total: ₹195',
      isRead: false,
      createdAt: new Date('2026-04-28'),
    },
    {
      id: 'seed-notif-003', userId: 'seed-patient-001',
      type: NotificationType.REFILL_REMINDER,
      title: '💊 Medicine Refill Reminder',
      body:  'Time to refill Amoxicillin 500mg! Order now and save with generics.',
      isRead: false,
      createdAt: new Date('2026-01-10'),
    },
  ];
  for (const n of notifs) {
    await prisma.notification.upsert({
      where:  { id: n.id },
      update: {},
      create: n as any,
    });
  }
  console.log('     ✓ 3 notifications');

  // ── 8. REFILL REMINDERS ──────────────────────────────────────────────────────────
  console.log('  → Refill reminders…');
  await prisma.refillReminder.upsert({
    where:  { userId_medicineId: { userId: 'seed-patient-001', medicineId: 'seed-med-001' } },
    update: {},
    create: {
      id:            'seed-reminder-001',
      userId:        'seed-patient-001',
      medicineId:    'seed-med-001',
      intervalDays:  30,
      enabled:       true,
      nextRemindAt:  new Date('2026-06-01'),
      createdAt:     new Date('2025-12-12'),
    },
  });
  await prisma.refillReminder.upsert({
    where:  { userId_medicineId: { userId: 'seed-patient-001', medicineId: 'seed-med-016' } },
    update: {},
    create: {
      id:            'seed-reminder-002',
      userId:        'seed-patient-001',
      medicineId:    'seed-med-016',
      intervalDays:  90,
      enabled:       true,
      nextRemindAt:  new Date('2026-07-15'),
      createdAt:     new Date('2025-12-12'),
    },
  });
  console.log('     ✓ 2 refill reminders');

  console.log('\n✅ Seed complete!\n');
  console.log('Test credentials (all passwords: Password@123)');
  console.log('  admin@vaidyamarg.in      — ADMIN');
  console.log('  ramesh@apollo.pharmacy   — PHARMACIST (partner)');
  console.log('  priya.sharma@gmail.com   — PATIENT (verified, has delivered order)');
  console.log('  arjun.mehta@outlook.com  — PATIENT (verified, has active order)');
  console.log('  sunita.patel@yahoo.com   — PATIENT (not verified, pending order)\n');
}

main()
  .catch((e) => { console.error('\n❌ Seed failed:\n', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

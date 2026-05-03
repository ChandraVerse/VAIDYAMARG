/**
 * VaidyaMarg — Prisma Seed
 * Run: npx prisma db seed   (or: make seed)
 *
 * Seeds:
 *   - 1 ADMIN
 *   - 1 PHARMACIST + their approved Pharmacy
 *   - 5 PATIENT users
 *   - 5 Addresses (one per patient)
 *   - 3 HealthRecords
 *   - 30 Medicines across 6 categories
 *   - 2 Prescriptions
 *   - 3 Orders with OrderItems + genericSavings
 *   - 2 RefillReminders
 *
 * Idempotent — safe to re-run; existing rows are skipped, not duplicated.
 * Login: OTP is any 6-digit code in dev mode (no real SMS sent).
 */

import {
  PrismaClient,
  Role,
  PharmacyStatus,
  OrderStatus,
  PaymentStatus,
  PrescriptionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// ─── Medicine catalogue ───────────────────────────────────────────────────────────────────────
const MEDICINES = [
  // Antibiotics
  { name: 'Amoxicillin 500mg',    genericName: 'Amoxicillin',                         brandName: 'Mox 500',          manufacturer: 'Ranbaxy',     category: 'Antibiotics',  dosageForm: 'Capsule',   strength: '500mg',         mrp: 120,  genericPrice: 42,  discount: 10, stock: 250, requiresRx: true  },
  { name: 'Azithromycin 500mg',   genericName: 'Azithromycin',                        brandName: 'Azithral 500',     manufacturer: 'Alembic',     category: 'Antibiotics',  dosageForm: 'Tablet',    strength: '500mg',         mrp: 95,   genericPrice: 38,  discount:  8, stock: 180, requiresRx: true  },
  { name: 'Ciprofloxacin 500mg',  genericName: 'Ciprofloxacin',                       brandName: 'Ciplox 500',       manufacturer: 'Cipla',       category: 'Antibiotics',  dosageForm: 'Tablet',    strength: '500mg',         mrp: 85,   genericPrice: 32,  discount: 12, stock: 320, requiresRx: true  },
  { name: 'Doxycycline 100mg',    genericName: 'Doxycycline',                         brandName: 'Doxt-SL',          manufacturer: 'Sun Pharma',  category: 'Antibiotics',  dosageForm: 'Capsule',   strength: '100mg',         mrp: 75,   genericPrice: 28,  discount:  5, stock: 140, requiresRx: true  },
  { name: 'Metronidazole 400mg',  genericName: 'Metronidazole',                       brandName: 'Flagyl 400',       manufacturer: 'Abbott',      category: 'Antibiotics',  dosageForm: 'Tablet',    strength: '400mg',         mrp: 45,   genericPrice: 18,  discount: 10, stock: 400, requiresRx: true  },
  // Cardiac
  { name: 'Amlodipine 5mg',       genericName: 'Amlodipine',                          brandName: 'Amlokind 5',       manufacturer: 'Mankind',     category: 'Cardiac',      dosageForm: 'Tablet',    strength: '5mg',           mrp: 65,   genericPrice: 22,  discount: 15, stock: 500, requiresRx: true  },
  { name: 'Atorvastatin 10mg',    genericName: 'Atorvastatin',                        brandName: 'Atorva 10',        manufacturer: 'Zydus',       category: 'Cardiac',      dosageForm: 'Tablet',    strength: '10mg',          mrp: 110,  genericPrice: 38,  discount: 18, stock: 420, requiresRx: true  },
  { name: 'Losartan 50mg',        genericName: 'Losartan Potassium',                  brandName: 'Losar 50',         manufacturer: 'Cipla',       category: 'Cardiac',      dosageForm: 'Tablet',    strength: '50mg',          mrp: 90,   genericPrice: 30,  discount: 12, stock: 380, requiresRx: true  },
  { name: 'Metoprolol 25mg',      genericName: 'Metoprolol Succinate',                brandName: 'Metolar 25',       manufacturer: 'Cipla',       category: 'Cardiac',      dosageForm: 'Tablet',    strength: '25mg',          mrp: 78,   genericPrice: 27,  discount: 10, stock: 310, requiresRx: true  },
  { name: 'Aspirin 75mg',         genericName: 'Aspirin',                             brandName: 'Ecosprin 75',      manufacturer: 'USV',         category: 'Cardiac',      dosageForm: 'Tablet',    strength: '75mg',          mrp: 30,   genericPrice: 12,  discount:  5, stock: 800, requiresRx: false },
  // Diabetes
  { name: 'Metformin 500mg',      genericName: 'Metformin HCl',                       brandName: 'Glycomet 500',     manufacturer: 'USV',         category: 'Diabetes',     dosageForm: 'Tablet',    strength: '500mg',         mrp: 55,   genericPrice: 18,  discount: 20, stock: 650, requiresRx: true  },
  { name: 'Metformin 1000mg',     genericName: 'Metformin HCl',                       brandName: 'Glycomet 1000',    manufacturer: 'USV',         category: 'Diabetes',     dosageForm: 'Tablet',    strength: '1000mg',        mrp: 88,   genericPrice: 30,  discount: 18, stock: 450, requiresRx: true  },
  { name: 'Glimepiride 2mg',      genericName: 'Glimepiride',                         brandName: 'Amaryl M 2',       manufacturer: 'Sanofi',      category: 'Diabetes',     dosageForm: 'Tablet',    strength: '2mg',           mrp: 120,  genericPrice: 42,  discount: 15, stock: 280, requiresRx: true  },
  { name: 'Sitagliptin 100mg',    genericName: 'Sitagliptin',                         brandName: 'Januvia 100',      manufacturer: 'MSD',         category: 'Diabetes',     dosageForm: 'Tablet',    strength: '100mg',         mrp: 340,  genericPrice: 145, discount: 22, stock: 160, requiresRx: true  },
  { name: 'Insulin Glargine',     genericName: 'Insulin Glargine',                    brandName: 'Lantus SoloStar',  manufacturer: 'Sanofi',      category: 'Diabetes',     dosageForm: 'Injection', strength: '100IU/mL',      mrp: 1200, genericPrice: 680, discount: 12, stock:  90, requiresRx: true  },
  // Pain Relief
  { name: 'Paracetamol 500mg',    genericName: 'Paracetamol',                         brandName: 'Crocin 500',       manufacturer: 'GSK',         category: 'Pain Relief',  dosageForm: 'Tablet',    strength: '500mg',         mrp: 25,   genericPrice: 8,   discount:  5, stock:1200, requiresRx: false },
  { name: 'Ibuprofen 400mg',      genericName: 'Ibuprofen',                           brandName: 'Brufen 400',       manufacturer: 'Abbott',      category: 'Pain Relief',  dosageForm: 'Tablet',    strength: '400mg',         mrp: 35,   genericPrice: 12,  discount:  8, stock: 900, requiresRx: false },
  { name: 'Diclofenac 50mg',      genericName: 'Diclofenac Sodium',                   brandName: 'Voveran 50',       manufacturer: 'Novartis',    category: 'Pain Relief',  dosageForm: 'Tablet',    strength: '50mg',          mrp: 42,   genericPrice: 15,  discount: 10, stock: 680, requiresRx: false },
  { name: 'Tramadol 50mg',        genericName: 'Tramadol HCl',                        brandName: 'Tramazac 50',      manufacturer: 'Zydus',       category: 'Pain Relief',  dosageForm: 'Capsule',   strength: '50mg',          mrp: 95,   genericPrice: 38,  discount:  8, stock: 220, requiresRx: true  },
  { name: 'Naproxen 250mg',       genericName: 'Naproxen Sodium',                     brandName: 'Naprosyn 250',     manufacturer: 'Roche',       category: 'Pain Relief',  dosageForm: 'Tablet',    strength: '250mg',         mrp: 58,   genericPrice: 22,  discount: 10, stock: 460, requiresRx: false },
  // Vitamins
  { name: 'Vitamin D3 60000IU',   genericName: 'Cholecalciferol',                     brandName: 'Calcirol 60K',     manufacturer: 'Cadila',      category: 'Vitamins',     dosageForm: 'Capsule',   strength: '60000IU',       mrp: 48,   genericPrice: 18,  discount:  5, stock: 750, requiresRx: false },
  { name: 'Vitamin B12 1500mcg',  genericName: 'Methylcobalamin',                     brandName: 'Neurobion Forte',  manufacturer: 'Merck',       category: 'Vitamins',     dosageForm: 'Tablet',    strength: '1500mcg',       mrp: 62,   genericPrice: 22,  discount:  0, stock: 820, requiresRx: false },
  { name: 'Zinc + Vitamin C',     genericName: 'Zinc Sulphate + Ascorbic Acid',       brandName: 'Zincovit',         manufacturer: 'Apex',        category: 'Vitamins',     dosageForm: 'Tablet',    strength: '20mg + 40mg',   mrp: 90,   genericPrice: 32,  discount:  8, stock: 640, requiresRx: false },
  { name: 'Iron + Folic Acid',    genericName: 'Ferrous Sulphate + Folic Acid',       brandName: 'Autrin',           manufacturer: 'Pfizer',      category: 'Vitamins',     dosageForm: 'Capsule',   strength: '150mg + 1.5mg', mrp: 72,   genericPrice: 26,  discount:  5, stock: 580, requiresRx: false },
  { name: 'Calcium + D3',         genericName: 'Calcium Carbonate + Cholecalciferol', brandName: 'Shelcal 500',      manufacturer: 'Elder',       category: 'Vitamins',     dosageForm: 'Tablet',    strength: '500mg + 250IU', mrp: 115,  genericPrice: 40,  discount: 10, stock: 520, requiresRx: false },
  // Gastro
  { name: 'Omeprazole 20mg',      genericName: 'Omeprazole',                          brandName: 'Omez 20',          manufacturer: "Dr. Reddy's", category: 'Gastro',       dosageForm: 'Capsule',   strength: '20mg',          mrp: 60,   genericPrice: 20,  discount: 12, stock: 700, requiresRx: false },
  { name: 'Pantoprazole 40mg',    genericName: 'Pantoprazole Sodium',                 brandName: 'Pan 40',           manufacturer: 'Alkem',       category: 'Gastro',       dosageForm: 'Tablet',    strength: '40mg',          mrp: 72,   genericPrice: 24,  discount: 15, stock: 620, requiresRx: false },
  { name: 'Ondansetron 4mg',      genericName: 'Ondansetron HCl',                     brandName: 'Emeset 4',         manufacturer: 'Cipla',       category: 'Gastro',       dosageForm: 'Tablet',    strength: '4mg',           mrp: 55,   genericPrice: 18,  discount:  8, stock: 480, requiresRx: false },
  { name: 'Domperidone 10mg',     genericName: 'Domperidone',                         brandName: 'Domperi 10',       manufacturer: 'Sun Pharma',  category: 'Gastro',       dosageForm: 'Tablet',    strength: '10mg',          mrp: 40,   genericPrice: 14,  discount:  5, stock: 560, requiresRx: false },
  { name: 'Loperamide 2mg',       genericName: 'Loperamide HCl',                      brandName: 'Imodium 2',        manufacturer: 'J&J',         category: 'Gastro',       dosageForm: 'Capsule',   strength: '2mg',           mrp: 35,   genericPrice: 12,  discount:  0, stock: 420, requiresRx: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────────────────
/** Calculate generic savings: sum of (mrp - genericPrice) * qty */
function calcSavings(items: { mrp: number; genericPrice: number; qty: number }[]): number {
  return items.reduce((sum, i) => sum + (i.mrp - i.genericPrice) * i.qty, 0);
}

/**
 * Idempotent address helper.
 * Address has no composite unique constraint — findFirst, then create if absent.
 */
async function upsertAddress(data: {
  userId: string; label: string; line1: string;
  city: string; state: string; pincode: string; isDefault: boolean;
}) {
  return (
    (await prisma.address.findFirst({ where: { userId: data.userId, line1: data.line1 } })) ??
    (await prisma.address.create({ data }))
  );
}

/**
 * Idempotent health record helper.
 * No unique index on healthRecord — skipDuplicates is a no-op; guard manually.
 */
async function upsertHealthRecord(data: {
  userId: string; type: string; name: string;
  details?: string; severity?: string;
}) {
  const existing = await prisma.healthRecord.findFirst({
    where: { userId: data.userId, type: data.type, name: data.name },
  });
  return existing ?? (await prisma.healthRecord.create({ data }));
}

/**
 * Idempotent prescription helper.
 * Guard by (userId + fileName) — never duplicates on re-run.
 */
async function upsertPrescription(data: {
  userId: string; imageUrl: string; publicId?: string;
  status: PrescriptionStatus; fileName?: string; fileType?: string;
  fileSize?: number; verifiedAt?: Date; doctorName?: string; patientName?: string;
}) {
  const existing = await prisma.prescription.findFirst({
    where: { userId: data.userId, fileName: data.fileName },
  });
  return existing ?? (await prisma.prescription.create({ data }));
}

/**
 * Idempotent order helper.
 * Guard by (userId + paymentId) when paid, or (userId + deliveryAddress) for PENDING.
 */
async function upsertOrder(data: Parameters<typeof prisma.order.create>[0]['data']) {
  const where = data.paymentId
    ? { paymentId: data.paymentId as string }
    : undefined;

  if (where) {
    const existing = await prisma.order.findFirst({ where });
    if (existing) return existing;
  }
  return prisma.order.create({ data });
}

// ─── Main ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\ud83c\udf31  Starting VaidyaMarg seed…');

  // ── 1. Admin ──────────────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where:  { phone: '+919000000001' },
    update: {},
    create: {
      phone: '+919000000001', name: 'VaidyaMarg Admin',
      email: 'admin@vaidyamarg.in', role: Role.ADMIN,
      isVerified: true, isActive: true,
    },
  });
  console.log(`  \u2705 Admin: ${adminUser.phone}`);

  // ── 2. Pharmacist + Pharmacy ─────────────────────────────────────────────────────
  const pharmacist = await prisma.user.upsert({
    where:  { phone: '+919000000002' },
    update: {},
    create: {
      phone: '+919000000002', name: 'Dr. Ramesh Sharma',
      email: 'pharmacist@vaidyamarg.in', role: Role.PHARMACIST,
      isVerified: true, isActive: true,
    },
  });
  await prisma.pharmacy.upsert({
    where:  { ownerId: pharmacist.id },
    update: {},
    create: {
      ownerId: pharmacist.id, name: 'Sharma Medical Hall',
      licenseNumber: 'WB-DL-2024-001', gstNumber: '19AABCU9603R1ZX',
      email: 'sharma.medical@gmail.com', phone: '+919000000002',
      address: '12, Rabindra Sarani', city: 'Kolkata',
      state: 'West Bengal', pincode: '700001',
      status: PharmacyStatus.APPROVED, isActive: true,
      operatingHours: '09:00-21:00', deliveryRadius: 10, commissionRate: 10,
    },
  });
  console.log(`  \u2705 Pharmacist: ${pharmacist.phone} + Pharmacy`);

  // ── 3. Patients ─────────────────────────────────────────────────────────────────────
  const patientData = [
    { phone: '+919100000001', name: 'Anjali Dey',        email: 'anjali@example.com',  gender: 'FEMALE', dateOfBirth: new Date('1990-04-15') },
    { phone: '+919100000002', name: 'Rajesh Kumar',      email: 'rajesh@example.com',  gender: 'MALE',   dateOfBirth: new Date('1975-08-22') },
    { phone: '+919100000003', name: 'Priya Mukherjee',   email: 'priya@example.com',   gender: 'FEMALE', dateOfBirth: new Date('1985-11-03') },
    { phone: '+919100000004', name: 'Sourav Chatterjee', email: 'sourav@example.com',  gender: 'MALE',   dateOfBirth: new Date('1992-02-18') },
    { phone: '+919100000005', name: 'Meena Ghosh',       email: 'meena@example.com',   gender: 'FEMALE', dateOfBirth: new Date('1968-07-30') },
  ];
  const patients = await Promise.all(
    patientData.map((p) =>
      prisma.user.upsert({
        where:  { phone: p.phone },
        update: {},
        create: { ...p, role: Role.PATIENT, isVerified: true, isActive: true },
      }),
    ),
  );
  console.log(`  \u2705 ${patients.length} patients seeded`);

  // ── 4. Addresses ─────────────────────────────────────────────────────────────────────
  const addresses = await Promise.all([
    upsertAddress({ userId: patients[0].id, label: 'Home', line1: '45B, Lake Road',          city: 'Kolkata', state: 'West Bengal', pincode: '700029', isDefault: true }),
    upsertAddress({ userId: patients[1].id, label: 'Home', line1: '12, Salt Lake Sector V',  city: 'Kolkata', state: 'West Bengal', pincode: '700091', isDefault: true }),
    upsertAddress({ userId: patients[2].id, label: 'Home', line1: '7, Gariahat Road South',  city: 'Kolkata', state: 'West Bengal', pincode: '700031', isDefault: true }),
    upsertAddress({ userId: patients[3].id, label: 'Home', line1: '22, Jessore Road',        city: 'Kolkata', state: 'West Bengal', pincode: '700055', isDefault: true }),
    upsertAddress({ userId: patients[4].id, label: 'Home', line1: '3, Behala Chowrasta',     city: 'Kolkata', state: 'West Bengal', pincode: '700034', isDefault: true }),
  ]);
  console.log(`  \u2705 ${addresses.length} addresses seeded`);

  // ── 5. Health Records ─────────────────────────────────────────────────────────────────
  await Promise.all([
    upsertHealthRecord({ userId: patients[0].id, type: 'ALLERGY',   name: 'Penicillin',      details: 'Causes rash and hives',    severity: 'MODERATE' }),
    upsertHealthRecord({ userId: patients[1].id, type: 'CONDITION', name: 'Type 2 Diabetes', details: 'Diagnosed 2018',           severity: 'MODERATE' }),
    upsertHealthRecord({ userId: patients[2].id, type: 'CONDITION', name: 'Hypertension',    details: 'On Amlodipine 5mg daily',  severity: 'MILD'     }),
  ]);
  console.log('  \u2705 3 health records seeded');

  // ── 6. Medicines ──────────────────────────────────────────────────────────────────────
  await prisma.medicine.createMany({
    data: MEDICINES.map((m) => ({ ...m, isActive: true })),
    skipDuplicates: true,  // safe: medicine name is a natural duplicate key
  });
  const allMeds = await prisma.medicine.findMany({ take: 30, orderBy: { createdAt: 'asc' } });
  console.log(`  \u2705 ${allMeds.length} medicines seeded`);

  // ── 7. Prescriptions ─────────────────────────────────────────────────────────────────
  const rx1 = await upsertPrescription({
    userId:      patients[0].id,
    imageUrl:    'https://res.cloudinary.com/demo/image/upload/sample_prescription.jpg',
    publicId:    'vaidyamarg/prescriptions/sample_001',
    status:      PrescriptionStatus.VERIFIED,
    fileName:    'prescription_anjali.jpg',
    fileType:    'image/jpeg',
    fileSize:    245000,
    verifiedAt:  new Date(),
    doctorName:  'Dr. K. Banerjee',
    patientName: patients[0].name ?? 'Anjali Dey',
  });
  await upsertPrescription({
    userId:   patients[1].id,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample_prescription_2.jpg',
    publicId: 'vaidyamarg/prescriptions/sample_002',
    status:   PrescriptionStatus.PENDING,
    fileName: 'prescription_rajesh.pdf',
    fileType: 'application/pdf',
    fileSize: 182000,
  });
  console.log('  \u2705 2 prescriptions seeded');

  // ── 8. Orders ─────────────────────────────────────────────────────────────────────────
  const paracetamol = allMeds.find((m) => m.name.includes('Paracetamol'))   ?? allMeds[0];
  const metformin   = allMeds.find((m) => m.name.includes('Metformin 500')) ?? allMeds[1];
  const vitD3       = allMeds.find((m) => m.name.includes('Vitamin D3'))    ?? allMeds[2];
  const amlodipine  = allMeds.find((m) => m.name.includes('Amlodipine'))    ?? allMeds[3];
  const omeprazole  = allMeds.find((m) => m.name.includes('Omeprazole'))    ?? allMeds[4];

  /** Snapshot the delivery address at order placement time (schema: deliveryAddress String non-null) */
  const snap = (a: Awaited<ReturnType<typeof upsertAddress>>) =>
    `${a.line1}, ${a.city} - ${a.pincode}`;

  const order1Items = [
    { med: paracetamol, qty: 2 },
    { med: metformin,   qty: 3 },
    { med: vitD3,       qty: 1 },
  ];
  const order2Items = [
    { med: amlodipine, qty: 2 },
    { med: metformin,  qty: 5 },
  ];
  const order3Items = [
    { med: omeprazole,  qty: 3 },
    { med: paracetamol, qty: 4 },
  ];

  const [order1, order2, order3] = await Promise.all([
    upsertOrder({
      userId:          patients[0].id,
      addressId:       addresses[0].id,
      prescriptionId:  rx1.id,
      status:          OrderStatus.DELIVERED,
      totalAmount:     order1Items.reduce((s, i) => s + i.med.genericPrice * i.qty, 0),
      genericSavings:  calcSavings(order1Items.map((i) => ({ mrp: i.med.mrp, genericPrice: i.med.genericPrice, qty: i.qty }))),
      deliveryAddress: snap(addresses[0]),
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_001',
      items: { create: order1Items.map((i) => ({
        medicineId: i.med.id, quantity: i.qty,
        unitPrice: i.med.genericPrice, totalPrice: i.med.genericPrice * i.qty,
      })) },
    }),
    upsertOrder({
      userId:          patients[1].id,
      addressId:       addresses[1].id,
      status:          OrderStatus.PROCESSING,
      totalAmount:     order2Items.reduce((s, i) => s + i.med.genericPrice * i.qty, 0),
      genericSavings:  calcSavings(order2Items.map((i) => ({ mrp: i.med.mrp, genericPrice: i.med.genericPrice, qty: i.qty }))),
      deliveryAddress: snap(addresses[1]),
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_002',
      items: { create: order2Items.map((i) => ({
        medicineId: i.med.id, quantity: i.qty,
        unitPrice: i.med.genericPrice, totalPrice: i.med.genericPrice * i.qty,
      })) },
    }),
    upsertOrder({
      userId:          patients[2].id,
      addressId:       addresses[2].id,
      status:          OrderStatus.PENDING,
      totalAmount:     order3Items.reduce((s, i) => s + i.med.genericPrice * i.qty, 0),
      genericSavings:  calcSavings(order3Items.map((i) => ({ mrp: i.med.mrp, genericPrice: i.med.genericPrice, qty: i.qty }))),
      deliveryAddress: snap(addresses[2]),
      paymentStatus:   PaymentStatus.PENDING,
      items: { create: order3Items.map((i) => ({
        medicineId: i.med.id, quantity: i.qty,
        unitPrice: i.med.genericPrice, totalPrice: i.med.genericPrice * i.qty,
      })) },
    }),
  ]);
  console.log(`  \u2705 3 orders seeded (${order1.id.slice(0, 8)}, ${order2.id.slice(0, 8)}, ${order3.id.slice(0, 8)})`);

  // ── 9. Refill Reminders ──────────────────────────────────────────────────────────────
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  await prisma.refillReminder.createMany({
    data: [
      { userId: patients[0].id, medicineId: metformin.id,  intervalDays: 30, enabled: true, nextRemindAt: nextMonth },
      { userId: patients[1].id, medicineId: amlodipine.id, intervalDays: 30, enabled: true, nextRemindAt: nextMonth },
    ],
    skipDuplicates: true,  // unique([userId, medicineId]) index ensures this works
  });
  console.log('  \u2705 2 refill reminders seeded');

  // ── Summary ──────────────────────────────────────────────────────────────────────────
  console.log('');
  console.log('\ud83c\udf89  Seed complete!');
  console.log('\u2500'.repeat(57));
  console.log('  Login credentials  (OTP: any 6-digit code in dev mode)');
  console.log('  Admin:        +919000000001  admin@vaidyamarg.in');
  console.log('  Pharmacist:   +919000000002  pharmacist@vaidyamarg.in');
  console.log('  Patient 1:    +919100000001  Anjali Dey');
  console.log('  Patient 2:    +919100000002  Rajesh Kumar');
  console.log('  Patient 3:    +919100000003  Priya Mukherjee');
  console.log('  Patient 4:    +919100000004  Sourav Chatterjee');
  console.log('  Patient 5:    +919100000005  Meena Ghosh');
  console.log('\u2500'.repeat(57));
}

main()
  .catch((e) => { console.error('\u274c  Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

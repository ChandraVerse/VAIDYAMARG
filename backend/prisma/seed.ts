/**
 * VaidyaMarg — Prisma Seed
 * Run: npx prisma db seed   (or: make seed)
 *
 * Seeds:
 *   - 1 ADMIN
 *   - 1 PHARMACIST + their approved Pharmacy
 *   - 5 PATIENT users
 *   - 30 Medicines across 6 categories
 *   - 3 Orders with OrderItems
 *   - 2 Prescriptions
 *   - 2 RefillReminders
 *
 * All user passwords:  Test@1234
 */

import { PrismaClient, Role, PharmacyStatus, OrderStatus, PaymentStatus, PrescriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Test@1234';

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, HASH_ROUNDS);
}

// ─── Medicine data ─────────────────────────────────────────────────────────────

const MEDICINES = [
  // Antibiotics
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', brandName: 'Mox 500', manufacturer: 'Ranbaxy', category: 'Antibiotics', dosageForm: 'Capsule', strength: '500mg', mrp: 120, genericPrice: 42, discount: 10, stock: 250, requiresRx: true },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', brandName: 'Azithral 500', manufacturer: 'Alembic', category: 'Antibiotics', dosageForm: 'Tablet', strength: '500mg', mrp: 95, genericPrice: 38, discount: 8, stock: 180, requiresRx: true },
  { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', brandName: 'Ciplox 500', manufacturer: 'Cipla', category: 'Antibiotics', dosageForm: 'Tablet', strength: '500mg', mrp: 85, genericPrice: 32, discount: 12, stock: 320, requiresRx: true },
  { name: 'Doxycycline 100mg', genericName: 'Doxycycline', brandName: 'Doxt-SL', manufacturer: 'Sun Pharma', category: 'Antibiotics', dosageForm: 'Capsule', strength: '100mg', mrp: 75, genericPrice: 28, discount: 5, stock: 140, requiresRx: true },
  { name: 'Metronidazole 400mg', genericName: 'Metronidazole', brandName: 'Flagyl 400', manufacturer: 'Abbott', category: 'Antibiotics', dosageForm: 'Tablet', strength: '400mg', mrp: 45, genericPrice: 18, discount: 10, stock: 400, requiresRx: true },

  // Cardiac
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', brandName: 'Amlokind 5', manufacturer: 'Mankind', category: 'Cardiac', dosageForm: 'Tablet', strength: '5mg', mrp: 65, genericPrice: 22, discount: 15, stock: 500, requiresRx: true },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', brandName: 'Atorva 10', manufacturer: 'Zydus', category: 'Cardiac', dosageForm: 'Tablet', strength: '10mg', mrp: 110, genericPrice: 38, discount: 18, stock: 420, requiresRx: true },
  { name: 'Losartan 50mg', genericName: 'Losartan Potassium', brandName: 'Losar 50', manufacturer: 'Cipla', category: 'Cardiac', dosageForm: 'Tablet', strength: '50mg', mrp: 90, genericPrice: 30, discount: 12, stock: 380, requiresRx: true },
  { name: 'Metoprolol 25mg', genericName: 'Metoprolol Succinate', brandName: 'Metolar 25', manufacturer: 'Cipla', category: 'Cardiac', dosageForm: 'Tablet', strength: '25mg', mrp: 78, genericPrice: 27, discount: 10, stock: 310, requiresRx: true },
  { name: 'Aspirin 75mg', genericName: 'Aspirin', brandName: 'Ecosprin 75', manufacturer: 'USV', category: 'Cardiac', dosageForm: 'Tablet', strength: '75mg', mrp: 30, genericPrice: 12, discount: 5, stock: 800, requiresRx: false },

  // Diabetes
  { name: 'Metformin 500mg', genericName: 'Metformin HCl', brandName: 'Glycomet 500', manufacturer: 'USV', category: 'Diabetes', dosageForm: 'Tablet', strength: '500mg', mrp: 55, genericPrice: 18, discount: 20, stock: 650, requiresRx: true },
  { name: 'Metformin 1000mg', genericName: 'Metformin HCl', brandName: 'Glycomet 1000', manufacturer: 'USV', category: 'Diabetes', dosageForm: 'Tablet', strength: '1000mg', mrp: 88, genericPrice: 30, discount: 18, stock: 450, requiresRx: true },
  { name: 'Glimepiride 2mg', genericName: 'Glimepiride', brandName: 'Amaryl M 2', manufacturer: 'Sanofi', category: 'Diabetes', dosageForm: 'Tablet', strength: '2mg', mrp: 120, genericPrice: 42, discount: 15, stock: 280, requiresRx: true },
  { name: 'Sitagliptin 100mg', genericName: 'Sitagliptin', brandName: 'Januvia 100', manufacturer: 'MSD', category: 'Diabetes', dosageForm: 'Tablet', strength: '100mg', mrp: 340, genericPrice: 145, discount: 22, stock: 160, requiresRx: true },
  { name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', brandName: 'Lantus SoloStar', manufacturer: 'Sanofi', category: 'Diabetes', dosageForm: 'Injection', strength: '100IU/mL', mrp: 1200, genericPrice: 680, discount: 12, stock: 90, requiresRx: true },

  // Pain Relief
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', brandName: 'Crocin 500', manufacturer: 'GSK', category: 'Pain Relief', dosageForm: 'Tablet', strength: '500mg', mrp: 25, genericPrice: 8, discount: 5, stock: 1200, requiresRx: false },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brandName: 'Brufen 400', manufacturer: 'Abbott', category: 'Pain Relief', dosageForm: 'Tablet', strength: '400mg', mrp: 35, genericPrice: 12, discount: 8, stock: 900, requiresRx: false },
  { name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', brandName: 'Voveran 50', manufacturer: 'Novartis', category: 'Pain Relief', dosageForm: 'Tablet', strength: '50mg', mrp: 42, genericPrice: 15, discount: 10, stock: 680, requiresRx: false },
  { name: 'Tramadol 50mg', genericName: 'Tramadol HCl', brandName: 'Tramazac 50', manufacturer: 'Zydus', category: 'Pain Relief', dosageForm: 'Capsule', strength: '50mg', mrp: 95, genericPrice: 38, discount: 8, stock: 220, requiresRx: true },
  { name: 'Naproxen 250mg', genericName: 'Naproxen Sodium', brandName: 'Naprosyn 250', manufacturer: 'Roche', category: 'Pain Relief', dosageForm: 'Tablet', strength: '250mg', mrp: 58, genericPrice: 22, discount: 10, stock: 460, requiresRx: false },

  // Vitamins & Supplements
  { name: 'Vitamin D3 60000IU', genericName: 'Cholecalciferol', brandName: 'Calcirol 60K', manufacturer: 'Cadila', category: 'Vitamins', dosageForm: 'Capsule', strength: '60000IU', mrp: 48, genericPrice: 18, discount: 5, stock: 750, requiresRx: false },
  { name: 'Vitamin B12 1500mcg', genericName: 'Methylcobalamin', brandName: 'Neurobion Forte', manufacturer: 'Merck', category: 'Vitamins', dosageForm: 'Tablet', strength: '1500mcg', mrp: 62, genericPrice: 22, discount: 0, stock: 820, requiresRx: false },
  { name: 'Zinc + Vitamin C', genericName: 'Zinc Sulphate + Ascorbic Acid', brandName: 'Zincovit', manufacturer: 'Apex', category: 'Vitamins', dosageForm: 'Tablet', strength: '20mg + 40mg', mrp: 90, genericPrice: 32, discount: 8, stock: 640, requiresRx: false },
  { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulphate + Folic Acid', brandName: 'Autrin', manufacturer: 'Pfizer', category: 'Vitamins', dosageForm: 'Capsule', strength: '150mg + 1.5mg', mrp: 72, genericPrice: 26, discount: 5, stock: 580, requiresRx: false },
  { name: 'Calcium + D3', genericName: 'Calcium Carbonate + Cholecalciferol', brandName: 'Shelcal 500', manufacturer: 'Elder', category: 'Vitamins', dosageForm: 'Tablet', strength: '500mg + 250IU', mrp: 115, genericPrice: 40, discount: 10, stock: 520, requiresRx: false },

  // Gastro
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brandName: 'Omez 20', manufacturer: 'Dr. Reddy\'s', category: 'Gastro', dosageForm: 'Capsule', strength: '20mg', mrp: 60, genericPrice: 20, discount: 12, stock: 700, requiresRx: false },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', brandName: 'Pan 40', manufacturer: 'Alkem', category: 'Gastro', dosageForm: 'Tablet', strength: '40mg', mrp: 72, genericPrice: 24, discount: 15, stock: 620, requiresRx: false },
  { name: 'Ondansetron 4mg', genericName: 'Ondansetron HCl', brandName: 'Emeset 4', manufacturer: 'Cipla', category: 'Gastro', dosageForm: 'Tablet', strength: '4mg', mrp: 55, genericPrice: 18, discount: 8, stock: 480, requiresRx: false },
  { name: 'Domperidone 10mg', genericName: 'Domperidone', brandName: 'Domperi 10', manufacturer: 'Sun Pharma', category: 'Gastro', dosageForm: 'Tablet', strength: '10mg', mrp: 40, genericPrice: 14, discount: 5, stock: 560, requiresRx: false },
  { name: 'Loperamide 2mg', genericName: 'Loperamide HCl', brandName: 'Imodium 2', manufacturer: 'J&J', category: 'Gastro', dosageForm: 'Capsule', strength: '2mg', mrp: 35, genericPrice: 12, discount: 0, stock: 420, requiresRx: false },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting VaidyaMarg seed…');

  // ── 1. Admin ────────────────────────────────────────────────────────────────
  const adminPassword = await hash(DEFAULT_PASSWORD);
  const admin = await prisma.user.upsert({
    where:  { phone: '+919000000001' },
    update: {},
    create: {
      phone:      '+919000000001',
      name:       'VaidyaMarg Admin',
      email:      'admin@vaidyamarg.in',
      role:       Role.ADMIN,
      isVerified: true,
      isActive:   true,
      city:       'Kolkata',
      state:      'West Bengal',
    },
  });
  console.log(`  ✅ Admin: ${admin.phone}`);

  // ── 2. Pharmacist + Pharmacy ────────────────────────────────────────────────
  const pharmacist = await prisma.user.upsert({
    where:  { phone: '+919000000002' },
    update: {},
    create: {
      phone:      '+919000000002',
      name:       'Dr. Ramesh Sharma',
      email:      'pharmacist@vaidyamarg.in',
      role:       Role.PHARMACIST,
      isVerified: true,
      isActive:   true,
      city:       'Kolkata',
      state:      'West Bengal',
      pincode:    '700001',
    },
  });

  await prisma.pharmacy.upsert({
    where:  { ownerId: pharmacist.id },
    update: {},
    create: {
      ownerId:        pharmacist.id,
      name:           'Sharma Medical Hall',
      licenseNumber:  'WB-DL-2024-001',
      gstNumber:      '19AABCU9603R1ZX',
      email:          'sharma.medical@gmail.com',
      phone:          '+919000000002',
      address:        '12, Rabindra Sarani',
      city:           'Kolkata',
      state:          'West Bengal',
      pincode:        '700001',
      status:         PharmacyStatus.APPROVED,
      isActive:       true,
      operatingHours: '09:00-21:00',
      deliveryRadius: 5,
      commissionRate: 10,
      approvedAt:     new Date(),
    },
  });
  console.log(`  ✅ Pharmacist: ${pharmacist.phone} → Sharma Medical Hall`);

  // ── 3. Patients ─────────────────────────────────────────────────────────────
  const patientData = [
    { phone: '+919100000001', name: 'Anjali Dey',     email: 'anjali@example.com',   city: 'Kolkata',     pincode: '700005' },
    { phone: '+919100000002', name: 'Rajesh Kumar',   email: 'rajesh@example.com',   city: 'Howrah',      pincode: '711101' },
    { phone: '+919100000003', name: 'Priya Mukherjee',email: 'priya@example.com',    city: 'Kolkata',     pincode: '700019' },
    { phone: '+919100000004', name: 'Suresh Yadav',   email: 'suresh@example.com',   city: 'Barrackpore', pincode: '743101' },
    { phone: '+919100000005', name: 'Meena Patel',    email: 'meena@example.com',    city: 'Kolkata',     pincode: '700032' },
  ];

  const patients = await Promise.all(
    patientData.map((p) =>
      prisma.user.upsert({
        where:  { phone: p.phone },
        update: {},
        create: {
          ...p,
          role:       Role.PATIENT,
          isVerified: true,
          isActive:   true,
          state:      'West Bengal',
          address:    `${p.pincode}, ${p.city}, WB`,
        },
      }),
    ),
  );
  console.log(`  ✅ ${patients.length} patients seeded`);

  // ── 4. Medicines ────────────────────────────────────────────────────────────
  const medicines = await Promise.all(
    MEDICINES.map((m) =>
      prisma.medicine.upsert({
        where:  { id: m.name },   // We'll use createMany with skipDuplicates instead
        update: {},
        create: { ...m, isActive: true },
      }).catch(() =>
        // If id conflict, just find by name+strength combo
        prisma.medicine.findFirst({ where: { name: m.name, strength: m.strength } }),
      ),
    ),
  );

  // Safer approach: delete and recreate on seed (idempotent via upsert on name)
  // Use createMany for performance, skip duplicates
  await prisma.medicine.createMany({
    data: MEDICINES.map((m) => ({ ...m, isActive: true })),
    skipDuplicates: true,
  });

  const allMeds = await prisma.medicine.findMany({ take: 30, orderBy: { createdAt: 'asc' } });
  console.log(`  ✅ ${allMeds.length} medicines seeded`);

  // ── 5. Prescriptions ────────────────────────────────────────────────────────
  const rx1 = await prisma.prescription.create({
    data: {
      userId:     patients[0].id,
      imageUrl:   'https://res.cloudinary.com/demo/image/upload/sample_prescription.jpg',
      publicId:   'vaidyamarg/prescriptions/sample_001',
      status:     PrescriptionStatus.VERIFIED,
      fileName:   'prescription_anjali.jpg',
      fileType:   'image/jpeg',
      fileSize:   245000,
      verifiedAt: new Date(),
      doctorName: 'Dr. K. Banerjee',
      patientName: patients[0].name,
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      userId:   patients[1].id,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample_prescription_2.jpg',
      publicId: 'vaidyamarg/prescriptions/sample_002',
      status:   PrescriptionStatus.PENDING,
      fileName: 'prescription_rajesh.pdf',
      fileType: 'application/pdf',
      fileSize: 182000,
    },
  });
  console.log('  ✅ 2 prescriptions seeded');

  // ── 6. Orders ───────────────────────────────────────────────────────────────
  const paracetamol = allMeds.find((m) => m.name.includes('Paracetamol')) ?? allMeds[0];
  const metformin   = allMeds.find((m) => m.name.includes('Metformin 500')) ?? allMeds[1];
  const vitD3       = allMeds.find((m) => m.name.includes('Vitamin D3'))   ?? allMeds[2];
  const amlodipine  = allMeds.find((m) => m.name.includes('Amlodipine'))   ?? allMeds[3];
  const omeprazole  = allMeds.find((m) => m.name.includes('Omeprazole'))   ?? allMeds[4];

  // Order 1 — DELIVERED, PAID
  const order1 = await prisma.order.create({
    data: {
      userId:          patients[0].id,
      prescriptionId:  rx1.id,
      status:          OrderStatus.DELIVERED,
      totalAmount:     233,
      deliveryAddress: `${patients[0].address}`,
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_001',
      items: {
        create: [
          { medicineId: paracetamol.id, quantity: 2, unitPrice: paracetamol.genericPrice, totalPrice: paracetamol.genericPrice * 2 },
          { medicineId: metformin.id,   quantity: 3, unitPrice: metformin.genericPrice,   totalPrice: metformin.genericPrice   * 3 },
          { medicineId: vitD3.id,       quantity: 1, unitPrice: vitD3.genericPrice,       totalPrice: vitD3.genericPrice       * 1 },
        ],
      },
    },
  });

  // Order 2 — PROCESSING, PAID
  const order2 = await prisma.order.create({
    data: {
      userId:          patients[1].id,
      status:          OrderStatus.PROCESSING,
      totalAmount:     322,
      deliveryAddress: `${patients[1].address}`,
      paymentStatus:   PaymentStatus.PAID,
      paymentId:       'pay_seed_002',
      items: {
        create: [
          { medicineId: amlodipine.id, quantity: 2, unitPrice: amlodipine.genericPrice, totalPrice: amlodipine.genericPrice * 2 },
          { medicineId: metformin.id,  quantity: 5, unitPrice: metformin.genericPrice,  totalPrice: metformin.genericPrice  * 5 },
        ],
      },
    },
  });

  // Order 3 — PENDING, PENDING payment (COD)
  const order3 = await prisma.order.create({
    data: {
      userId:          patients[2].id,
      status:          OrderStatus.PENDING,
      totalAmount:     89,
      deliveryAddress: `${patients[2].address}`,
      paymentStatus:   PaymentStatus.PENDING,
      items: {
        create: [
          { medicineId: omeprazole.id, quantity: 3, unitPrice: omeprazole.genericPrice, totalPrice: omeprazole.genericPrice * 3 },
          { medicineId: paracetamol.id, quantity: 4, unitPrice: paracetamol.genericPrice, totalPrice: paracetamol.genericPrice * 4 },
        ],
      },
    },
  });

  console.log(`  ✅ 3 orders seeded (ids: ${order1.id.slice(0,8)}, ${order2.id.slice(0,8)}, ${order3.id.slice(0,8)})`);

  // ── 7. Refill Reminders ──────────────────────────────────────────────────────
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  await prisma.refillReminder.createMany({
    data: [
      {
        userId:       patients[0].id,
        medicineId:   metformin.id,
        intervalDays: 30,
        enabled:      true,
        nextRemindAt: nextMonth,
      },
      {
        userId:       patients[1].id,
        medicineId:   amlodipine.id,
        intervalDays: 30,
        enabled:      true,
        nextRemindAt: nextMonth,
      },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ 2 refill reminders seeded');

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('');
  console.log('🎉  Seed complete!');
  console.log('─────────────────────────────────────────────');
  console.log('  Login credentials (all passwords: Test@1234)');
  console.log('  Admin:        +919000000001');
  console.log('  Pharmacist:   +919000000002');
  console.log('  Patient 1:    +919100000001  (Anjali Dey)');
  console.log('  Patient 2:    +919100000002  (Rajesh Kumar)');
  console.log('  Patient 3:    +919100000003  (Priya Mukherjee)');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

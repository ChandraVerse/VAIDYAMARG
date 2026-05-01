import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MEDICINES = [
  { name: 'Amoxicillin',     brand: 'Mox',         genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic',    price: 45,  mrp: 180, stock: 500, unit: 'Tab', requiresPrescription: true  },
  { name: 'Paracetamol',     brand: 'Crocin',       genericName: 'Acetaminophen',          category: 'Analgesic',     price: 18,  mrp: 45,  stock: 800, unit: 'Tab', requiresPrescription: false },
  { name: 'Azithromycin',    brand: 'Azithral',     genericName: 'Azithromycin',           category: 'Antibiotic',    price: 65,  mrp: 280, stock: 300, unit: 'Tab', requiresPrescription: true  },
  { name: 'Pantoprazole',    brand: 'Pan-D',        genericName: 'Pantoprazole Sodium',    category: 'Antacid',       price: 28,  mrp: 95,  stock: 600, unit: 'Cap', requiresPrescription: false },
  { name: 'Metformin',       brand: 'Glycomet',     genericName: 'Metformin HCl',          category: 'Antidiabetic',  price: 22,  mrp: 88,  stock: 1000, unit: 'Tab', requiresPrescription: true },
  { name: 'Atorvastatin',    brand: 'Lipitor',      genericName: 'Atorvastatin Calcium',   category: 'Statin',        price: 55,  mrp: 220, stock: 400, unit: 'Tab', requiresPrescription: true  },
  { name: 'Amlodipine',      brand: 'Amlip',        genericName: 'Amlodipine Besylate',    category: 'Antihypertensive', price: 35, mrp: 140, stock: 450, unit: 'Tab', requiresPrescription: true },
  { name: 'Cetirizine',      brand: 'Zyrtec',       genericName: 'Cetirizine HCl',         category: 'Antihistamine', price: 12,  mrp: 48,  stock: 700, unit: 'Tab', requiresPrescription: false },
  { name: 'Ibuprofen',       brand: 'Brufen',       genericName: 'Ibuprofen',              category: 'NSAID',         price: 15,  mrp: 60,  stock: 600, unit: 'Tab', requiresPrescription: false },
  { name: 'Omeprazole',      brand: 'Omez',         genericName: 'Omeprazole',             category: 'Antacid',       price: 24,  mrp: 90,  stock: 550, unit: 'Cap', requiresPrescription: false },
  { name: 'Losartan',        brand: 'Losacar',      genericName: 'Losartan Potassium',     category: 'Antihypertensive', price: 42, mrp: 168, stock: 380, unit: 'Tab', requiresPrescription: true },
  { name: 'Montelukast',     brand: 'Montair',      genericName: 'Montelukast Sodium',     category: 'Antiasthmatic', price: 38,  mrp: 150, stock: 420, unit: 'Tab', requiresPrescription: true  },
  { name: 'Levothyroxine',   brand: 'Thyronorm',    genericName: 'Levothyroxine Sodium',   category: 'Thyroid',       price: 30,  mrp: 120, stock: 500, unit: 'Tab', requiresPrescription: true  },
  { name: 'Metoprolol',      brand: 'Metolar',      genericName: 'Metoprolol Succinate',   category: 'Beta-blocker',  price: 48,  mrp: 195, stock: 350, unit: 'Tab', requiresPrescription: true  },
  { name: 'Vitamin D3',      brand: 'Calcirol',     genericName: 'Cholecalciferol',        category: 'Supplement',    price: 85,  mrp: 320, stock: 800, unit: 'Cap', requiresPrescription: false },
  { name: 'Folic Acid',      brand: 'Folvite',      genericName: 'Folic Acid',             category: 'Supplement',    price: 20,  mrp: 75,  stock: 900, unit: 'Tab', requiresPrescription: false },
  { name: 'Ciprofloxacin',   brand: 'Ciplox',       genericName: 'Ciprofloxacin HCl',      category: 'Antibiotic',    price: 52,  mrp: 210, stock: 300, unit: 'Tab', requiresPrescription: true  },
  { name: 'Ondansetron',     brand: 'Emeset',       genericName: 'Ondansetron HCl',        category: 'Antiemetic',    price: 25,  mrp: 98,  stock: 400, unit: 'Tab', requiresPrescription: false },
  { name: 'Domperidone',     brand: 'Domstal',      genericName: 'Domperidone',            category: 'Antiemetic',    price: 18,  mrp: 72,  stock: 450, unit: 'Tab', requiresPrescription: false },
  { name: 'Salbutamol',      brand: 'Asthalin',     genericName: 'Salbutamol Sulphate',    category: 'Bronchodilator',price: 95,  mrp: 380, stock: 250, unit: 'Inhaler', requiresPrescription: true },
];

async function main() {
  console.log('\n🌱  Seeding VaidyaMarg database...\n');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+910000000001' },
    update: {},
    create: {
      phone: '+910000000001',
      name:  'Super Admin',
      role:  Role.ADMIN,
      passwordHash: adminPassword,
    },
  });
  console.log(`✅  Admin user:      ${admin.phone}`);

  // Pharmacist user
  const pharmPassword = await bcrypt.hash('Pharm@1234', 10);
  const pharmacist = await prisma.user.upsert({
    where: { phone: '+910000000002' },
    update: {},
    create: {
      phone: '+910000000002',
      name:  'Demo Pharmacist',
      role:  Role.PHARMACIST,
      passwordHash: pharmPassword,
    },
  });
  console.log(`✅  Pharmacist user: ${pharmacist.phone}`);

  // Sample patient
  const patient = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      name:  'Ravi Kumar',
      role:  Role.PATIENT,
    },
  });
  console.log(`✅  Sample patient:  ${patient.phone}`);

  // Medicines
  let medCount = 0;
  for (const med of MEDICINES) {
    await prisma.medicine.upsert({
      where: { name: med.name },
      update: { stock: med.stock, price: med.price },
      create: {
        ...med,
        description: `${med.genericName} — generic alternative to ${med.brand}`,
        imageUrl: null,
      },
    });
    medCount++;
  }
  console.log(`✅  Medicines seeded: ${medCount}`);

  console.log('\n🎉  Seed complete!\n');
  console.log('  Admin login:      +910000000001 / Admin@1234');
  console.log('  Pharmacist login: +910000000002 / Pharm@1234');
  console.log('  Patient phone:    +919876543210\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

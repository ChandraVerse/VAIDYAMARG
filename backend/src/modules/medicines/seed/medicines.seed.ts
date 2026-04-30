/**
 * VaidyaMarg — Sample Medicine Seed Data
 * Run with: npx ts-node src/modules/medicines/seed/medicines.seed.ts
 *
 * This seeds the DB with common Indian medicines
 * showing branded MRP vs. our generic price.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const medicines = [
  // Pain / Fever
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', brandName: 'Crocin 500', manufacturer: 'GSK', category: 'Analgesic', dosageForm: 'Tablet', strength: '500mg', mrp: 30.00, genericPrice: 8.00, stock: 1000, requiresRx: false },
  { name: 'Paracetamol 650mg', genericName: 'Paracetamol', brandName: 'Dolo 650', manufacturer: 'Micro Labs', category: 'Analgesic', dosageForm: 'Tablet', strength: '650mg', mrp: 36.00, genericPrice: 10.00, stock: 1000, requiresRx: false },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brandName: 'Brufen 400', manufacturer: 'Abbott', category: 'NSAID', dosageForm: 'Tablet', strength: '400mg', mrp: 55.00, genericPrice: 14.00, stock: 800, requiresRx: false },
  { name: 'Diclofenac 50mg', genericName: 'Diclofenac', brandName: 'Voveran 50', manufacturer: 'Novartis', category: 'NSAID', dosageForm: 'Tablet', strength: '50mg', mrp: 62.00, genericPrice: 16.00, stock: 600, requiresRx: false },

  // Antibiotics
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', brandName: 'Amoxil 500', manufacturer: 'GSK', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', mrp: 120.00, genericPrice: 28.00, stock: 500, requiresRx: true },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', brandName: 'Zithromax 500', manufacturer: 'Pfizer', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', mrp: 180.00, genericPrice: 42.00, stock: 400, requiresRx: true },
  { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', brandName: 'Ciplox 500', manufacturer: 'Cipla', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', mrp: 95.00, genericPrice: 22.00, stock: 600, requiresRx: true },

  // Diabetes
  { name: 'Metformin 500mg', genericName: 'Metformin', brandName: 'Glycomet 500', manufacturer: 'USV', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg', mrp: 45.00, genericPrice: 9.00, stock: 2000, requiresRx: true },
  { name: 'Glimepiride 2mg', genericName: 'Glimepiride', brandName: 'Amaryl 2', manufacturer: 'Sanofi', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '2mg', mrp: 130.00, genericPrice: 22.00, stock: 1000, requiresRx: true },

  // Blood Pressure
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine', brandName: 'Norvasc 5', manufacturer: 'Pfizer', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '5mg', mrp: 85.00, genericPrice: 12.00, stock: 1500, requiresRx: true },
  { name: 'Atenolol 50mg', genericName: 'Atenolol', brandName: 'Tenormin 50', manufacturer: 'AstraZeneca', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '50mg', mrp: 70.00, genericPrice: 10.00, stock: 1200, requiresRx: true },
  { name: 'Telmisartan 40mg', genericName: 'Telmisartan', brandName: 'Telma 40', manufacturer: 'Glenmark', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '40mg', mrp: 110.00, genericPrice: 18.00, stock: 1000, requiresRx: true },

  // Thyroid
  { name: 'Levothyroxine 50mcg', genericName: 'Levothyroxine', brandName: 'Eltroxin 50', manufacturer: 'GSK', category: 'Thyroid', dosageForm: 'Tablet', strength: '50mcg', mrp: 55.00, genericPrice: 10.00, stock: 1000, requiresRx: true },

  // Stomach / Acid
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brandName: 'Omez 20', manufacturer: 'Dr. Reddy\'s', category: 'Antacid', dosageForm: 'Capsule', strength: '20mg', mrp: 65.00, genericPrice: 12.00, stock: 1500, requiresRx: false },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', brandName: 'Pan 40', manufacturer: 'Alkem', category: 'Antacid', dosageForm: 'Tablet', strength: '40mg', mrp: 75.00, genericPrice: 14.00, stock: 1200, requiresRx: false },
  { name: 'Domperidone 10mg', genericName: 'Domperidone', brandName: 'Domstal 10', manufacturer: 'Torrent', category: 'Antiemetic', dosageForm: 'Tablet', strength: '10mg', mrp: 42.00, genericPrice: 9.00, stock: 800, requiresRx: false },

  // Vitamins
  { name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', brandName: 'Calcirol Sachet', manufacturer: 'Cadila', category: 'Vitamin', dosageForm: 'Sachet', strength: '60000 IU', mrp: 48.00, genericPrice: 15.00, stock: 2000, requiresRx: false },
  { name: 'Vitamin B12 1500mcg', genericName: 'Methylcobalamin', brandName: 'Mecobalamin 1500', manufacturer: 'Sun Pharma', category: 'Vitamin', dosageForm: 'Tablet', strength: '1500mcg', mrp: 90.00, genericPrice: 18.00, stock: 1500, requiresRx: false },
];

async function main() {
  console.log('💊 Seeding medicines...');
  let count = 0;
  for (const medicine of medicines) {
    await prisma.medicine.upsert({
      where: { id: `seed-${medicine.genericName.toLowerCase().replace(/ /g, '-')}-${medicine.strength}` },
      update: {},
      create: {
        id: `seed-${medicine.genericName.toLowerCase().replace(/ /g, '-')}-${medicine.strength}`,
        ...medicine,
      },
    });
    count++;
  }
  console.log(`✅ ${count} medicines seeded successfully!`);
  console.log('💰 Sample savings:');
  medicines.slice(0, 3).forEach((m) => {
    const save = (((m.mrp - m.genericPrice) / m.mrp) * 100).toFixed(0);
    console.log(`   ${m.brandName}: ₹${m.mrp} → ₹${m.genericPrice} (Save ${save}%)`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

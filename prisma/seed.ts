import { PrismaClient, LegalClass, NarcoticClass } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// =====================================================
// ข้อมูลยา 124 รายการ
// =====================================================

interface MedicineSeed {
  genericName: string;
  tradeName?: string;
  strength: string;
  dosageForm: string;
  category: string;
  legalClass?: LegalClass;
  narcoticClass?: NarcoticClass;
  batchNumber: string;
}

const medicines: MedicineSeed[] = [
  // ========== ยาน้ำ (Syrup) 34 รายการ ==========
  { genericName: "Amoxicillin", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "032S/136" },
  { genericName: "Amoxicillin", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "042S/171" },
  { genericName: "Cloxacillin", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "0125PC3" },
  { genericName: "Erythromycin Estolate", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ES125-22" },
  { genericName: "Erythromycin Estolate", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ES250-23" },
  { genericName: "Co-trimoxazole", strength: "200/40mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CTX-S22" },
  { genericName: "Chlorpheniramine", strength: "2mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CPM-S21" },
  { genericName: "Diphenhydramine", strength: "12.5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DPH-S22" },
  { genericName: "Bromhexine", strength: "4mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "BRX-S23" },
  { genericName: "Guaifenesin", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "GFN-S22" },
  { genericName: "Dextromethorphan", strength: "15mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DXM-S23" },
  { genericName: "Paracetamol", strength: "120mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PCT-S22" },
  { genericName: "Paracetamol", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PCT250-23" },
  { genericName: "Ibuprofen", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "IBP-S22" },
  { genericName: "Salbutamol", strength: "2mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "SAL-S23" },
  { genericName: "Prednisolone", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PRD-S22" },
  { genericName: "Metronidazole", strength: "200mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "MNZ-S23" },
  { genericName: "Ranitidine", strength: "150mg/10ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "RNT-S22" },
  { genericName: "Antacid (Mg+Al)", strength: "hydroxide", dosageForm: "suspension", category: "ยาน้ำ", batchNumber: "ANT-S23" },
  { genericName: "Domperidone", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DMP-S22" },
  { genericName: "Ferrous Sulfate", strength: "150mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "FES-S23" },
  { genericName: "Vitamin B Complex", strength: "compound", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "VBC-S22" },
  { genericName: "Vitamin C", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "VTC-S23" },
  { genericName: "Zinc Sulfate", strength: "10mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ZNS-S22" },
  { genericName: "Nystatin", strength: "100,000 units/ml", dosageForm: "suspension", category: "ยาน้ำ", batchNumber: "NYS-S23" },
  { genericName: "Fluconazole", strength: "50mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "FLC-S22" },
  { genericName: "Loratadine", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "LOR-S23" },
  { genericName: "Cetirizine", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CTZ-S22" },
  { genericName: "Lactulose", strength: "10g/15ml", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "LAC-S23" },
  { genericName: "Oral Rehydration Salt", strength: "standard", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "ORS-S22" },
  { genericName: "Glycerol", strength: "85%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "GLY-S23" },
  { genericName: "Povidone Iodine", strength: "10%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "PVI-S22" },
  { genericName: "Hydrogen Peroxide", strength: "3%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "H2O-S23" },
  { genericName: "Normal Saline", strength: "0.9% NaCl", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "NSS-S22" },

  // ========== ยาเม็ด ชุด 1 (id 35-74) ==========
  { genericName: "Amoxicillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMX250-T22" },
  { genericName: "Amoxicillin", strength: "500mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMX500-T23" },
  { genericName: "Ampicillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMP250-T22" },
  { genericName: "Cloxacillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "CLX250-T23" },
  { genericName: "Co-trimoxazole", strength: "480mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CTX-T22" },
  { genericName: "Erythromycin", strength: "250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ERY250-T23" },
  { genericName: "Erythromycin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ERY500-T22" },
  { genericName: "Doxycycline", strength: "100mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "DOX-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Metronidazole", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MNZ200-T22" },
  { genericName: "Metronidazole", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MNZ400-T23" },
  { genericName: "Norfloxacin", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "NRF-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Ciprofloxacin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPF-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Paracetamol", strength: "325mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PCT325-T22" },
  { genericName: "Paracetamol", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PCT500-T23" },
  { genericName: "Aspirin", strength: "81mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ASA81-T22" },
  { genericName: "Aspirin", strength: "300mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ASA300-T23" },
  { genericName: "Ibuprofen", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "IBP200-T22" },
  { genericName: "Ibuprofen", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "IBP400-T23" },
  { genericName: "Indomethacin", strength: "25mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "IND-T22" },
  { genericName: "Diclofenac Sodium", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DCF-T23" },
  { genericName: "Naproxen", strength: "250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "NPX-T22" },
  { genericName: "Chlorpheniramine", strength: "4mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPM-T23" },
  { genericName: "Diphenhydramine", strength: "25mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "DPH-T22" },
  { genericName: "Loratadine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LOR-T23" },
  { genericName: "Cetirizine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CTZ-T22" },
  { genericName: "Fexofenadine", strength: "120mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FXF-T23" },
  { genericName: "Prednisolone", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PRD5-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Dexamethasone", strength: "0.5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DXM-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Hydrocortisone", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "HCT-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Salbutamol", strength: "2mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SAL2-T23" },
  { genericName: "Salbutamol", strength: "4mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SAL4-T22" },
  { genericName: "Theophylline", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "TPH-T23" },
  { genericName: "Bromhexine", strength: "8mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "BRX-T22" },
  { genericName: "Dextromethorphan", strength: "15mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DXM15-T23" },
  { genericName: "Omeprazole", strength: "20mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "OMP-T22" },
  { genericName: "Ranitidine", strength: "150mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "RNT150-T23" },
  { genericName: "Famotidine", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FMT-T22" },
  { genericName: "Domperidone", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DMP-T23" },
  { genericName: "Metoclopramide", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MCP-T22" },

  // ========== ยาเม็ด ชุด 2 (id 75-113) ==========
  { genericName: "Atenolol", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATN50-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Atenolol", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATN100-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Amlodipine", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "AML5-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Amlodipine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "AML10-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Enalapril", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ENL5-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Enalapril", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ENL10-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Lisinopril", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LSN-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Losartan", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LST-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Hydrochlorothiazide", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "HCZ-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Furosemide", strength: "40mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FSM-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Spironolactone", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SPR-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Metformin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MFM500-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Metformin", strength: "1000mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MFM1000-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Glibenclamide", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "GLB-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Glipizide", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "GLP-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Simvastatin", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SMV-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Atorvastatin", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATV-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Warfarin", strength: "3mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "WRF3-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Warfarin", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "WRF5-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Clopidogrel", strength: "75mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPG-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Digoxin", strength: "0.25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DGX-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Phenytoin", strength: "100mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "PHT-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Carbamazepine", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CBZ-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Valproic Acid", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VPA-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Levodopa+Carbidopa", strength: "100/25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LDC-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Ferrous Sulfate", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FES-T23" },
  { genericName: "Folic Acid", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FOL-T22" },
  { genericName: "Vitamin B1 (Thiamine)", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB1-T23" },
  { genericName: "Vitamin B6 (Pyridoxine)", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB6-T22" },
  { genericName: "Vitamin B12 (Cyanocobalamin)", strength: "500mcg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB12-T23" },
  { genericName: "Vitamin C", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VTC500-T22" },
  { genericName: "Calcium Carbonate", strength: "1250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CAC-T23" },
  { genericName: "Allopurinol", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ALP-T22" },
  { genericName: "Colchicine", strength: "0.6mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "COL-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Levothyroxine", strength: "100mcg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LVT-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Propylthiouracil", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PTU-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Fluconazole", strength: "150mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "FLC150-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Tinidazole", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "TNZ-T23" },
  { genericName: "Albendazole", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ALB-T22" },

  // ========== ยาแก้ปวด/กล้ามเนื้อ + ยาควบคุม (id 114-124) ==========
  { genericName: "Paracetamol + Codeine", strength: "500mg/10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "PCC-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.NARCOTIC_2 },
  { genericName: "Tramadol", strength: "50mg", dosageForm: "capsule", category: "ยาแก้ปวด", batchNumber: "TRM50-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4 },
  { genericName: "Tramadol", strength: "100mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "TRM100-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4 },
  { genericName: "Morphine Sulfate", strength: "10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "MPH-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.NARCOTIC_2 },
  { genericName: "Diazepam", strength: "5mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "DZP5-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4 },
  { genericName: "Lorazepam", strength: "1mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "LZP-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4 },
  { genericName: "Alprazolam", strength: "0.5mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "ALP05-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4 },
  { genericName: "Muscle Relaxant (Methocarbamol)", strength: "500mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "MCB-T23" },
  { genericName: "Baclofen", strength: "10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "BCL-T22", legalClass: LegalClass.DANGEROUS },
  { genericName: "Tizanidine", strength: "4mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "TZN-T23", legalClass: LegalClass.DANGEROUS },
  { genericName: "Mefenamic Acid", strength: "500mg", dosageForm: "capsule", category: "ยาแก้ปวด", batchNumber: "MFA-T22" },
];

async function main() {
  console.log("🌱 เริ่ม seed ข้อมูล...");

  // สร้าง Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPassword,
      fullName: "ผู้ดูแลระบบ",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ สร้าง admin user:", admin.username);

  // สร้าง Pharmacist user
  const pharmPassword = await bcrypt.hash("pharm123", 12);
  await prisma.user.upsert({
    where: { username: "pharmacist" },
    update: {},
    create: {
      username: "pharmacist",
      passwordHash: pharmPassword,
      fullName: "เภสัชกร สมใจ",
      role: "PHARMACIST",
      licenseNumber: "ภ.12345",
      isActive: true,
    },
  });
  console.log("✅ สร้าง pharmacist user");

  // สร้างข้อมูลยา
  let created = 0;
  for (const med of medicines) {
    const medicine = await prisma.medicine.upsert({
      where: {
        // ใช้ genericName+strength+dosageForm เป็น unique key
        id: `seed-${med.genericName.toLowerCase().replace(/\s+/g, "-")}-${med.strength}-${med.dosageForm}`,
      },
      update: {},
      create: {
        id: `seed-${med.genericName.toLowerCase().replace(/\s+/g, "-")}-${med.strength}-${med.dosageForm}`,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        category: med.category,
        legalClass: med.legalClass ?? "NORMAL",
        narcoticClass: med.narcoticClass ?? null,
        // สร้าง inventory batch ตัวอย่าง
        inventories: {
          create: {
            batchNumber: med.batchNumber,
            quantity: 100,
            unit: med.dosageForm === "syrup" || med.dosageForm === "solution" || med.dosageForm === "suspension" ? "ขวด" : "เม็ด",
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ปีข้างหน้า
            receivedById: admin.id,
          },
        },
      },
    });
    created++;
    if (created % 20 === 0) {
      console.log(`   ...นำเข้า ${created} รายการแล้ว`);
    }
  }

  console.log(`✅ นำเข้ายา ${created} รายการสำเร็จ`);
  console.log("");
  console.log("📋 สรุป:");
  console.log("   - Admin:      username=admin      password=admin123");
  console.log("   - Pharmacist: username=pharmacist password=pharm123");
  console.log(`   - ยาทั้งหมด:  ${created} รายการ`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

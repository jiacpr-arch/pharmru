import { PrismaClient, LegalClass, NarcoticClass } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
  price: number;       // ราคาต่อหน่วย (บาท)
  priceUnit?: string;  // หน่วยราคา (default: เม็ด สำหรับยาเม็ด, ขวด สำหรับยาน้ำ)
}

const medicines: MedicineSeed[] = [
  // ========== ยาน้ำ (Syrup) 34 รายการ ==========
  { genericName: "Amoxicillin", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "032S/136", price: 45, priceUnit: "ขวด" },
  { genericName: "Amoxicillin", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "042S/171", price: 65, priceUnit: "ขวด" },
  { genericName: "Cloxacillin", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "0125PC3", price: 55, priceUnit: "ขวด" },
  { genericName: "Erythromycin Estolate", strength: "125mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ES125-22", price: 60, priceUnit: "ขวด" },
  { genericName: "Erythromycin Estolate", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ES250-23", price: 85, priceUnit: "ขวด" },
  { genericName: "Co-trimoxazole", strength: "200/40mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CTX-S22", price: 35, priceUnit: "ขวด" },
  { genericName: "Chlorpheniramine", strength: "2mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CPM-S21", price: 25, priceUnit: "ขวด" },
  { genericName: "Diphenhydramine", strength: "12.5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DPH-S22", price: 28, priceUnit: "ขวด" },
  { genericName: "Bromhexine", strength: "4mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "BRX-S23", price: 32, priceUnit: "ขวด" },
  { genericName: "Guaifenesin", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "GFN-S22", price: 30, priceUnit: "ขวด" },
  { genericName: "Dextromethorphan", strength: "15mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DXM-S23", price: 38, priceUnit: "ขวด" },
  { genericName: "Paracetamol", strength: "120mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PCT-S22", price: 22, priceUnit: "ขวด" },
  { genericName: "Paracetamol", strength: "250mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PCT250-23", price: 35, priceUnit: "ขวด" },
  { genericName: "Ibuprofen", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "IBP-S22", price: 42, priceUnit: "ขวด" },
  { genericName: "Salbutamol", strength: "2mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "SAL-S23", price: 48, priceUnit: "ขวด" },
  { genericName: "Prednisolone", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "PRD-S22", price: 55, priceUnit: "ขวด" },
  { genericName: "Metronidazole", strength: "200mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "MNZ-S23", price: 40, priceUnit: "ขวด" },
  { genericName: "Ranitidine", strength: "150mg/10ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "RNT-S22", price: 50, priceUnit: "ขวด" },
  { genericName: "Antacid (Mg+Al)", strength: "hydroxide", dosageForm: "suspension", category: "ยาน้ำ", batchNumber: "ANT-S23", price: 45, priceUnit: "ขวด" },
  { genericName: "Domperidone", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "DMP-S22", price: 52, priceUnit: "ขวด" },
  { genericName: "Ferrous Sulfate", strength: "150mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "FES-S23", price: 38, priceUnit: "ขวด" },
  { genericName: "Vitamin B Complex", strength: "compound", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "VBC-S22", price: 65, priceUnit: "ขวด" },
  { genericName: "Vitamin C", strength: "100mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "VTC-S23", price: 45, priceUnit: "ขวด" },
  { genericName: "Zinc Sulfate", strength: "10mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "ZNS-S22", price: 42, priceUnit: "ขวด" },
  { genericName: "Nystatin", strength: "100,000 units/ml", dosageForm: "suspension", category: "ยาน้ำ", batchNumber: "NYS-S23", price: 75, priceUnit: "ขวด" },
  { genericName: "Fluconazole", strength: "50mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "FLC-S22", price: 120, priceUnit: "ขวด" },
  { genericName: "Loratadine", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "LOR-S23", price: 58, priceUnit: "ขวด" },
  { genericName: "Cetirizine", strength: "5mg/5ml", dosageForm: "syrup", category: "ยาน้ำ", batchNumber: "CTZ-S22", price: 55, priceUnit: "ขวด" },
  { genericName: "Lactulose", strength: "10g/15ml", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "LAC-S23", price: 95, priceUnit: "ขวด" },
  { genericName: "Oral Rehydration Salt", strength: "standard", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "ORS-S22", price: 8, priceUnit: "ซอง" },
  { genericName: "Glycerol", strength: "85%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "GLY-S23", price: 35, priceUnit: "ขวด" },
  { genericName: "Povidone Iodine", strength: "10%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "PVI-S22", price: 45, priceUnit: "ขวด" },
  { genericName: "Hydrogen Peroxide", strength: "3%", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "H2O-S23", price: 28, priceUnit: "ขวด" },
  { genericName: "Normal Saline", strength: "0.9% NaCl", dosageForm: "solution", category: "ยาน้ำ", batchNumber: "NSS-S22", price: 22, priceUnit: "ขวด" },

  // ========== ยาเม็ด ชุด 1 (id 35-74) ==========
  { genericName: "Amoxicillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMX250-T22", price: 2, priceUnit: "เม็ด" },
  { genericName: "Amoxicillin", strength: "500mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMX500-T23", price: 4, priceUnit: "เม็ด" },
  { genericName: "Ampicillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "AMP250-T22", price: 2, priceUnit: "เม็ด" },
  { genericName: "Cloxacillin", strength: "250mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "CLX250-T23", price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Co-trimoxazole", strength: "480mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CTX-T22", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Erythromycin", strength: "250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ERY250-T23", price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Erythromycin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ERY500-T22", price: 4, priceUnit: "เม็ด" },
  { genericName: "Doxycycline", strength: "100mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "DOX-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Metronidazole", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MNZ200-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Metronidazole", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MNZ400-T23", price: 2, priceUnit: "เม็ด" },
  { genericName: "Norfloxacin", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "NRF-T22", legalClass: LegalClass.DANGEROUS, price: 3, priceUnit: "เม็ด" },
  { genericName: "Ciprofloxacin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPF-T23", legalClass: LegalClass.DANGEROUS, price: 4, priceUnit: "เม็ด" },
  { genericName: "Paracetamol", strength: "325mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PCT325-T22", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Paracetamol", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PCT500-T23", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Aspirin", strength: "81mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ASA81-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Aspirin", strength: "300mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ASA300-T23", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Ibuprofen", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "IBP200-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Ibuprofen", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "IBP400-T23", price: 2, priceUnit: "เม็ด" },
  { genericName: "Indomethacin", strength: "25mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "IND-T22", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Diclofenac Sodium", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DCF-T23", price: 1, priceUnit: "เม็ด" },
  { genericName: "Naproxen", strength: "250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "NPX-T22", price: 2, priceUnit: "เม็ด" },
  { genericName: "Chlorpheniramine", strength: "4mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPM-T23", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Diphenhydramine", strength: "25mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "DPH-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Loratadine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LOR-T23", price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Cetirizine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CTZ-T22", price: 2, priceUnit: "เม็ด" },
  { genericName: "Fexofenadine", strength: "120mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FXF-T23", price: 6, priceUnit: "เม็ด" },
  { genericName: "Prednisolone", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PRD5-T22", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Dexamethasone", strength: "0.5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DXM-T23", legalClass: LegalClass.DANGEROUS, price: 0.75, priceUnit: "เม็ด" },
  { genericName: "Hydrocortisone", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "HCT-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Salbutamol", strength: "2mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SAL2-T23", price: 1, priceUnit: "เม็ด" },
  { genericName: "Salbutamol", strength: "4mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SAL4-T22", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Theophylline", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "TPH-T23", price: 2, priceUnit: "เม็ด" },
  { genericName: "Bromhexine", strength: "8mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "BRX-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Dextromethorphan", strength: "15mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DXM15-T23", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Omeprazole", strength: "20mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "OMP-T22", price: 3, priceUnit: "เม็ด" },
  { genericName: "Ranitidine", strength: "150mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "RNT150-T23", price: 2, priceUnit: "เม็ด" },
  { genericName: "Famotidine", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FMT-T22", price: 2, priceUnit: "เม็ด" },
  { genericName: "Domperidone", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DMP-T23", price: 2, priceUnit: "เม็ด" },
  { genericName: "Metoclopramide", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MCP-T22", price: 1.5, priceUnit: "เม็ด" },

  // ========== ยาเม็ด ชุด 2 (id 75-113) ==========
  { genericName: "Atenolol", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATN50-T22", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Atenolol", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATN100-T23", legalClass: LegalClass.DANGEROUS, price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Amlodipine", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "AML5-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Amlodipine", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "AML10-T23", legalClass: LegalClass.DANGEROUS, price: 3, priceUnit: "เม็ด" },
  { genericName: "Enalapril", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ENL5-T22", legalClass: LegalClass.DANGEROUS, price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Enalapril", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ENL10-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Lisinopril", strength: "10mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LSN-T22", legalClass: LegalClass.DANGEROUS, price: 3, priceUnit: "เม็ด" },
  { genericName: "Losartan", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LST-T23", legalClass: LegalClass.DANGEROUS, price: 4, priceUnit: "เม็ด" },
  { genericName: "Hydrochlorothiazide", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "HCZ-T22", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Furosemide", strength: "40mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FSM-T23", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Spironolactone", strength: "25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SPR-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Metformin", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MFM500-T23", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Metformin", strength: "1000mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "MFM1000-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Glibenclamide", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "GLB-T23", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Glipizide", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "GLP-T22", legalClass: LegalClass.DANGEROUS, price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Simvastatin", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "SMV-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Atorvastatin", strength: "20mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ATV-T22", legalClass: LegalClass.DANGEROUS, price: 5, priceUnit: "เม็ด" },
  { genericName: "Warfarin", strength: "3mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "WRF3-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Warfarin", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "WRF5-T22", legalClass: LegalClass.DANGEROUS, price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Clopidogrel", strength: "75mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CPG-T23", legalClass: LegalClass.DANGEROUS, price: 8, priceUnit: "เม็ด" },
  { genericName: "Digoxin", strength: "0.25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "DGX-T22", legalClass: LegalClass.DANGEROUS, price: 1, priceUnit: "เม็ด" },
  { genericName: "Phenytoin", strength: "100mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "PHT-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Carbamazepine", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CBZ-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Valproic Acid", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VPA-T23", legalClass: LegalClass.DANGEROUS, price: 3, priceUnit: "เม็ด" },
  { genericName: "Levodopa+Carbidopa", strength: "100/25mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LDC-T22", legalClass: LegalClass.DANGEROUS, price: 6, priceUnit: "เม็ด" },
  { genericName: "Ferrous Sulfate", strength: "200mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FES-T23", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Folic Acid", strength: "5mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "FOL-T22", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Vitamin B1 (Thiamine)", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB1-T23", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Vitamin B6 (Pyridoxine)", strength: "50mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB6-T22", price: 0.5, priceUnit: "เม็ด" },
  { genericName: "Vitamin B12 (Cyanocobalamin)", strength: "500mcg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VB12-T23", price: 1, priceUnit: "เม็ด" },
  { genericName: "Vitamin C", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "VTC500-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Calcium Carbonate", strength: "1250mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "CAC-T23", price: 1.5, priceUnit: "เม็ด" },
  { genericName: "Allopurinol", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ALP-T22", price: 1, priceUnit: "เม็ด" },
  { genericName: "Colchicine", strength: "0.6mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "COL-T23", legalClass: LegalClass.DANGEROUS, price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Levothyroxine", strength: "100mcg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "LVT-T22", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Propylthiouracil", strength: "100mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "PTU-T23", legalClass: LegalClass.DANGEROUS, price: 2, priceUnit: "เม็ด" },
  { genericName: "Fluconazole", strength: "150mg", dosageForm: "capsule", category: "ยาเม็ด", batchNumber: "FLC150-T22", legalClass: LegalClass.DANGEROUS, price: 15, priceUnit: "เม็ด" },
  { genericName: "Tinidazole", strength: "500mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "TNZ-T23", price: 3, priceUnit: "เม็ด" },
  { genericName: "Albendazole", strength: "400mg", dosageForm: "tablet", category: "ยาเม็ด", batchNumber: "ALB-T22", price: 8, priceUnit: "เม็ด" },

  // ========== ยาแก้ปวด/กล้ามเนื้อ + ยาควบคุม (id 114-124) ==========
  { genericName: "Paracetamol + Codeine", strength: "500mg/10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "PCC-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.NARCOTIC_2, price: 5, priceUnit: "เม็ด" },
  { genericName: "Tramadol", strength: "50mg", dosageForm: "capsule", category: "ยาแก้ปวด", batchNumber: "TRM50-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4, price: 6, priceUnit: "เม็ด" },
  { genericName: "Tramadol", strength: "100mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "TRM100-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4, price: 10, priceUnit: "เม็ด" },
  { genericName: "Morphine Sulfate", strength: "10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "MPH-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.NARCOTIC_2, price: 15, priceUnit: "เม็ด" },
  { genericName: "Diazepam", strength: "5mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "DZP5-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4, price: 2, priceUnit: "เม็ด" },
  { genericName: "Lorazepam", strength: "1mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "LZP-T23", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4, price: 3, priceUnit: "เม็ด" },
  { genericName: "Alprazolam", strength: "0.5mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "ALP05-T22", legalClass: LegalClass.SPECIALLY_CONTROLLED, narcoticClass: NarcoticClass.PSYCHOTROPIC_4, price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Muscle Relaxant (Methocarbamol)", strength: "500mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "MCB-T23", price: 3, priceUnit: "เม็ด" },
  { genericName: "Baclofen", strength: "10mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "BCL-T22", legalClass: LegalClass.DANGEROUS, price: 2.5, priceUnit: "เม็ด" },
  { genericName: "Tizanidine", strength: "4mg", dosageForm: "tablet", category: "ยาแก้ปวด", batchNumber: "TZN-T23", legalClass: LegalClass.DANGEROUS, price: 4, priceUnit: "เม็ด" },
  { genericName: "Mefenamic Acid", strength: "500mg", dosageForm: "capsule", category: "ยาแก้ปวด", batchNumber: "MFA-T22", price: 2, priceUnit: "เม็ด" },
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
    const defaultPriceUnit =
      med.dosageForm === "syrup" || med.dosageForm === "solution" || med.dosageForm === "suspension"
        ? "ขวด"
        : "เม็ด";
    const medicine = await prisma.medicine.upsert({
      where: {
        // ใช้ genericName+strength+dosageForm เป็น unique key
        id: `seed-${med.genericName.toLowerCase().replace(/\s+/g, "-")}-${med.strength}-${med.dosageForm}`,
      },
      update: {
        // อัพเดทราคาถ้ามียาเดิมอยู่แล้ว (re-seed)
        price: med.price,
        priceUnit: med.priceUnit ?? defaultPriceUnit,
      },
      create: {
        id: `seed-${med.genericName.toLowerCase().replace(/\s+/g, "-")}-${med.strength}-${med.dosageForm}`,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        category: med.category,
        legalClass: med.legalClass ?? "NORMAL",
        narcoticClass: med.narcoticClass ?? null,
        price: med.price,
        priceUnit: med.priceUnit ?? defaultPriceUnit,
        // สร้าง inventory batch ตัวอย่าง
        inventories: {
          create: {
            batchNumber: med.batchNumber,
            quantity: 100,
            unit: defaultPriceUnit,
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

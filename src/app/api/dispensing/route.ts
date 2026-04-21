import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit, getIpFromRequest } from "@/lib/audit-logger";
import { validateDispensing } from "@/lib/nedl-validator";
import { z } from "zod";

const dispenseSchema = z.object({
  medicineId: z.string().min(1),
  inventoryId: z.string().min(1),
  patientName: z.string().min(1),
  patientHn: z.string().optional(),
  prescriberName: z.string().min(1),
  prescriptionNo: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  // NEDL fields
  diagnosis: z.string().optional(),
  specialCondition: z.string().optional(),
  projectApproval: z.string().optional(),
  specialistPrescriber: z.string().optional(),
  treatmentGuidelineFollowed: z.boolean().optional(),
  narcoticFormNumber: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const nedlResult = searchParams.get("nedlResult");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const records = await db.dispensingRecord.findMany({
    where: {
      ...(nedlResult && { nedlCheckResult: nedlResult as "PASS" | "WARNING" | "FAIL" }),
      ...(dateFrom && dateTo && {
        dispensedAt: {
          gte: new Date(dateFrom),
          lte: new Date(`${dateTo}T23:59:59`),
        },
      }),
      ...(search && {
        OR: [
          { patientName: { contains: search, mode: "insensitive" } },
          { patientHn: { contains: search, mode: "insensitive" } },
          { medicine: { genericName: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    include: {
      medicine: { select: { genericName: true, strength: true, nedlCategory: true, narcoticClass: true, price: true, priceUnit: true } },
      inventory: { select: { batchNumber: true } },
      dispensedBy: { select: { fullName: true } },
    },
    orderBy: { dispensedAt: "desc" },
    take: 100,
  });

  // คำนวณยอดรวมของผลลัพธ์ที่ส่งกลับ
  const totalAmount = records.reduce((sum, r) => sum + (r.totalPrice ?? 0), 0);

  return NextResponse.json({ records, totalAmount });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = dispenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const dispenserUser = await db.user.findUnique({ where: { id: userId } });
  if (!dispenserUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

  // ดึงข้อมูลยา
  const medicine = await db.medicine.findUnique({ where: { id: parsed.data.medicineId } });
  if (!medicine) return NextResponse.json({ error: "Medicine not found" }, { status: 404 });

  if (!medicine.isActive) {
    return NextResponse.json({ error: "ยานี้ถูกปิดใช้งานแล้ว ไม่สามารถจ่ายได้" }, { status: 400 });
  }

  // ตรวจสอบสต็อก
  const inventory = await db.inventory.findUnique({ where: { id: parsed.data.inventoryId } });
  if (!inventory || inventory.status !== "ACTIVE") {
    return NextResponse.json({ error: "สต็อกไม่พร้อมใช้งาน" }, { status: 400 });
  }
  if (inventory.quantity < parsed.data.quantity) {
    return NextResponse.json({ error: `สต็อกไม่เพียงพอ (มี ${inventory.quantity} ${inventory.unit})` }, { status: 400 });
  }

  // NEDL Validation
  const validation = validateDispensing({
    nedlCategory: medicine.nedlCategory,
    narcoticClass: medicine.narcoticClass,
    conditionsOfUse: medicine.conditionsOfUse,
    diagnosis: parsed.data.diagnosis,
    specialCondition: parsed.data.specialCondition,
    projectApproval: parsed.data.projectApproval,
    specialistPrescriber: parsed.data.specialistPrescriber,
    treatmentGuidelineFollowed: parsed.data.treatmentGuidelineFollowed,
    narcoticFormNumber: parsed.data.narcoticFormNumber,
    prescriberName: parsed.data.prescriberName,
    dispenserRole: dispenserUser.role,
  });

  if (validation.result === "FAIL") {
    return NextResponse.json({
      error: "ไม่ผ่านการตรวจสอบ NEDL",
      validation,
    }, { status: 422 });
  }

  // Snapshot ราคา ณ เวลาจ่าย
  const unitPrice = medicine.price ?? null;
  const totalPrice = unitPrice != null ? Number((unitPrice * parsed.data.quantity).toFixed(2)) : null;

  // ตัดสต็อก + บันทึก transaction
  const [dispRecord] = await db.$transaction([
    db.dispensingRecord.create({
      data: {
        medicineId: parsed.data.medicineId,
        inventoryId: parsed.data.inventoryId,
        patientName: parsed.data.patientName,
        patientHn: parsed.data.patientHn,
        prescriberName: parsed.data.prescriberName,
        prescriptionNo: parsed.data.prescriptionNo,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
        nedlCheckResult: validation.result,
        nedlCheckDetail: validation.detail || null,
        specialCondition: parsed.data.specialCondition,
        diagnosis: parsed.data.diagnosis,
        projectApproval: parsed.data.projectApproval,
        specialistPrescriber: parsed.data.specialistPrescriber,
        treatmentGuidelineFollowed: parsed.data.treatmentGuidelineFollowed,
        narcoticReportRequired: !!medicine.narcoticClass,
        narcoticFormNumber: parsed.data.narcoticFormNumber,
        unitPrice,
        totalPrice,
        dispensedById: userId,
      },
    }),
    db.inventory.update({
      where: { id: parsed.data.inventoryId },
      data: {
        quantity: { decrement: parsed.data.quantity },
      },
    }),
  ]);

  await logAudit({
    userId,
    action: "DISPENSE",
    targetTable: "DispensingRecord",
    targetId: dispRecord.id,
    newValues: { medicineId: medicine.id, patientName: parsed.data.patientName, quantity: parsed.data.quantity },
    description: `จ่าย ${medicine.genericName} ${medicine.strength} ${parsed.data.quantity}${parsed.data.unit} ให้ ${parsed.data.patientName}`,
    ipAddress: getIpFromRequest(req),
  });

  return NextResponse.json({ dispRecord, validation }, { status: 201 });
}

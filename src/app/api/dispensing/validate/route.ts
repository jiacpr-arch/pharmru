import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateDispensing } from "@/lib/nedl-validator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as { id: string }).id;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const medicine = body.medicineId
    ? await db.medicine.findUnique({ where: { id: body.medicineId } })
    : null;

  if (!medicine) return NextResponse.json({ error: "Medicine not found" }, { status: 404 });

  const validation = validateDispensing({
    nedlCategory: medicine.nedlCategory,
    narcoticClass: medicine.narcoticClass,
    conditionsOfUse: medicine.conditionsOfUse,
    diagnosis: body.diagnosis,
    specialCondition: body.specialCondition,
    projectApproval: body.projectApproval,
    specialistPrescriber: body.specialistPrescriber,
    treatmentGuidelineFollowed: body.treatmentGuidelineFollowed,
    narcoticFormNumber: body.narcoticFormNumber,
    prescriberName: body.prescriberName,
    dispenserRole: user.role,
  });

  return NextResponse.json({ validation, medicine });
}

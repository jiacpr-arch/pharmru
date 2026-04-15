import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit, getIpFromRequest } from "@/lib/audit-logger";
import { z } from "zod";

const updateSchema = z.object({
  genericName: z.string().min(1).optional(),
  tradeName: z.string().optional(),
  strength: z.string().optional(),
  dosageForm: z.string().optional(),
  category: z.string().optional(),
  nedlCategory: z.enum(["b", "s", "ex", "R1", "R2"]).nullable().optional(),
  nedlGroup: z.string().nullable().optional(),
  nedlSubgroup: z.string().nullable().optional(),
  conditionsOfUse: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  legalClass: z.enum(["NORMAL", "DANGEROUS", "SPECIALLY_CONTROLLED"]).optional(),
  narcoticClass: z.enum(["PSYCHOTROPIC_2", "PSYCHOTROPIC_3", "PSYCHOTROPIC_4", "NARCOTIC_2", "NARCOTIC_3"]).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  priceUnit: z.string().nullable().optional(),
  removedReason: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const medicine = await db.medicine.findUnique({
    where: { id },
    include: {
      inventories: {
        where: { status: "ACTIVE" },
        orderBy: { expiryDate: "asc" },
      },
    },
  });

  if (!medicine) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(medicine);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const old = await db.medicine.findUnique({ where: { id } });
  const medicine = await db.medicine.update({ where: { id }, data: parsed.data });

  await logAudit({
    userId: (session.user as { id: string }).id,
    action: "UPDATE",
    targetTable: "Medicine",
    targetId: id,
    oldValues: old as Record<string, unknown>,
    newValues: parsed.data as Record<string, unknown>,
    description: `แก้ไขยา: ${medicine.genericName}`,
    ipAddress: getIpFromRequest(req),
  });

  return NextResponse.json(medicine);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { removedReason } = await req.json();

  const old = await db.medicine.findUnique({ where: { id } });
  const medicine = await db.medicine.update({
    where: { id },
    data: { isActive: false, removedReason },
  });

  await logAudit({
    userId: (session.user as { id: string }).id,
    action: "UPDATE",
    targetTable: "Medicine",
    targetId: id,
    oldValues: { isActive: old?.isActive },
    newValues: { isActive: false, removedReason },
    description: `ปิดใช้งานยา: ${medicine.genericName} — ${removedReason}`,
    ipAddress: getIpFromRequest(req),
  });

  return NextResponse.json(medicine);
}

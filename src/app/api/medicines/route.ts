import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit, getIpFromRequest } from "@/lib/audit-logger";
import { z } from "zod";

const medicineSchema = z.object({
  genericName: z.string().min(1),
  tradeName: z.string().optional(),
  strength: z.string().min(1),
  dosageForm: z.string().min(1),
  category: z.string().min(1),
  nedlCategory: z.enum(["b", "s", "ex", "R1", "R2"]).nullable().optional(),
  nedlGroup: z.string().optional(),
  nedlSubgroup: z.string().optional(),
  conditionsOfUse: z.string().optional(),
  remarks: z.string().optional(),
  legalClass: z.enum(["NORMAL", "DANGEROUS", "SPECIALLY_CONTROLLED"]).default("NORMAL"),
  narcoticClass: z.enum(["PSYCHOTROPIC_2", "PSYCHOTROPIC_3", "PSYCHOTROPIC_4", "NARCOTIC_2", "NARCOTIC_3"]).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const nedlCategory = searchParams.get("nedlCategory");
  const category = searchParams.get("category");
  const includeInactive = searchParams.get("includeInactive") === "true";

  const medicines = await db.medicine.findMany({
    where: {
      isActive: includeInactive ? undefined : true,
      ...(search && {
        OR: [
          { genericName: { contains: search, mode: "insensitive" } },
          { tradeName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(nedlCategory && { nedlCategory: nedlCategory as "b" | "s" | "ex" | "R1" | "R2" }),
      ...(category && { category }),
    },
    include: {
      _count: { select: { inventories: true } },
    },
    orderBy: { genericName: "asc" },
  });

  return NextResponse.json(medicines);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = medicineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const medicine = await db.medicine.create({ data: parsed.data });

  await logAudit({
    userId: (session.user as { id: string }).id,
    action: "CREATE",
    targetTable: "Medicine",
    targetId: medicine.id,
    newValues: parsed.data,
    description: `เพิ่มยา: ${medicine.genericName} ${medicine.strength}`,
    ipAddress: getIpFromRequest(req),
  });

  return NextResponse.json(medicine, { status: 201 });
}

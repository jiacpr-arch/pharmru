import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const medicineId = searchParams.get("medicineId");

  if (!medicineId) return NextResponse.json({ error: "medicineId required" }, { status: 400 });

  const lots = await db.inventory.findMany({
    where: {
      medicineId,
      status: "ACTIVE",
      quantity: { gt: 0 },
    },
    orderBy: { expiryDate: "asc" }, // FEFO: หมดอายุก่อน ใช้ก่อน
    include: {
      medicine: { select: { genericName: true, strength: true } },
    },
  });

  return NextResponse.json(lots);
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit, getIpFromRequest } from "@/lib/audit-logger";
import { z } from "zod";

const receiveSchema = z.object({
  medicineId: z.string().min(1),
  batchNumber: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default("เม็ด"),
  manufactureDate: z.string().optional().nullable(),
  expiryDate: z.string().min(1),
  location: z.string().optional(),
  reorderPoint: z.number().default(10),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sortBy") ?? "expiryDate";

  // อัปเดตสถานะหมดอายุอัตโนมัติ
  await db.inventory.updateMany({
    where: {
      expiryDate: { lt: new Date() },
      status: "ACTIVE",
    },
    data: { status: "EXPIRED" },
  });

  const inventories = await db.inventory.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "EXPIRED" | "RECALLED" | "DEPLETED" } : {}),
      medicine: {
        ...(search && {
          OR: [
            { genericName: { contains: search, mode: "insensitive" } },
            { tradeName: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(category && { category }),
        isActive: true,
      },
    },
    include: {
      medicine: {
        select: {
          id: true,
          genericName: true,
          tradeName: true,
          strength: true,
          dosageForm: true,
          category: true,
          nedlCategory: true,
          legalClass: true,
          narcoticClass: true,
          isActive: true,
        },
      },
      receivedBy: { select: { fullName: true } },
    },
    orderBy:
      sortBy === "expiryDate"
        ? { expiryDate: "asc" }
        : sortBy === "quantity"
        ? { quantity: "asc" }
        : { medicine: { genericName: "asc" } },
  });

  return NextResponse.json(inventories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = receiveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const userId = (session.user as { id: string }).id;
  const { medicineId, batchNumber, quantity, unit, manufactureDate, expiryDate, location, reorderPoint } = parsed.data;

  // ถ้า batch เดิมมีอยู่แล้ว → เพิ่มจำนวน
  const existing = await db.inventory.findUnique({
    where: { medicineId_batchNumber: { medicineId, batchNumber } },
  });

  let inventory;
  if (existing) {
    const old = { quantity: existing.quantity };
    inventory = await db.inventory.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, status: "ACTIVE" },
    });
    await logAudit({
      userId,
      action: "UPDATE",
      targetTable: "Inventory",
      targetId: inventory.id,
      oldValues: old,
      newValues: { quantity: inventory.quantity },
      description: `เพิ่มสต็อก Batch ${batchNumber}: +${quantity} ${unit}`,
      ipAddress: getIpFromRequest(req),
    });
  } else {
    inventory = await db.inventory.create({
      data: {
        medicineId,
        batchNumber,
        quantity,
        unit,
        manufactureDate: manufactureDate ? new Date(manufactureDate) : null,
        expiryDate: new Date(expiryDate),
        location,
        reorderPoint,
        receivedById: userId,
      },
    });
    await logAudit({
      userId,
      action: "CREATE",
      targetTable: "Inventory",
      targetId: inventory.id,
      newValues: parsed.data as Record<string, unknown>,
      description: `รับยาเข้าคลัง Batch ${batchNumber}: ${quantity} ${unit}`,
      ipAddress: getIpFromRequest(req),
    });
  }

  return NextResponse.json(inventory, { status: 201 });
}

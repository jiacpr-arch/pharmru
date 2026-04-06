import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [expired, critical, watch, lowStock, removedMeds] = await Promise.all([
    // หมดอายุแล้ว
    db.inventory.count({ where: { status: "EXPIRED" } }),

    // วิกฤต <30 วัน
    db.inventory.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: now, lte: in30 },
      },
    }),

    // เฝ้าระวัง <90 วัน
    db.inventory.count({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: in30, lte: in90 },
      },
    }),

    // สต็อกต่ำ
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "Inventory" i
      WHERE i.status = 'ACTIVE' AND i.quantity <= i."reorderPoint"
    `,

    // ยาที่ถูกตัดออก
    db.medicine.count({ where: { isActive: false } }),
  ]);

  return NextResponse.json({
    expired,
    critical,
    watch,
    lowStock: Number((lowStock as { count: bigint }[])[0]?.count ?? 0),
    removedMeds,
    total: expired + critical + watch,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  const table = searchParams.get("table");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search") ?? "";

  const logs = await db.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action: action as "CREATE" | "UPDATE" | "DELETE" | "DISPENSE" | "LOGIN" }),
      ...(table && { targetTable: table }),
      ...(dateFrom && dateTo && {
        createdAt: { gte: new Date(dateFrom), lte: new Date(`${dateTo}T23:59:59`) },
      }),
      ...(search && { description: { contains: search, mode: "insensitive" } }),
    },
    include: {
      user: { select: { fullName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}

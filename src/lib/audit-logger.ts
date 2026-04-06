import { db } from "@/lib/db";
import { AuditAction } from "@/generated/prisma/client";

interface AuditParams {
  userId: string;
  action: AuditAction;
  targetTable: string;
  targetId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  description?: string;
  ipAddress?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetTable: params.targetTable,
        targetId: params.targetId,
        oldValues: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : undefined,
        newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : undefined,
        description: params.description,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    // Audit log ไม่ควรทำให้ request fail
    console.error("Audit log error:", error);
  }
}

export function getIpFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

import { db } from "@/lib/db";
import { AuditAction } from "@/generated/prisma/client";

interface AuditParams {
  userId: string;
  action: AuditAction;
  targetTable: string;
  targetId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
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
        oldValues: params.oldValues,
        newValues: params.newValues,
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

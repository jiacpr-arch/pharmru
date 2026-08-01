import type { Session } from "next-auth";

// role ถูกใส่ไว้ใน session ผ่าน callback ใน src/lib/auth.ts
export function sessionRole(session: Session): string {
  return ((session.user ?? {}) as { role?: string }).role ?? "";
}

export function hasRole(session: Session, ...roles: string[]): boolean {
  return roles.includes(sessionRole(session));
}

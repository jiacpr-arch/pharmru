"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  targetTable: string;
  targetId: string | null;
  description: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { fullName: string; username: string };
}

const actionStyle: Record<string, { color: string; label: string }> = {
  CREATE: { color: "var(--accent-green)", label: "สร้าง" },
  UPDATE: { color: "var(--accent-blue)", label: "แก้ไข" },
  DELETE: { color: "var(--accent-red)", label: "ลบ" },
  DISPENSE: { color: "var(--accent-orange)", label: "จ่ายยา" },
  LOGIN: { color: "var(--text-muted)", label: "เข้าสู่ระบบ" },
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterAction) params.set("action", filterAction);
    if (filterTable) params.set("table", filterTable);
    const res = await fetch(`/api/audit?${params}`);
    const data = await res.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filterAction, filterTable]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>📋 Audit Trail</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
          บันทึกทุกการเปลี่ยนแปลงในระบบ — อ่านอย่างเดียว ไม่สามารถลบหรือแก้ไขได้
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text" placeholder="🔍 ค้นหาจากคำอธิบาย..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", minWidth: "220px" }}
        />
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}>
          <option value="">Action ทั้งหมด</option>
          <option value="CREATE">สร้าง</option>
          <option value="UPDATE">แก้ไข</option>
          <option value="DELETE">ลบ</option>
          <option value="DISPENSE">จ่ายยา</option>
          <option value="LOGIN">เข้าสู่ระบบ</option>
        </select>
        <select value={filterTable} onChange={(e) => setFilterTable(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}>
          <option value="">ตารางทั้งหมด</option>
          <option value="Medicine">Medicine</option>
          <option value="Inventory">Inventory</option>
          <option value="DispensingRecord">DispensingRecord</option>
        </select>
        <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "13px", display: "flex", alignItems: "center" }}>
          {logs.length} รายการ (แสดง 200 ล่าสุด)
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["วันเวลา", "ผู้ใช้", "Action", "ตาราง", "คำอธิบาย", "IP", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>กำลังโหลด...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>ไม่พบข้อมูล</td></tr>
            ) : (
              logs.map((log) => {
                const style = actionStyle[log.action] ?? actionStyle.CREATE;
                const isExpanded = expanded === log.id;
                const hasValues = log.oldValues || log.newValues;
                return (
                  <>
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "9px 14px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {format(new Date(log.createdAt), "d MMM yy HH:mm:ss", { locale: th })}
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: "13px" }}>
                        <div>{log.user.fullName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{log.user.username}</div>
                      </td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: `${style.color}22`, color: style.color, fontWeight: 600 }}>
                          {style.label}
                        </span>
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{log.targetTable}</td>
                      <td style={{ padding: "9px 14px", fontSize: "13px", maxWidth: "300px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.description ?? "—"}</div>
                      </td>
                      <td style={{ padding: "9px 14px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{log.ipAddress ?? "—"}</td>
                      <td style={{ padding: "9px 14px" }}>
                        {hasValues && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : log.id)}
                            style={{ padding: "3px 8px", background: "var(--bg-hover)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}
                          >
                            {isExpanded ? "ซ่อน" : "Diff"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasValues && (
                      <tr key={`${log.id}-expanded`} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <td colSpan={7} style={{ padding: "12px 14px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {log.oldValues && (
                              <div>
                                <div style={{ fontSize: "11px", color: "var(--accent-red)", marginBottom: "4px" }}>ก่อนแก้ไข (Old)</div>
                                <pre style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-card)", padding: "8px", borderRadius: "6px", overflow: "auto" }}>
                                  {JSON.stringify(log.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.newValues && (
                              <div>
                                <div style={{ fontSize: "11px", color: "var(--accent-green)", marginBottom: "4px" }}>หลังแก้ไข (New)</div>
                                <pre style={{ fontSize: "11px", color: "var(--text-secondary)", background: "var(--bg-card)", padding: "8px", borderRadius: "6px", overflow: "auto" }}>
                                  {JSON.stringify(log.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

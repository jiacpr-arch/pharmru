"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import NedlBadge from "@/components/NedlBadge";
import DispensingForm from "./DispensingForm";

interface DispensingRecord {
  id: string;
  patientName: string;
  patientHn: string | null;
  quantity: number;
  unit: string;
  prescriberName: string;
  nedlCheckResult: string;
  dispensedAt: string;
  medicine: { genericName: string; strength: string; nedlCategory: string | null; narcoticClass: string | null };
  inventory: { batchNumber: string };
  dispensedBy: { fullName: string };
}

const nedlResultStyle: Record<string, { color: string; bg: string; label: string }> = {
  PASS: { color: "var(--accent-green)", bg: "#0d2818", label: "✅ ผ่าน" },
  WARNING: { color: "var(--accent-yellow)", bg: "#2e2400", label: "⚠️ แจ้งเตือน" },
  FAIL: { color: "var(--accent-red)", bg: "#2e0d0d", label: "❌ ไม่ผ่าน" },
};

export default function DispensingPage() {
  const [records, setRecords] = useState<DispensingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [showNew, setShowNew] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterResult) params.set("nedlResult", filterResult);
    const res = await fetch(`/api/dispensing?${params}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filterResult]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, 300);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700 }}>🧾 การจ่ายยา</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            บันทึกการจ่ายยาทั้งหมด {records.length} รายการ
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ padding: "8px 16px", background: "var(--accent-green)", color: "#000", fontWeight: 600, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          + จ่ายยา
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text" placeholder="🔍 ค้นหาชื่อผู้ป่วย, HN, ชื่อยา..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", minWidth: "250px" }}
        />
        <select
          value={filterResult} onChange={(e) => setFilterResult(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}
        >
          <option value="">ผลตรวจทั้งหมด</option>
          <option value="PASS">✅ ผ่าน</option>
          <option value="WARNING">⚠️ แจ้งเตือน</option>
          <option value="FAIL">❌ ไม่ผ่าน</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["วันเวลา", "ชื่อยา", "บัญชียา", "ผู้ป่วย", "จำนวน", "แพทย์สั่ง", "ผลตรวจ NEDL", "ผู้จ่าย"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>กำลังโหลด...</td></tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  ยังไม่มีบันทึกการจ่ายยา
                  <div style={{ marginTop: "12px" }}>
                    <button onClick={() => setShowNew(true)}
                      style={{ padding: "8px 16px", background: "var(--accent-green)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                      จ่ายยาแรก
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const style = nedlResultStyle[rec.nedlCheckResult] ?? nedlResultStyle.PASS;
                return (
                  <tr key={rec.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {format(new Date(rec.dispensedAt), "d MMM yy HH:mm", { locale: th })}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                      <div style={{ fontWeight: 500 }}>{rec.medicine.genericName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{rec.medicine.strength}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <NedlBadge category={rec.medicine.nedlCategory as "b" | "s" | "ex" | "R1" | "R2" | null} />
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                      <div>{rec.patientName}</div>
                      {rec.patientHn && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>HN: {rec.patientHn}</div>}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{rec.quantity} {rec.unit}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>{rec.prescriberName}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: style.bg, color: style.color, border: `1px solid ${style.color}33` }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)" }}>{rec.dispensedBy.fullName}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showNew && <DispensingForm onClose={() => setShowNew(false)} onSaved={fetchRecords} />}
    </div>
  );
}

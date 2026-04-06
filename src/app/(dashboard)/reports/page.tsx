"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";

type ReportType = "stock" | "expiry" | "nedl" | "narcotic";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("stock");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("90");
  const [nedlCategory, setNedlCategory] = useState("");

  const reports = [
    { id: "stock" as ReportType, label: "📦 สต็อกยาคงเหลือ", desc: "รายการยาทั้งหมดพร้อมจำนวนคงเหลือ" },
    { id: "expiry" as ReportType, label: "📅 ยาหมดอายุ/ใกล้หมดอายุ", desc: "กรองตามช่วงเวลาที่เหลือ" },
    { id: "nedl" as ReportType, label: "📋 การจ่ายยาบัญชี ex/R1/R2", desc: "สำหรับส่ง อย. หรือตรวจสอบ" },
    { id: "narcotic" as ReportType, label: "⚠️ วัตถุออกฤทธิ์/ยาเสพติด", desc: "รายงานประจำเดือนส่ง อย." },
  ];

  async function handlePrint(type: ReportType) {
    const params = new URLSearchParams({ type });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (expiryFilter) params.set("expiryDays", expiryFilter);
    if (nedlCategory) params.set("nedlCategory", nedlCategory);
    window.open(`/api/reports?${params}`, "_blank");
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>📊 รายงาน</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
          สร้างและ Export รายงานต่างๆ ของห้องยา
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>
        {/* Report Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {reports.map((r) => (
            <div
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              style={{
                padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                background: activeReport === r.id ? "var(--bg-hover)" : "var(--bg-card)",
                border: `1px solid ${activeReport === r.id ? "var(--accent-blue)" : "var(--border)"}`,
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: activeReport === r.id ? 600 : 400 }}>{r.label}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {/* Report Config */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "24px" }}>
          {activeReport === "stock" && (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>📦 รายงานสต็อกยาคงเหลือ</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                แสดงยาทั้งหมดในระบบพร้อมจำนวนคงเหลือรวมทุก Lot แยกตามหมวดหมู่และตำแหน่งเก็บ
              </p>
              <ReportPreviewTable type="stock" />
              <ExportButtons onPrint={() => handlePrint("stock")} />
            </div>
          )}

          {activeReport === "expiry" && (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>📅 รายงานยาหมดอายุ/ใกล้หมดอายุ</h2>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>แสดงยาที่หมดอายุใน</label>
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                  style={{ padding: "8px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }}
                >
                  <option value="0">หมดอายุแล้ว</option>
                  <option value="30">ภายใน 30 วัน</option>
                  <option value="90">ภายใน 90 วัน</option>
                  <option value="180">ภายใน 180 วัน</option>
                </select>
              </div>
              <ExportButtons onPrint={() => handlePrint("expiry")} />
            </div>
          )}

          {activeReport === "nedl" && (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>📋 รายงานการจ่ายยาบัญชีพิเศษ</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>วันที่เริ่ม</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>วันที่สิ้นสุด</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>บัญชียา</label>
                  <select value={nedlCategory} onChange={(e) => setNedlCategory(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }}>
                    <option value="">ทุกบัญชี</option>
                    <option value="ex">บัญชีเพิ่มเติม (ex)</option>
                    <option value="R1">ร1</option>
                    <option value="R2">ร2</option>
                  </select>
                </div>
              </div>
              <ExportButtons onPrint={() => handlePrint("nedl")} />
            </div>
          )}

          {activeReport === "narcotic" && (
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>⚠️ รายงานวัตถุออกฤทธิ์/ยาเสพติด</h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                รายงานรับ-จ่าย-คงเหลือ สำหรับส่ง อย. ประจำเดือน
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>เดือนเริ่มต้น</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>สิ้นเดือน</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px" }} />
                </div>
              </div>
              <div style={{ padding: "12px 14px", background: "#2e1800", borderRadius: "8px", fontSize: "12px", color: "var(--accent-orange)", marginBottom: "20px" }}>
                ⚠️ รายงานนี้ใช้สำหรับส่ง สำนักงานคณะกรรมการอาหารและยา (อย.) — ตรวจสอบความถูกต้องก่อน Export
              </div>
              <ExportButtons onPrint={() => handlePrint("narcotic")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportButtons({ onPrint }: { onPrint: () => void }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
      <button
        onClick={onPrint}
        style={{ padding: "9px 18px", background: "var(--accent-blue)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
      >
        🖨️ Print / PDF
      </button>
      <button
        onClick={onPrint}
        style={{ padding: "9px 18px", background: "var(--accent-green)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
      >
        📊 Export Excel
      </button>
    </div>
  );
}

function ReportPreviewTable({ type }: { type: string }) {
  return (
    <div style={{ background: "var(--bg-secondary)", borderRadius: "8px", padding: "14px", marginBottom: "16px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
      {type === "stock" && "ตารางจะแสดงชื่อยา · ความแรง · หมวด · จำนวนคงเหลือรวม · Lot ทั้งหมด · หมดอายุเร็วสุด"}
    </div>
  );
}

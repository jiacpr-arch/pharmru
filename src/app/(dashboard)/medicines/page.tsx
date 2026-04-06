"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import NedlBadge from "@/components/NedlBadge";
import MedicineModal from "./MedicineModal";
import DeactivateModal from "./DeactivateModal";

interface Medicine {
  id: string;
  genericName: string;
  tradeName: string | null;
  strength: string;
  dosageForm: string;
  category: string;
  nedlCategory: string | null;
  nedlGroup: string | null;
  nedlSubgroup: string | null;
  conditionsOfUse: string | null;
  remarks: string | null;
  legalClass: string;
  narcoticClass: string | null;
  isActive: boolean;
  removedReason: string | null;
  _count: { inventories: number };
}

const legalClassLabel: Record<string, string> = {
  NORMAL: "ปกติ",
  DANGEROUS: "ยาอันตราย",
  SPECIALLY_CONTROLLED: "ยาควบคุมพิเศษ",
};

const legalClassColor: Record<string, string> = {
  NORMAL: "var(--text-muted)",
  DANGEROUS: "var(--accent-yellow)",
  SPECIALLY_CONTROLLED: "var(--accent-red)",
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterNedl, setFilterNedl] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Medicine | null>(null);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterNedl) params.set("nedlCategory", filterNedl);
    if (filterCategory) params.set("category", filterCategory);
    if (showInactive) params.set("includeInactive", "true");

    const res = await fetch(`/api/medicines?${params}`);
    const data = await res.json();
    setMedicines(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filterNedl, filterCategory, showInactive]);

  useEffect(() => {
    const t = setTimeout(fetchMedicines, 300);
    return () => clearTimeout(t);
  }, [fetchMedicines]);

  const categories = [...new Set(medicines.map((m) => m.category))].sort();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700 }}>💊 ข้อมูลยา Master</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            รายการยาทั้งหมด {medicines.length} รายการ
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "8px 16px",
            background: "var(--accent-green)",
            color: "#000",
            fontWeight: 600,
            fontSize: "13px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + เพิ่มยา
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อยา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "13px",
            minWidth: "200px",
          }}
        />
        <select
          value={filterNedl}
          onChange={(e) => setFilterNedl(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "13px",
          }}
        >
          <option value="">บัญชียาทั้งหมด</option>
          <option value="b">บัญชี ข</option>
          <option value="s">บัญชี ง</option>
          <option value="ex">บัญชีเพิ่มเติม (ex)</option>
          <option value="R1">ร1</option>
          <option value="R2">ร2</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "13px",
          }}
        >
          <option value="">หมวดทั้งหมด</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          แสดงยาที่ปิดใช้งาน
        </label>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ชื่อยา (Generic)", "ความแรง", "รูปแบบ", "บัญชียา", "หมวด", "กฎหมาย", "สต็อก", "สถานะ", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  ไม่พบข้อมูลยา
                </td>
              </tr>
            ) : (
              medicines.map((med) => (
                <tr
                  key={med.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    opacity: med.isActive ? 1 : 0.5,
                  }}
                >
                  <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                    <div style={{ fontWeight: 500, textDecoration: med.isActive ? "none" : "line-through" }}>
                      {med.genericName}
                    </div>
                    {med.tradeName && (
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{med.tradeName}</div>
                    )}
                    {med.narcoticClass && (
                      <span style={{ fontSize: "10px", color: "var(--accent-red)", background: "#2e0d0d", padding: "1px 6px", borderRadius: "3px" }}>
                        ⚠️ ยาควบคุม
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>{med.strength}</td>
                  <td style={{ padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>{med.dosageForm}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <NedlBadge category={med.nedlCategory as "b" | "s" | "ex" | "R1" | "R2" | null} />
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)" }}>{med.category}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: legalClassColor[med.legalClass] }}>
                    {legalClassLabel[med.legalClass]}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    {med._count.inventories} lot
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        color: med.isActive ? "var(--accent-green)" : "var(--text-muted)",
                      }}
                    >
                      {med.isActive ? "● ใช้งาน" : "○ ปิด"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setEditTarget(med)}
                        style={{
                          padding: "4px 10px",
                          background: "var(--bg-hover)",
                          border: "1px solid var(--border)",
                          borderRadius: "5px",
                          color: "var(--text-secondary)",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        แก้ไข
                      </button>
                      {med.isActive && (
                        <button
                          onClick={() => setDeactivateTarget(med)}
                          style={{
                            padding: "4px 10px",
                            background: "#2e0d0d",
                            border: "1px solid var(--accent-red)33",
                            borderRadius: "5px",
                            color: "var(--accent-red)",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ปิด
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <MedicineModal onClose={() => setShowAdd(false)} onSaved={fetchMedicines} />
      )}
      {editTarget && (
        <MedicineModal medicine={editTarget} onClose={() => setEditTarget(null)} onSaved={fetchMedicines} />
      )}
      {deactivateTarget && (
        <DeactivateModal
          medicine={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onSaved={fetchMedicines}
        />
      )}
    </div>
  );
}

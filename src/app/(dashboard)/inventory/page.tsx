"use client";

import { useState, useEffect, useCallback } from "react";
import { format, differenceInDays } from "date-fns";
import { th } from "date-fns/locale";
import ReceiveModal from "./ReceiveModal";

interface InventoryItem {
  id: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  manufactureDate: string | null;
  location: string | null;
  reorderPoint: number;
  status: string;
  receivedDate: string;
  medicine: {
    id: string;
    genericName: string;
    tradeName: string | null;
    strength: string;
    dosageForm: string;
    category: string;
    nedlCategory: string | null;
    legalClass: string;
    narcoticClass: string | null;
  };
  receivedBy: { fullName: string };
}

function expiryStatus(expiryDate: string) {
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (days < 0) return { label: "หมดอายุแล้ว", color: "var(--accent-red)", bg: "#2e0d0d" };
  if (days <= 30) return { label: `${days} วัน (วิกฤต)`, color: "var(--accent-orange)", bg: "#2e1800" };
  if (days <= 90) return { label: `${days} วัน (เฝ้าระวัง)`, color: "var(--accent-yellow)", bg: "#2e2400" };
  return { label: `${days} วัน`, color: "var(--accent-green)", bg: "transparent" };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("expiryDate");
  const [showReceive, setShowReceive] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    params.set("sortBy", sortBy);
    const res = await fetch(`/api/inventory?${params}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filterStatus, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchInventory, 300);
    return () => clearTimeout(t);
  }, [fetchInventory]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700 }}>📦 คลังยา</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            สต็อกทั้งหมด {items.length} lot
          </p>
        </div>
        <button
          onClick={() => setShowReceive(true)}
          style={{ padding: "8px 16px", background: "var(--accent-blue)", color: "#000", fontWeight: 600, fontSize: "13px", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          + รับยาเข้าคลัง
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อยาหรือ batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px", minWidth: "220px" }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}
        >
          <option value="">สถานะทั้งหมด</option>
          <option value="ACTIVE">ปกติ</option>
          <option value="EXPIRED">หมดอายุ</option>
          <option value="RECALLED">ถูกเรียกคืน</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}
        >
          <option value="expiryDate">เรียงตามวันหมดอายุ</option>
          <option value="name">เรียงตามชื่อยา</option>
          <option value="quantity">เรียงตามจำนวน</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ชื่อยา", "Batch", "จำนวน", "ตำแหน่ง", "วันหมดอายุ", "คงเหลือ (วัน)", "สถานะ"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>กำลังโหลด...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>ไม่พบข้อมูล</td></tr>
            ) : (
              items.map((item) => {
                const expiry = expiryStatus(item.expiryDate);
                const isLow = item.quantity <= item.reorderPoint;
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: expiry.bg }}>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                      <div style={{ fontWeight: 500 }}>{item.medicine.genericName}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>{item.medicine.strength} · {item.medicine.dosageForm}</div>
                      {item.medicine.narcoticClass && (
                        <span style={{ fontSize: "10px", color: "var(--accent-red)", background: "#2e0d0d", padding: "1px 5px", borderRadius: "3px" }}>⚠️ ควบคุม</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{item.batchNumber}</td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>
                      <span style={{ color: isLow ? "var(--accent-orange)" : "var(--text-primary)", fontWeight: isLow ? 600 : 400 }}>
                        {item.quantity.toLocaleString()} {item.unit}
                      </span>
                      {isLow && <div style={{ fontSize: "10px", color: "var(--accent-orange)" }}>⚠️ สต็อกต่ำ</div>}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)" }}>{item.location ?? "—"}</td>
                    <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {format(new Date(item.expiryDate), "d MMM yyyy", { locale: th })}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: "12px", color: expiry.color, fontWeight: 600 }}>{expiry.label}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: item.status === "ACTIVE" ? "#0d2818" : "#2e0d0d",
                        color: item.status === "ACTIVE" ? "var(--accent-green)" : "var(--accent-red)",
                      }}>
                        {item.status === "ACTIVE" ? "ปกติ" : item.status === "EXPIRED" ? "หมดอายุ" : item.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showReceive && <ReceiveModal onClose={() => setShowReceive(false)} onSaved={fetchInventory} />}
    </div>
  );
}

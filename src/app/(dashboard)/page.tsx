"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";

interface Alerts {
  expired: number;
  critical: number;
  watch: number;
  lowStock: number;
  removedMeds: number;
  total: number;
}

interface InventoryItem {
  id: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: string;
  medicine: { genericName: string; strength: string; category: string };
}

interface Stats {
  medicines: number;
  inventories: number;
  dispensedToday: number;
}

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [expiring, setExpiring] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ medicines: 0, inventories: 0, dispensedToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [alertsRes, invRes] = await Promise.all([
        fetch("/api/inventory/alerts"),
        fetch("/api/inventory?sortBy=expiryDate&status=ACTIVE"),
      ]);
      const alertsData = await alertsRes.json();
      const invData = await invRes.json();
      setAlerts(alertsData);
      setExpiring(Array.isArray(invData) ? invData.slice(0, 10) : []);

      // count medicines
      const medRes = await fetch("/api/medicines");
      const medData = await medRes.json();
      setStats({
        medicines: Array.isArray(medData) ? medData.length : 0,
        inventories: Array.isArray(invData) ? invData.length : 0,
        dispensedToday: 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "รายการยาทั้งหมด", value: stats.medicines, icon: "💊", color: "var(--accent-blue)", link: "/medicines" },
    { label: "สต็อกทั้งหมด", value: stats.inventories, icon: "📦", color: "var(--accent-green)", link: "/inventory" },
    { label: "จ่ายยาวันนี้", value: stats.dispensedToday, icon: "🧾", color: "var(--accent-orange)", link: "/dispensing" },
    { label: "รายการแจ้งเตือน", value: alerts?.total ?? 0, icon: "⚠️", color: "var(--accent-red)", link: "/inventory?status=EXPIRED" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>🏠 หน้าหลัก</h1>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.link} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px",
              padding: "18px", cursor: "pointer", transition: "border-color 0.15s",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: card.color }}>
                {loading ? "—" : card.value.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alert Box */}
      {alerts && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>🔔 การแจ้งเตือน</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alerts.expired > 0 && (
              <AlertRow color="var(--accent-red)" bg="#2e0d0d" icon="🚨"
                text={`ยาหมดอายุแล้ว ${alerts.expired} รายการ`} link="/inventory?status=EXPIRED" />
            )}
            {alerts.critical > 0 && (
              <AlertRow color="var(--accent-orange)" bg="#2e1800" icon="⚠️"
                text={`ยาใกล้หมดอายุ (<30 วัน) ${alerts.critical} รายการ`} link="/inventory" />
            )}
            {alerts.watch > 0 && (
              <AlertRow color="var(--accent-yellow)" bg="#2e2400" icon="👀"
                text={`ยาควรเฝ้าระวัง (<90 วัน) ${alerts.watch} รายการ`} link="/inventory" />
            )}
            {alerts.lowStock > 0 && (
              <AlertRow color="var(--accent-yellow)" bg="#1c1c00" icon="📉"
                text={`ยาสต็อกต่ำกว่าจุดสั่งซื้อ ${alerts.lowStock} รายการ`} link="/inventory" />
            )}
            {alerts.removedMeds > 0 && (
              <AlertRow color="var(--accent-purple)" bg="#1e0d2e" icon="📋"
                text={`ยาที่ถูกตัดออกจากบัญชี ${alerts.removedMeds} รายการ`} link="/medicines?includeInactive=true" />
            )}
            {alerts.total === 0 && alerts.lowStock === 0 && alerts.removedMeds === 0 && (
              <div style={{ color: "var(--accent-green)", fontSize: "13px" }}>✅ ไม่มีการแจ้งเตือนในขณะนี้</div>
            )}
          </div>
        </div>
      )}

      {/* Top Expiring */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600 }}>📅 ยาที่ใกล้หมดอายุ (10 อันดับแรก)</h2>
          <Link href="/inventory" style={{ fontSize: "12px", color: "var(--accent-blue)", textDecoration: "none" }}>ดูทั้งหมด →</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["ชื่อยา", "Batch", "จำนวน", "วันหมดอายุ", "คงเหลือ (วัน)"].map((h) => (
                <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>กำลังโหลด...</td></tr>
            ) : (
              expiring.map((item) => {
                const days = differenceInDays(new Date(item.expiryDate), new Date());
                const color = days < 0 ? "var(--accent-red)" : days <= 30 ? "var(--accent-orange)" : days <= 90 ? "var(--accent-yellow)" : "var(--accent-green)";
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "9px 14px", fontSize: "13px" }}>
                      {item.medicine.genericName} <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{item.medicine.strength}</span>
                    </td>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>{item.batchNumber}</td>
                    <td style={{ padding: "9px 14px", fontSize: "13px" }}>{item.quantity.toLocaleString()} {item.unit}</td>
                    <td style={{ padding: "9px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>{format(new Date(item.expiryDate), "d MMM yyyy", { locale: th })}</td>
                    <td style={{ padding: "9px 14px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color }}>{days < 0 ? "หมดอายุแล้ว" : `${days} วัน`}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertRow({ color, bg, icon, text, link }: { color: string; bg: string; icon: string; text: string; link: string }) {
  return (
    <Link href={link} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: bg, borderRadius: "6px", border: `1px solid ${color}33`, cursor: "pointer" }}>
        <span style={{ fontSize: "14px" }}>{icon}</span>
        <span style={{ fontSize: "13px", color }}>{text}</span>
        <span style={{ marginLeft: "auto", fontSize: "11px", color }}>→</span>
      </div>
    </Link>
  );
}

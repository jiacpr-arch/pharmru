"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

async function logout() {
  const csrfRes = await fetch("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();
  await fetch("/api/auth/signout", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, json: "true" }),
  });
  window.location.href = "/login";
}

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/medicines", label: "ข้อมูลยา", icon: "💊" },
  { href: "/inventory", label: "คลังยา", icon: "📦" },
  { href: "/dispensing", label: "จ่ายยา", icon: "🧾" },
  { href: "/audit", label: "Audit Trail", icon: "📋" },
  { href: "/reports", label: "รายงาน", icon: "📊" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        width: "220px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent-green)" }}>
          💉 ห้องยา
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
          Pharmacy Management
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                background: active ? "var(--bg-hover)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
          ผู้ใช้งาน
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px" }}>
          PHARMACIST
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "7px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  medicine: { id: string; genericName: string; strength: string };
  onClose: () => void;
  onSaved: () => void;
}

export default function DeactivateModal({ medicine, onClose, onSaved }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!reason.trim()) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/medicines/${medicine.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removedReason: reason }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("ปิดใช้งานยาสำเร็จ");
      onSaved();
      onClose();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-red)", marginBottom: "12px" }}>
          ⚠️ ปิดใช้งานยา
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          ยา <strong style={{ color: "var(--text-primary)" }}>{medicine.genericName} {medicine.strength}</strong> จะถูกปิดใช้งาน และจะไม่สามารถจ่ายยาได้อีก
        </p>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            เหตุผลในการปิดใช้งาน *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เช่น ถูกตัดออกจากบัญชียาหลักแห่งชาติ พ.ศ. 2569"
            style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px", resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
            ยกเลิก
          </button>
          <button onClick={handleConfirm} disabled={loading}
            style={{ padding: "8px 16px", background: "var(--accent-red)", color: "#fff", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "กำลังบันทึก..." : "ยืนยันปิดใช้งาน"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Medicine { id: string; genericName: string; strength: string; dosageForm: string; }

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function ReceiveModal({ onClose, onSaved }: Props) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    medicineId: "",
    batchNumber: "",
    quantity: "",
    unit: "เม็ด",
    manufactureDate: "",
    expiryDate: "",
    location: "",
    reorderPoint: "10",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      const params = new URLSearchParams({ search });
      const res = await fetch(`/api/medicines?${params}`);
      const data = await res.json();
      setMedicines(Array.isArray(data) ? data.slice(0, 20) : []);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: parseFloat(form.quantity),
        reorderPoint: parseFloat(form.reorderPoint),
        manufactureDate: form.manufactureDate || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("รับยาเข้าคลังสำเร็จ");
      onSaved();
      onClose();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", background: "var(--bg-secondary)",
    border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px",
  };

  const selectedMed = medicines.find((m) => m.id === form.medicineId);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>📥 รับยาเข้าคลัง</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* ค้นหายา */}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>ค้นหายา</label>
            <input
              style={inputStyle}
              placeholder="พิมพ์ชื่อยา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {medicines.length > 0 && !selectedMed && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", marginTop: "4px", maxHeight: "160px", overflowY: "auto" }}>
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => { setForm({ ...form, medicineId: m.id }); setSearch(`${m.genericName} ${m.strength}`); setMedicines([]); }}
                    style={{ padding: "8px 12px", cursor: "pointer", fontSize: "13px", borderBottom: "1px solid var(--border)" }}
                  >
                    <strong>{m.genericName}</strong> {m.strength} · {m.dosageForm}
                  </div>
                ))}
              </div>
            )}
            {selectedMed && (
              <div style={{ marginTop: "6px", padding: "6px 10px", background: "#0d2818", borderRadius: "6px", fontSize: "12px", color: "var(--accent-green)" }}>
                ✅ {selectedMed.genericName} {selectedMed.strength}
                <button type="button" onClick={() => { setForm({ ...form, medicineId: "" }); setSearch(""); }}
                  style={{ marginLeft: "8px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px" }}>
                  เปลี่ยน
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Batch Number *</label>
              <input required style={inputStyle} value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="เช่น 032S/136" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>จำนวน *</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input required type="number" min="0.01" step="0.01" style={{ ...inputStyle, flex: 1 }} value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <select style={{ ...inputStyle, width: "80px" }} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option>เม็ด</option>
                  <option>ขวด</option>
                  <option>แผง</option>
                  <option>กล่อง</option>
                  <option>หลอด</option>
                  <option>ซอง</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>วันผลิต</label>
              <input type="date" style={inputStyle} value={form.manufactureDate} onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>วันหมดอายุ *</label>
              <input required type="date" style={inputStyle} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>ตำแหน่งเก็บ</label>
              <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="เช่น ชั้น A-3" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>จุดสั่งซื้อขั้นต่ำ</label>
              <input type="number" style={inputStyle} value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving || !form.medicineId}
              style={{ padding: "8px 20px", background: "var(--accent-blue)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: (saving || !form.medicineId) ? 0.6 : 1 }}>
              {saving ? "กำลังบันทึก..." : "รับยาเข้าคลัง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

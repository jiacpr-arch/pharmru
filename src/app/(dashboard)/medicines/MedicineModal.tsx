"use client";

import { useState } from "react";
import toast from "react-hot-toast";

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
  price: number | null;
  priceUnit: string | null;
}

interface Props {
  medicine?: Medicine;
  onClose: () => void;
  onSaved: () => void;
}

const defaultForm = {
  genericName: "",
  tradeName: "",
  strength: "",
  dosageForm: "tablet",
  category: "ยาเม็ด",
  nedlCategory: "",
  nedlGroup: "",
  nedlSubgroup: "",
  conditionsOfUse: "",
  remarks: "",
  legalClass: "NORMAL",
  narcoticClass: "",
  price: "",
  priceUnit: "เม็ด",
};

export default function MedicineModal({ medicine, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    genericName: medicine?.genericName ?? defaultForm.genericName,
    tradeName: medicine?.tradeName ?? defaultForm.tradeName,
    strength: medicine?.strength ?? defaultForm.strength,
    dosageForm: medicine?.dosageForm ?? defaultForm.dosageForm,
    category: medicine?.category ?? defaultForm.category,
    nedlCategory: medicine?.nedlCategory ?? defaultForm.nedlCategory,
    nedlGroup: medicine?.nedlGroup ?? defaultForm.nedlGroup,
    nedlSubgroup: medicine?.nedlSubgroup ?? defaultForm.nedlSubgroup,
    conditionsOfUse: medicine?.conditionsOfUse ?? defaultForm.conditionsOfUse,
    remarks: medicine?.remarks ?? defaultForm.remarks,
    legalClass: medicine?.legalClass ?? defaultForm.legalClass,
    narcoticClass: medicine?.narcoticClass ?? defaultForm.narcoticClass,
    price: medicine?.price != null ? String(medicine.price) : defaultForm.price,
    priceUnit: medicine?.priceUnit ?? defaultForm.priceUnit,
  });
  const [saving, setSaving] = useState(false);

  const requiresConditions = ["ex", "R1", "R2"].includes(form.nedlCategory);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requiresConditions && !form.conditionsOfUse.trim()) {
      toast.error("บัญชียานี้ต้องระบุเงื่อนไขการใช้ยา");
      return;
    }
    const priceNum = form.price.trim() === "" ? null : Number(form.price);
    if (priceNum != null && (!Number.isFinite(priceNum) || priceNum < 0)) {
      toast.error("ราคายาไม่ถูกต้อง");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      nedlCategory: form.nedlCategory || null,
      narcoticClass: form.narcoticClass || null,
      tradeName: form.tradeName || null,
      nedlGroup: form.nedlGroup || null,
      nedlSubgroup: form.nedlSubgroup || null,
      conditionsOfUse: form.conditionsOfUse || null,
      remarks: form.remarks || null,
      price: priceNum,
      priceUnit: form.priceUnit || null,
    };

    const url = medicine ? `/api/medicines/${medicine.id}` : "/api/medicines";
    const method = medicine ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      toast.success(medicine ? "แก้ไขข้อมูลยาสำเร็จ" : "เพิ่มยาสำเร็จ");
      onSaved();
      onClose();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    color: "var(--text-primary)",
    fontSize: "13px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#00000088",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>
          {medicine ? "✏️ แก้ไขข้อมูลยา" : "➕ เพิ่มยาใหม่"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>ชื่อยา (Generic) *</label>
              <input required style={inputStyle} value={form.genericName}
                onChange={(e) => setForm({ ...form, genericName: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>ชื่อการค้า</label>
              <input style={inputStyle} value={form.tradeName ?? ""}
                onChange={(e) => setForm({ ...form, tradeName: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>ความแรง *</label>
              <input required style={inputStyle} value={form.strength}
                onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="เช่น 500mg, 250mg/5ml" />
            </div>
            <div>
              <label style={labelStyle}>รูปแบบยา *</label>
              <select required style={inputStyle} value={form.dosageForm}
                onChange={(e) => setForm({ ...form, dosageForm: e.target.value })}>
                <option value="tablet">Tablet (เม็ด)</option>
                <option value="capsule">Capsule (แคปซูล)</option>
                <option value="syrup">Syrup (น้ำเชื่อม)</option>
                <option value="solution">Solution (สารละลาย)</option>
                <option value="suspension">Suspension (น้ำแขวนตะกอน)</option>
                <option value="injection">Injection (ยาฉีด)</option>
                <option value="cream">Cream (ครีม)</option>
                <option value="ointment">Ointment (ขี้ผึ้ง)</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>หมวดยา *</label>
              <select required style={inputStyle} value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="ยาเม็ด">ยาเม็ด</option>
                <option value="ยาน้ำ">ยาน้ำ</option>
                <option value="ยาแก้ปวด">ยาแก้ปวด</option>
                <option value="ยาฉีด">ยาฉีด</option>
                <option value="ยาทาภายนอก">ยาทาภายนอก</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>บัญชียาหลักแห่งชาติ</label>
              <select style={inputStyle} value={form.nedlCategory ?? ""}
                onChange={(e) => setForm({ ...form, nedlCategory: e.target.value })}>
                <option value="">ไม่ระบุ</option>
                <option value="b">บัญชี ข (b)</option>
                <option value="s">บัญชี ง (s)</option>
                <option value="ex">บัญชีเพิ่มเติม (ex)</option>
                <option value="R1">ร1 (R1)</option>
                <option value="R2">ร2 (R2)</option>
              </select>
            </div>
          </div>

          {requiresConditions && (
            <div style={{ background: "#1c1200", border: "1px solid var(--accent-orange)33", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--accent-orange)", marginBottom: "8px" }}>
                ⚠️ บัญชียานี้ต้องระบุเงื่อนไขการใช้ตามประกาศฯ
              </div>
              <label style={labelStyle}>เงื่อนไขการใช้ยา *</label>
              <textarea
                required={requiresConditions}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                value={form.conditionsOfUse ?? ""}
                onChange={(e) => setForm({ ...form, conditionsOfUse: e.target.value })}
                placeholder="ระบุเงื่อนไขการใช้จากประกาศบัญชียาหลักแห่งชาติ..."
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>ประเภทตามกฎหมาย</label>
              <select style={inputStyle} value={form.legalClass}
                onChange={(e) => setForm({ ...form, legalClass: e.target.value })}>
                <option value="NORMAL">ยาปกติ</option>
                <option value="DANGEROUS">ยาอันตราย</option>
                <option value="SPECIALLY_CONTROLLED">ยาควบคุมพิเศษ</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>ประเภทวัตถุออกฤทธิ์/ยาเสพติด</label>
              <select style={inputStyle} value={form.narcoticClass ?? ""}
                onChange={(e) => setForm({ ...form, narcoticClass: e.target.value })}>
                <option value="">ไม่ใช่ยาควบคุม</option>
                <option value="PSYCHOTROPIC_4">วัตถุออกฤทธิ์ประเภท 4</option>
                <option value="PSYCHOTROPIC_3">วัตถุออกฤทธิ์ประเภท 3</option>
                <option value="PSYCHOTROPIC_2">วัตถุออกฤทธิ์ประเภท 2</option>
                <option value="NARCOTIC_2">ยาเสพติดประเภท 2</option>
                <option value="NARCOTIC_3">ยาเสพติดประเภท 3</option>
              </select>
            </div>
          </div>

          {form.narcoticClass && (
            <div style={{ background: "#2e0d0d", border: "1px solid var(--accent-red)33", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "var(--accent-red)" }}>
              ⚠️ ยาวัตถุออกฤทธิ์/ยาเสพติด — การจ่ายยาต้องบันทึกรายงาน อย. ทุกครั้ง
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>ราคาต่อหน่วย (บาท)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="เช่น 2.50"
              />
            </div>
            <div>
              <label style={labelStyle}>หน่วยราคา</label>
              <select style={inputStyle} value={form.priceUnit}
                onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}>
                <option value="เม็ด">เม็ด</option>
                <option value="แคปซูล">แคปซูล</option>
                <option value="ขวด">ขวด</option>
                <option value="ซอง">ซอง</option>
                <option value="หลอด">หลอด</option>
                <option value="amp">amp (ยาฉีด)</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>หมายเหตุ</label>
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }}
              value={form.remarks ?? ""}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "8px 20px", background: "var(--accent-green)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: saving ? 0.7 : 1 }}>
              {saving ? "กำลังบันทึก..." : medicine ? "บันทึกการแก้ไข" : "เพิ่มยา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

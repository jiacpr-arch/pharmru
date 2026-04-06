"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import NedlBadge from "@/components/NedlBadge";

interface Medicine {
  id: string;
  genericName: string;
  tradeName: string | null;
  strength: string;
  dosageForm: string;
  nedlCategory: string | null;
  nedlGroup: string | null;
  conditionsOfUse: string | null;
  legalClass: string;
  narcoticClass: string | null;
  isActive: boolean;
}

interface InventoryLot {
  id: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: string | null;
}

interface ValidationResult {
  result: "PASS" | "WARNING" | "FAIL";
  detail: string;
  blockers: string[];
  warnings: string[];
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const stepLabels = ["เลือกยา", "กรอกข้อมูล", "ตรวจสอบ NEDL", "ยืนยัน"];

export default function DispensingForm({ onClose, onSaved }: Props) {
  const [step, setStep] = useState(1);
  const [medSearch, setMedSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<InventoryLot | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patientName: "",
    patientHn: "",
    prescriberName: "",
    prescriptionNo: "",
    quantity: "",
    unit: "เม็ด",
    diagnosis: "",
    specialCondition: "",
    projectApproval: "",
    specialistPrescriber: "",
    treatmentGuidelineFollowed: false,
    narcoticFormNumber: "",
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // ค้นหายา
  useEffect(() => {
    if (step !== 1) return;
    const t = setTimeout(async () => {
      if (!medSearch) { setMedicines([]); return; }
      const res = await fetch(`/api/medicines?search=${encodeURIComponent(medSearch)}`);
      const data = await res.json();
      setMedicines(Array.isArray(data) ? data.slice(0, 15) : []);
    }, 300);
    return () => clearTimeout(t);
  }, [medSearch, step]);

  // โหลด FEFO lots เมื่อเลือกยา
  useEffect(() => {
    if (!selectedMed) return;
    async function loadLots() {
      const res = await fetch(`/api/inventory/fefo?medicineId=${selectedMed!.id}`);
      const data = await res.json();
      setLots(Array.isArray(data) ? data : []);
      if (data.length > 0) setSelectedLot(data[0]);
    }
    loadLots();
  }, [selectedMed]);

  // validate NEDL เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (step !== 3 || !selectedMed) return;
    async function validate() {
      const res = await fetch("/api/dispensing/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId: selectedMed!.id, ...form }),
      });
      const data = await res.json();
      setValidation(data.validation ?? null);
    }
    validate();
  }, [step, selectedMed, form]);

  async function handleDispense() {
    if (!selectedMed || !selectedLot) return;
    setSaving(true);
    const res = await fetch("/api/dispensing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId: selectedMed.id,
        inventoryId: selectedLot.id,
        ...form,
        quantity: parseFloat(form.quantity),
      }),
    });
    setSaving(false);

    if (res.ok) {
      toast.success(`จ่ายยา ${selectedMed.genericName} สำเร็จ!`);
      onSaved();
      onClose();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "เกิดข้อผิดพลาด");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", background: "var(--bg-secondary)",
    border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "13px",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" };

  const needsNedl = selectedMed && ["ex", "R1", "R2"].includes(selectedMed.nedlCategory ?? "");
  const needsNarcotic = !!selectedMed?.narcoticClass;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "620px", maxHeight: "92vh", overflowY: "auto" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: "0", marginBottom: "24px" }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: step > i + 1 ? "var(--accent-green)" : step === i + 1 ? "var(--accent-blue)" : "var(--bg-secondary)",
                border: `2px solid ${step >= i + 1 ? (step > i + 1 ? "var(--accent-green)" : "var(--accent-blue)") : "var(--border)"}`,
                fontSize: "12px", fontWeight: 700, color: step >= i + 1 ? "#000" : "var(--text-muted)",
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: "10px", color: step === i + 1 ? "var(--text-primary)" : "var(--text-muted)", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: เลือกยา */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>💊 Step 1 — เลือกยาที่จะจ่าย</h2>
            <input
              autoFocus
              type="text" placeholder="พิมพ์ชื่อยา..."
              value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
              style={inputStyle}
            />
            {medicines.length > 0 && !selectedMed && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "6px", marginTop: "6px" }}>
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => { setSelectedMed(m); setMedSearch(`${m.genericName} ${m.strength}`); setMedicines([]); }}
                    style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid var(--border)", fontSize: "13px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{m.genericName}</strong> {m.strength}
                        {m.tradeName && <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "11px" }}>({m.tradeName})</span>}
                      </div>
                      <NedlBadge category={m.nedlCategory as "b" | "s" | "ex" | "R1" | "R2" | null} />
                    </div>
                    {!m.isActive && (
                      <div style={{ color: "var(--accent-red)", fontSize: "11px", marginTop: "3px" }}>⛔ ยานี้ถูกปิดใช้งาน</div>
                    )}
                    {m.narcoticClass && (
                      <div style={{ color: "var(--accent-orange)", fontSize: "11px", marginTop: "3px" }}>⚠️ วัตถุออกฤทธิ์/ยาเสพติด</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedMed && (
              <div style={{ marginTop: "12px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px" }}>{selectedMed.genericName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                      {selectedMed.strength} · {selectedMed.dosageForm}
                    </div>
                  </div>
                  <NedlBadge category={selectedMed.nedlCategory as "b" | "s" | "ex" | "R1" | "R2" | null} />
                </div>

                {!selectedMed.isActive && (
                  <div style={{ marginTop: "10px", padding: "8px 12px", background: "#2e0d0d", borderRadius: "6px", color: "var(--accent-red)", fontSize: "12px" }}>
                    ⛔ ยานี้ถูกปิดใช้งาน ไม่สามารถจ่ายได้
                  </div>
                )}
                {selectedMed.narcoticClass && (
                  <div style={{ marginTop: "10px", padding: "8px 12px", background: "#2e1800", borderRadius: "6px", color: "var(--accent-orange)", fontSize: "12px" }}>
                    ⚠️ ยาวัตถุออกฤทธิ์/ยาเสพติด — ต้องบันทึกรายงาน อย.
                  </div>
                )}
                {selectedMed.conditionsOfUse && (
                  <div style={{ marginTop: "10px", padding: "10px 12px", background: "#1c1200", borderRadius: "6px", border: "1px solid var(--accent-orange)33" }}>
                    <div style={{ fontSize: "11px", color: "var(--accent-orange)", marginBottom: "4px" }}>เงื่อนไขการใช้ยา:</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{selectedMed.conditionsOfUse}</div>
                  </div>
                )}

                {/* เลือก Lot */}
                {lots.length > 0 && (
                  <div style={{ marginTop: "14px" }}>
                    <label style={labelStyle}>Lot ที่จะจ่าย (FEFO — แนะนำ lot แรก)</label>
                    <select
                      style={inputStyle}
                      value={selectedLot?.id ?? ""}
                      onChange={(e) => setSelectedLot(lots.find((l) => l.id === e.target.value) ?? null)}
                    >
                      {lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          Batch {lot.batchNumber} — {lot.quantity.toLocaleString()} {lot.unit} (หมดอายุ {new Date(lot.expiryDate).toLocaleDateString("th-TH")})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {lots.length === 0 && <div style={{ marginTop: "10px", color: "var(--accent-red)", fontSize: "12px" }}>⚠️ ไม่มีสต็อกยานี้</div>}

                <button
                  type="button"
                  onClick={() => { setSelectedMed(null); setMedSearch(""); setLots([]); setSelectedLot(null); }}
                  style={{ marginTop: "10px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", padding: 0 }}
                >
                  เปลี่ยนยา
                </button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>ยกเลิก</button>
              <button
                onClick={() => setStep(2)}
                disabled={!selectedMed || !selectedLot || !selectedMed.isActive}
                style={{ padding: "8px 20px", background: "var(--accent-blue)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: (!selectedMed || !selectedLot || !selectedMed.isActive) ? 0.5 : 1 }}
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: กรอกข้อมูล */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>📋 Step 2 — ข้อมูลการจ่ายยา</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>ชื่อผู้ป่วย *</label>
                <input required style={inputStyle} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="นาย/นาง/นางสาว..." />
              </div>
              <div>
                <label style={labelStyle}>HN (Hospital Number)</label>
                <input style={inputStyle} value={form.patientHn} onChange={(e) => setForm({ ...form, patientHn: e.target.value })} placeholder="เช่น 12345678" />
              </div>
              <div>
                <label style={labelStyle}>แพทย์ผู้สั่งยา *</label>
                <input required style={inputStyle} value={form.prescriberName} onChange={(e) => setForm({ ...form, prescriberName: e.target.value })} placeholder="นพ./พญ..." />
              </div>
              <div>
                <label style={labelStyle}>เลขที่ใบสั่งยา</label>
                <input style={inputStyle} value={form.prescriptionNo} onChange={(e) => setForm({ ...form, prescriptionNo: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>จำนวน *</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input required type="number" min="0.01" step="0.01" style={{ ...inputStyle, flex: 1 }}
                    value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    max={selectedLot?.quantity}
                  />
                  <select style={{ ...inputStyle, width: "80px" }} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option>เม็ด</option>
                    <option>ขวด</option>
                    <option>แผง</option>
                    <option>กล่อง</option>
                    <option>ซอง</option>
                    <option>หลอด</option>
                  </select>
                </div>
                {selectedLot && (
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                    คงเหลือ: {selectedLot.quantity.toLocaleString()} {selectedLot.unit}
                  </div>
                )}
              </div>

              {needsNedl && (
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ padding: "10px 12px", background: "#1c1200", borderRadius: "6px", border: "1px solid var(--accent-orange)33", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", color: "var(--accent-orange)", marginBottom: "6px" }}>
                      ⚠️ บัญชียา {selectedMed?.nedlCategory} — ต้องระบุข้อมูลเพิ่มเติม
                    </div>
                    {selectedMed?.conditionsOfUse && (
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{selectedMed.conditionsOfUse}</div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>การวินิจฉัยโรค (Diagnosis)</label>
                      <input style={inputStyle} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="ICD-10 หรือชื่อโรค" />
                    </div>
                    {selectedMed?.nedlCategory === "R1" && (
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>โครงการที่ได้รับอนุมัติ *</label>
                        <input style={inputStyle} value={form.projectApproval} onChange={(e) => setForm({ ...form, projectApproval: e.target.value })} />
                      </div>
                    )}
                    {selectedMed?.nedlCategory === "R2" && (
                      <>
                        <div>
                          <label style={labelStyle}>แพทย์ผู้เชี่ยวชาญ *</label>
                          <input style={inputStyle} value={form.specialistPrescriber} onChange={(e) => setForm({ ...form, specialistPrescriber: e.target.value })} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input type="checkbox" id="guideline" checked={form.treatmentGuidelineFollowed}
                            onChange={(e) => setForm({ ...form, treatmentGuidelineFollowed: e.target.checked })} />
                          <label htmlFor="guideline" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>
                            ปฏิบัติตามแนวทางการรักษา
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {needsNarcotic && (
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ padding: "10px 12px", background: "#2e1800", borderRadius: "6px", border: "1px solid var(--accent-orange)33", marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", color: "var(--accent-orange)" }}>⚠️ ยาวัตถุออกฤทธิ์/ยาเสพติด — ต้องบันทึกรายงาน อย.</div>
                  </div>
                  <label style={labelStyle}>เลขที่แบบฟอร์มรายงาน อย. *</label>
                  <input style={inputStyle} value={form.narcoticFormNumber} onChange={(e) => setForm({ ...form, narcoticFormNumber: e.target.value })} placeholder="เลขที่แบบฟอร์ม..." />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button onClick={() => setStep(1)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>← ย้อนกลับ</button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.patientName || !form.prescriberName || !form.quantity}
                style={{ padding: "8px 20px", background: "var(--accent-blue)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: (!form.patientName || !form.prescriberName || !form.quantity) ? 0.5 : 1 }}
              >
                ตรวจสอบ NEDL →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: ผลตรวจสอบ NEDL */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>🔍 Step 3 — ผลตรวจสอบ NEDL Compliance</h2>

            {!validation ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>กำลังตรวจสอบ...</div>
            ) : (
              <div>
                <div style={{
                  padding: "16px", borderRadius: "10px", marginBottom: "16px",
                  background: validation.result === "PASS" ? "#0d2818" : validation.result === "WARNING" ? "#2e2400" : "#2e0d0d",
                  border: `1px solid ${validation.result === "PASS" ? "var(--accent-green)" : validation.result === "WARNING" ? "var(--accent-yellow)" : "var(--accent-red)"}33`,
                }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: validation.result === "PASS" ? "var(--accent-green)" : validation.result === "WARNING" ? "var(--accent-yellow)" : "var(--accent-red)" }}>
                    {validation.result === "PASS" ? "✅ ผ่านการตรวจสอบ" : validation.result === "WARNING" ? "⚠️ แจ้งเตือน — จ่ายได้" : "❌ ไม่ผ่าน — ไม่สามารถจ่ายได้"}
                  </div>
                  {validation.detail && (
                    <div style={{ marginTop: "10px", whiteSpace: "pre-line", fontSize: "13px", color: "var(--text-secondary)" }}>
                      {validation.detail}
                    </div>
                  )}
                </div>

                {validation.result !== "FAIL" && validation.result === "WARNING" && (
                  <div style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    คุณสามารถจ่ายยาได้ แต่โปรดระมัดระวัง
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <button onClick={() => setStep(2)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>← ย้อนกลับ</button>
              <button
                onClick={() => setStep(4)}
                disabled={!validation || validation.result === "FAIL"}
                style={{ padding: "8px 20px", background: "var(--accent-green)", color: "#000", fontWeight: 600, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", opacity: (!validation || validation.result === "FAIL") ? 0.4 : 1 }}
              >
                ดำเนินการต่อ →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: ยืนยัน */}
        {step === 4 && selectedMed && selectedLot && (
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>✅ Step 4 — ยืนยันการจ่ายยา</h2>

            <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div><span style={{ color: "var(--text-muted)" }}>ชื่อยา:</span><div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedMed.genericName} {selectedMed.strength}</div></div>
                <div><span style={{ color: "var(--text-muted)" }}>Batch:</span><div style={{ fontFamily: "monospace", marginTop: "2px" }}>{selectedLot.batchNumber}</div></div>
                <div><span style={{ color: "var(--text-muted)" }}>จำนวน:</span><div style={{ fontWeight: 600, color: "var(--accent-orange)", marginTop: "2px" }}>{form.quantity} {form.unit}</div></div>
                <div><span style={{ color: "var(--text-muted)" }}>ผู้ป่วย:</span><div style={{ marginTop: "2px" }}>{form.patientName} {form.patientHn ? `(HN: ${form.patientHn})` : ""}</div></div>
                <div><span style={{ color: "var(--text-muted)" }}>แพทย์สั่ง:</span><div style={{ marginTop: "2px" }}>{form.prescriberName}</div></div>
                <div><span style={{ color: "var(--text-muted)" }}>ผล NEDL:</span>
                  <div style={{ marginTop: "2px", color: validation?.result === "PASS" ? "var(--accent-green)" : "var(--accent-yellow)" }}>
                    {validation?.result === "PASS" ? "✅ ผ่าน" : "⚠️ แจ้งเตือน"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "10px 14px", background: "#1c1200", borderRadius: "8px", fontSize: "12px", color: "var(--accent-yellow)", marginBottom: "20px" }}>
              ⚠️ การจ่ายยาจะตัดสต็อกทันทีและบันทึก Audit Log — ไม่สามารถย้อนกลับได้
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(3)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>← ย้อนกลับ</button>
              <button
                onClick={handleDispense}
                disabled={saving}
                style={{ padding: "10px 24px", background: "var(--accent-green)", color: "#000", fontWeight: 700, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "กำลังบันทึก..." : "✅ ยืนยันจ่ายยา"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

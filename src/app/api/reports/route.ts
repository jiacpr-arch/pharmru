import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// รายงานเปิดในแท็บใหม่เป็นหน้า HTML พร้อมสั่งพิมพ์ได้ทันที
// ข้อมูลจาก DB (ชื่อผู้ป่วย/ชื่อยา ฯลฯ) ต้อง escape ก่อนใส่ HTML เสมอ

function esc(value: unknown): string {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function thDate(d: Date | null | undefined): string {
  if (!d) return "-";
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function page(title: string, subtitle: string, tableHtml: string): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 32px; color: #111; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 13px; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f2f2f2; }
  .num { text-align: right; }
  .warn { color: #b00; font-weight: 600; }
  .empty { color: #777; padding: 24px 0; }
  .print-btn { margin-bottom: 16px; padding: 8px 16px; cursor: pointer; }
  @media print { .print-btn { display: none; } body { margin: 0; } }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ พิมพ์รายงาน</button>
<h1>${esc(title)}</h1>
<div class="sub">${esc(subtitle)} — สร้างเมื่อ ${esc(new Date().toLocaleString("th-TH"))}</div>
${tableHtml}
</body>
</html>`;
}

function rows(cells: string[][]): string {
  if (cells.length === 0) return `<div class="empty">ไม่มีข้อมูลในเงื่อนไขที่เลือก</div>`;
  return cells.map((r) => `<tr>${r.join("")}</tr>`).join("\n");
}

const td = (v: unknown) => `<td>${esc(v)}</td>`;
const tdNum = (v: unknown) => `<td class="num">${esc(v)}</td>`;

async function stockReport(): Promise<string> {
  const inventories = await db.inventory.findMany({
    where: { status: "ACTIVE", medicine: { isActive: true } },
    include: { medicine: { select: { genericName: true, strength: true, dosageForm: true, category: true } } },
    orderBy: [{ medicine: { genericName: "asc" } }, { expiryDate: "asc" }],
  });

  const body = rows(
    inventories.map((inv) => [
      td(`${inv.medicine.genericName} ${inv.medicine.strength}`),
      td(inv.medicine.dosageForm),
      td(inv.medicine.category),
      td(inv.batchNumber),
      inv.quantity <= inv.reorderPoint
        ? `<td class="num warn">${esc(inv.quantity)} ⚠️</td>`
        : tdNum(inv.quantity),
      td(inv.unit),
      td(thDate(inv.expiryDate)),
      td(inv.location),
    ])
  );

  return page(
    "รายงานสต็อกยาคงเหลือ",
    `batch ที่ใช้งานอยู่ ${inventories.length} รายการ (⚠️ = ต่ำกว่าจุดสั่งซื้อ)`,
    `<table><tr><th>ยา</th><th>รูปแบบ</th><th>หมวด</th><th>Batch</th><th>คงเหลือ</th><th>หน่วย</th><th>วันหมดอายุ</th><th>ตำแหน่ง</th></tr>${body}</table>`
  );
}

async function expiryReport(expiryDays: number): Promise<string> {
  const cutoff = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  const inventories = await db.inventory.findMany({
    where: {
      quantity: { gt: 0 },
      status: { in: ["ACTIVE", "EXPIRED"] },
      expiryDate: { lte: cutoff },
    },
    include: { medicine: { select: { genericName: true, strength: true } } },
    orderBy: { expiryDate: "asc" },
  });

  const now = Date.now();
  const body = rows(
    inventories.map((inv) => {
      const daysLeft = Math.ceil((inv.expiryDate.getTime() - now) / (24 * 60 * 60 * 1000));
      return [
        td(`${inv.medicine.genericName} ${inv.medicine.strength}`),
        td(inv.batchNumber),
        tdNum(inv.quantity),
        td(inv.unit),
        td(thDate(inv.expiryDate)),
        daysLeft < 0
          ? `<td class="warn">หมดอายุแล้ว ${esc(Math.abs(daysLeft))} วัน</td>`
          : tdNum(daysLeft),
      ];
    })
  );

  return page(
    "รายงานยาหมดอายุ / ใกล้หมดอายุ",
    `batch ที่หมดอายุภายใน ${expiryDays} วัน — ${inventories.length} รายการ`,
    `<table><tr><th>ยา</th><th>Batch</th><th>คงเหลือ</th><th>หน่วย</th><th>วันหมดอายุ</th><th>เหลือ (วัน)</th></tr>${body}</table>`
  );
}

function dateRangeWhere(dateFrom: string | null, dateTo: string | null) {
  if (!dateFrom || !dateTo) return {};
  return {
    dispensedAt: {
      gte: new Date(dateFrom),
      lte: new Date(`${dateTo}T23:59:59`),
    },
  };
}

async function nedlReport(dateFrom: string | null, dateTo: string | null, nedlCategory: string | null): Promise<string> {
  const categories = ["ex", "R1", "R2"] as const;
  const filter =
    nedlCategory && (categories as readonly string[]).includes(nedlCategory)
      ? [nedlCategory as (typeof categories)[number]]
      : [...categories];

  const records = await db.dispensingRecord.findMany({
    where: {
      ...dateRangeWhere(dateFrom, dateTo),
      medicine: { nedlCategory: { in: filter } },
    },
    include: {
      medicine: { select: { genericName: true, strength: true, nedlCategory: true } },
      dispensedBy: { select: { fullName: true } },
    },
    orderBy: { dispensedAt: "desc" },
  });

  const body = rows(
    records.map((r) => [
      td(thDate(r.dispensedAt)),
      td(`${r.medicine.genericName} ${r.medicine.strength}`),
      td(r.medicine.nedlCategory),
      td(r.patientName),
      td(r.patientHn),
      tdNum(`${r.quantity} ${r.unit}`),
      td(r.diagnosis),
      td(r.projectApproval),
      td(r.specialistPrescriber),
      td(r.nedlCheckResult),
      td(r.dispensedBy.fullName),
    ])
  );

  return page(
    "รายงานการจ่ายยาบัญชี ex / R1 / R2",
    `${dateFrom && dateTo ? `ช่วง ${dateFrom} ถึง ${dateTo}` : "ทุกช่วงเวลา"}${nedlCategory ? ` เฉพาะบัญชี ${nedlCategory}` : ""} — ${records.length} รายการ`,
    `<table><tr><th>วันที่</th><th>ยา</th><th>บัญชี</th><th>ผู้ป่วย</th><th>HN</th><th>จำนวน</th><th>Diagnosis</th><th>Project Approval</th><th>Specialist</th><th>ผล NEDL</th><th>ผู้จ่าย</th></tr>${body}</table>`
  );
}

async function narcoticReport(dateFrom: string | null, dateTo: string | null): Promise<string> {
  const records = await db.dispensingRecord.findMany({
    where: {
      ...dateRangeWhere(dateFrom, dateTo),
      narcoticReportRequired: true,
    },
    include: {
      medicine: { select: { genericName: true, strength: true, narcoticClass: true } },
      dispensedBy: { select: { fullName: true, licenseNumber: true } },
    },
    orderBy: { dispensedAt: "asc" },
  });

  const body = rows(
    records.map((r) => [
      td(thDate(r.dispensedAt)),
      td(`${r.medicine.genericName} ${r.medicine.strength}`),
      td(r.medicine.narcoticClass),
      tdNum(`${r.quantity} ${r.unit}`),
      td(r.patientName),
      td(r.prescriberName),
      td(r.narcoticFormNumber),
      td(`${r.dispensedBy.fullName}${r.dispensedBy.licenseNumber ? ` (${r.dispensedBy.licenseNumber})` : ""}`),
    ])
  );

  return page(
    "รายงานวัตถุออกฤทธิ์ / ยาเสพติดให้โทษ",
    `${dateFrom && dateTo ? `ช่วง ${dateFrom} ถึง ${dateTo}` : "ทุกช่วงเวลา"} — ${records.length} รายการ (สำหรับรายงาน อย.)`,
    `<table><tr><th>วันที่จ่าย</th><th>ยา</th><th>ประเภท</th><th>จำนวน</th><th>ผู้ป่วย</th><th>แพทย์ผู้สั่ง</th><th>เลขแบบฟอร์ม อย.</th><th>เภสัชกรผู้จ่าย</th></tr>${body}</table>`
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const expiryDays = Math.max(1, Math.min(3650, Number(searchParams.get("expiryDays")) || 90));
  const nedlCategory = searchParams.get("nedlCategory");

  let html: string;
  switch (type) {
    case "stock":
      html = await stockReport();
      break;
    case "expiry":
      html = await expiryReport(expiryDays);
      break;
    case "nedl":
      html = await nedlReport(dateFrom, dateTo, nedlCategory);
      break;
    case "narcotic":
      html = await narcoticReport(dateFrom, dateTo);
      break;
    default:
      return NextResponse.json({ error: "type ต้องเป็น stock | expiry | nedl | narcotic" }, { status: 400 });
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

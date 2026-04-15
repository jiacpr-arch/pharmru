import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const BAHT = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function baht(n: number | null | undefined): string {
  if (n == null) return "—";
  return `฿${BAHT.format(n)}`;
}

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * GET /api/reports?type=price&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 * แสดงรายงานสรุปยอดจ่ายยาแบบ HTML (พร้อมพิมพ์ / บันทึกเป็น PDF)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (type !== "price") {
    return NextResponse.json(
      { error: `รายงานประเภท '${type}' ยังไม่รองรับในเวอร์ชันนี้` },
      { status: 400 }
    );
  }

  const where = {
    ...(dateFrom && dateTo && {
      dispensedAt: {
        gte: new Date(dateFrom),
        lte: new Date(`${dateTo}T23:59:59`),
      },
    }),
    ...(dateFrom && !dateTo && { dispensedAt: { gte: new Date(dateFrom) } }),
    ...(!dateFrom && dateTo && { dispensedAt: { lte: new Date(`${dateTo}T23:59:59`) } }),
  };

  const records = await db.dispensingRecord.findMany({
    where,
    include: {
      medicine: { select: { genericName: true, strength: true, dosageForm: true, priceUnit: true } },
    },
    orderBy: { dispensedAt: "asc" },
  });

  // Aggregate by medicine
  const byMedicine = new Map<
    string,
    {
      genericName: string;
      strength: string;
      dosageForm: string;
      priceUnit: string | null;
      count: number;
      totalQty: number;
      totalAmount: number;
      missingPrice: number;
    }
  >();
  let grandTotal = 0;
  let totalRecords = 0;
  let recordsWithoutPrice = 0;

  for (const r of records) {
    totalRecords++;
    const key = r.medicineId;
    const existing = byMedicine.get(key) ?? {
      genericName: r.medicine.genericName,
      strength: r.medicine.strength,
      dosageForm: r.medicine.dosageForm,
      priceUnit: r.medicine.priceUnit,
      count: 0,
      totalQty: 0,
      totalAmount: 0,
      missingPrice: 0,
    };
    existing.count += 1;
    existing.totalQty += r.quantity;
    if (r.totalPrice != null) {
      existing.totalAmount += r.totalPrice;
      grandTotal += r.totalPrice;
    } else {
      existing.missingPrice += 1;
      recordsWithoutPrice += 1;
    }
    byMedicine.set(key, existing);
  }

  const rows = Array.from(byMedicine.values()).sort((a, b) => b.totalAmount - a.totalAmount);

  const periodLabel =
    dateFrom && dateTo
      ? `${dateFrom} ถึง ${dateTo}`
      : dateFrom
        ? `ตั้งแต่ ${dateFrom}`
        : dateTo
          ? `ถึง ${dateTo}`
          : "ทั้งหมด";

  const generatedAt = new Date().toLocaleString("th-TH");

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>รายงานสรุปยอดจ่ายยา</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Tahoma, sans-serif; padding: 24px; color: #111; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
  .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0 20px; }
  .card { background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 12px; }
  .card .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .card .value { font-size: 20px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .card.total .value { color: #1a7f37; }
  .card.warn .value { color: #b08800; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #e1e4e8; text-align: left; }
  th { background: #f6f8fa; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #444; letter-spacing: 0.3px; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tfoot td { font-weight: 700; background: #f6f8fa; border-top: 2px solid #1a7f37; }
  .muted { color: #999; }
  .warn { color: #b08800; font-size: 10px; margin-left: 4px; }
  .actions { margin-bottom: 16px; }
  .actions button { padding: 6px 14px; background: #1a7f37; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
  @media print { .actions { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">🖨️ พิมพ์ / บันทึก PDF</button>
  </div>
  <h1>💰 รายงานสรุปยอดจ่ายยา</h1>
  <div class="meta">
    ช่วงเวลา: <strong>${escapeHtml(periodLabel)}</strong>
    &nbsp;·&nbsp; สร้างเมื่อ: ${escapeHtml(generatedAt)}
    &nbsp;·&nbsp; โดย: ${escapeHtml((session.user as { name?: string }).name ?? "-")}
  </div>

  <div class="summary-cards">
    <div class="card">
      <div class="label">จำนวนรายการจ่าย</div>
      <div class="value">${totalRecords.toLocaleString("th-TH")}</div>
    </div>
    <div class="card">
      <div class="label">ยาที่จ่าย (รายการ)</div>
      <div class="value">${rows.length.toLocaleString("th-TH")}</div>
    </div>
    <div class="card total">
      <div class="label">ยอดเงินรวม</div>
      <div class="value">${baht(grandTotal)}</div>
    </div>
    <div class="card ${recordsWithoutPrice > 0 ? "warn" : ""}">
      <div class="label">ไม่มีราคา</div>
      <div class="value">${recordsWithoutPrice.toLocaleString("th-TH")}</div>
    </div>
  </div>

  ${rows.length === 0
    ? `<p class="muted" style="text-align:center;padding:40px;">ไม่มีข้อมูลการจ่ายยาในช่วงเวลาที่เลือก</p>`
    : `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>ชื่อยา (Generic)</th>
        <th>ความแรง</th>
        <th>รูปแบบ</th>
        <th class="num">ครั้งจ่าย</th>
        <th class="num">จำนวนรวม</th>
        <th class="num">ยอดเงินรวม</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(r.genericName)}</td>
        <td>${escapeHtml(r.strength)}</td>
        <td>${escapeHtml(r.dosageForm)}</td>
        <td class="num">${r.count.toLocaleString("th-TH")}</td>
        <td class="num">${r.totalQty.toLocaleString("th-TH")} ${escapeHtml(r.priceUnit ?? "")}</td>
        <td class="num">
          ${baht(r.totalAmount)}
          ${r.missingPrice > 0 ? `<span class="warn">(${r.missingPrice} ไม่มีราคา)</span>` : ""}
        </td>
      </tr>`
        )
        .join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6" class="num">ยอดรวมทั้งสิ้น</td>
        <td class="num">${baht(grandTotal)}</td>
      </tr>
    </tfoot>
  </table>`
  }
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

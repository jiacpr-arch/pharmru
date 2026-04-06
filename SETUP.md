# ขั้นตอน Setup ระบบห้องยา

## 1. ตั้งค่า Database
แก้ไข `prisma.config.ts` — ใส่ DATABASE_URL จริง:
```ts
datasource: {
  url: "postgresql://USER:PASSWORD@HOST:5432/pharmacy_system",
}
```

และแก้ `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/pharmacy_system"
NEXTAUTH_SECRET="random-secret-string-ตั้งค่าใหม่"
```

## 2. Migrate Database
```bash
npm run db:migrate
# ตั้งชื่อ migration: init
```

## 3. Seed ข้อมูลยา 124 รายการ
```bash
npm run db:seed
```
จะสร้าง:
- admin (password: admin123)
- pharmacist (password: pharm123)
- ยา 124 รายการพร้อม inventory

## 4. Start Development Server
```bash
npm run dev
```
เปิด http://localhost:3000

## หน้าในระบบ
- `/` — Dashboard
- `/medicines` — ข้อมูลยา Master
- `/inventory` — คลังยา
- `/dispensing` — จ่ายยา + NEDL Compliance
- `/audit` — Audit Trail
- `/reports` — รายงาน

## บัญชียาหลักแห่งชาติ (NEDL) Logic
- บัญชี ข (b) — จ่ายได้เลย
- บัญชี ง (s) — แนะนำระบุเหตุผล
- บัญชีเพิ่มเติม (ex) — BLOCK ถ้าไม่มี Diagnosis
- บัญชี ร1 (R1) — BLOCK ถ้าไม่มี Project Approval
- บัญชี ร2 (R2) — BLOCK ถ้าไม่มี Specialist + Guideline
- ยาควบคุม — BLOCK ถ้าไม่ใช่ PHARMACIST + ไม่มีเลข อย.

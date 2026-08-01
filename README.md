# ระบบห้องยา (Pharmacy Management System)

ระบบจัดการห้องยาสำหรับสถานพยาบาล — จัดการข้อมูลยา master, คลังยา (FEFO), จ่ายยาพร้อมตรวจสอบตามบัญชียาหลักแห่งชาติ (NEDL), และ audit trail

## Tech Stack

- Next.js 16 (App Router) + React 19
- Prisma 7 + PostgreSQL
- NextAuth (credentials, JWT session)

## เริ่มต้นใช้งาน

ดูขั้นตอนติดตั้งแบบละเอียดใน [SETUP.md](./SETUP.md)

```bash
npm install
npm run db:migrate   # migrate database
npm run db:seed      # seed ยา 124 รายการ + user เริ่มต้น
npm run dev          # เปิด http://localhost:3000
```

ตัวแปร env ที่ต้องตั้งใน `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/pharmacy_system"
NEXTAUTH_SECRET="random-secret"
# production ต้องตั้งรหัสผ่าน seed เอง อย่าใช้ default
SEED_ADMIN_PASSWORD="..."
SEED_PHARMACIST_PASSWORD="..."
```

## หน้าในระบบ

| Path | หน้าที่ |
|---|---|
| `/` | Dashboard |
| `/medicines` | ข้อมูลยา master (แก้ไขได้เฉพาะ ADMIN/PHARMACIST) |
| `/inventory` | คลังยา + รับยาเข้า |
| `/dispensing` | จ่ายยา + ตรวจ NEDL compliance |
| `/audit` | Audit trail (ADMIN/PHARMACIST) |
| `/reports` | รายงาน |

## NEDL Compliance Logic

- บัญชี ข (b) — จ่ายได้เลย
- บัญชี ง (s) — แนะนำระบุเหตุผล
- บัญชีเพิ่มเติม (ex) — BLOCK ถ้าไม่มี diagnosis
- บัญชี ร1 (R1) — BLOCK ถ้าไม่มี project approval
- บัญชี ร2 (R2) — BLOCK ถ้าไม่มี specialist + guideline
- ยาควบคุม — BLOCK ถ้าผู้จ่ายไม่ใช่ PHARMACIST หรือไม่มีเลขแบบฟอร์ม อย.

## Scripts

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run typecheck` | ตรวจ TypeScript (รันใน CI ทุก PR) |
| `npm run db:migrate` | prisma migrate dev |
| `npm run db:seed` | seed ข้อมูล |
| `npm run db:studio` | Prisma Studio |

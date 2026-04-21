-- Add medicine pricing fields
--
-- Adds:
--   Medicine.price        (nullable) — ราคาต่อหน่วย (บาท)
--   Medicine.priceUnit    (nullable) — หน่วยราคา เช่น "เม็ด", "ขวด"
--   DispensingRecord.unitPrice  (nullable) — snapshot ราคาต่อหน่วย ณ เวลาจ่าย
--   DispensingRecord.totalPrice (nullable) — snapshot ยอดรวม (quantity * unitPrice)
--
-- All columns are nullable so existing rows are unaffected.
-- No data is lost, no defaults required.

-- AlterTable: Medicine
ALTER TABLE "Medicine" ADD COLUMN "price" DOUBLE PRECISION;
ALTER TABLE "Medicine" ADD COLUMN "priceUnit" TEXT;

-- AlterTable: DispensingRecord
ALTER TABLE "DispensingRecord" ADD COLUMN "unitPrice" DOUBLE PRECISION;
ALTER TABLE "DispensingRecord" ADD COLUMN "totalPrice" DOUBLE PRECISION;

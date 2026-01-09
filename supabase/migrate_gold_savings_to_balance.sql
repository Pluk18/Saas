-- ======================================================
-- Migration: เปลี่ยนระบบออมทองจากเก็บน้ำหนักเป็นเก็บเงิน
-- ======================================================
-- วันที่: 2026-01-09
-- คำอธิบาย: เปลี่ยนจากระบบที่คำนวณมูลค่าจากน้ำหนักทอง × ราคาทอง
--          เป็นระบบที่เก็บเงินในบัญชีโดยตรง
-- ======================================================

-- 1. เพิ่มคอลัมน์ใหม่สำหรับเก็บยอดเงินคงเหลือ
ALTER TABLE gold_savings 
  ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) DEFAULT 0;

-- 2. คำนวณ balance เริ่มต้นจาก total_amount (เงินที่ฝากทั้งหมด)
UPDATE gold_savings 
SET balance = total_amount 
WHERE balance = 0 OR balance IS NULL;

-- 3. ลบคอลัมน์ที่เกี่ยวกับน้ำหนักทอง (เก็บไว้ก่อนในกรณีต้องย้อนกลับ)
-- ALTER TABLE gold_savings 
--   DROP COLUMN IF EXISTS total_weight_baht,
--   DROP COLUMN IF EXISTS total_weight_grams,
--   DROP COLUMN IF EXISTS target_weight_baht;

-- 4. เปลี่ยนชื่อ target_amount (ถ้ามี)
-- (เก็บไว้เดิมได้ เพราะยังใช้ได้)

-- 5. แก้ไขตาราง gold_saving_transactions
-- เพิ่มคอลัมน์ balance_after (ยอดคงเหลือหลังทำธุรกรรม)
ALTER TABLE gold_saving_transactions 
  ADD COLUMN IF NOT EXISTS balance_after DECIMAL(12,2);

-- เปลี่ยนคอลัมน์ที่เกี่ยวกับน้ำหนักและราคาทองให้เป็น nullable
-- เพราะในระบบใหม่ไม่ได้ใช้แล้ว
ALTER TABLE gold_saving_transactions 
  ALTER COLUMN gold_price_per_baht DROP NOT NULL,
  ALTER COLUMN weight_baht DROP NOT NULL,
  ALTER COLUMN weight_grams DROP NOT NULL;

-- 6. ลบ constraint ที่ไม่จำเป็น (ถ้ามี)
-- ตรวจสอบก่อนว่ามี constraint อะไรที่เกี่ยวกับน้ำหนักหรือไม่

-- 7. สร้าง index ใหม่สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_gold_savings_balance 
  ON gold_savings(balance);

CREATE INDEX IF NOT EXISTS idx_gold_savings_status_balance 
  ON gold_savings(status, balance);

-- 8. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- ======================================================
-- หมายเหตุ:
-- - คอลัมน์เก่า (total_weight_baht, total_weight_grams) จะยังคงอยู่
--   เพื่อความปลอดภัยในกรณีต้องย้อนกลับ
-- - หลังจากทดสอบและมั่นใจแล้ว สามารถลบคอลัมน์เก่าได้
-- - balance จะเป็นตัวหลักในการคำนวณ
-- ======================================================

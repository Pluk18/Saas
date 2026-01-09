-- อัพเดท Schema สำหรับตาราง gold_savings และ gold_saving_transactions
-- วันที่: 9 มกราคม 2026

-- ============================================
-- 1. แก้ไขตาราง gold_savings
-- ============================================

-- เปลี่ยนชื่อ column และเพิ่ม columns ใหม่
ALTER TABLE gold_savings 
  RENAME COLUMN current_weight_baht TO total_weight_baht;

ALTER TABLE gold_savings 
  RENAME COLUMN total_deposited TO total_amount;

-- เพิ่ม columns ใหม่
ALTER TABLE gold_savings 
  ADD COLUMN IF NOT EXISTS total_weight_grams DECIMAL(10,4) DEFAULT 0;

ALTER TABLE gold_savings 
  ADD COLUMN IF NOT EXISTS target_amount DECIMAL(12,2);

-- อัพเดทค่า total_weight_grams จาก total_weight_baht ที่มีอยู่
UPDATE gold_savings 
SET total_weight_grams = total_weight_baht * 15.244 
WHERE total_weight_grams IS NULL OR total_weight_grams = 0;

-- ลบ column start_date (ใช้ created_at แทน)
ALTER TABLE gold_savings 
  DROP COLUMN IF EXISTS start_date;

-- ============================================
-- 2. แก้ไขตาราง gold_saving_transactions
-- ============================================

-- เพิ่ม columns ใหม่
ALTER TABLE gold_saving_transactions 
  ADD COLUMN IF NOT EXISTS weight_grams DECIMAL(10,4);

ALTER TABLE gold_saving_transactions 
  ADD COLUMN IF NOT EXISTS withdrawal_type VARCHAR(20);

ALTER TABLE gold_saving_transactions 
  ADD COLUMN IF NOT EXISTS product_description TEXT;

-- อัพเดทค่า weight_grams จาก weight_baht
UPDATE gold_saving_transactions 
SET weight_grams = weight_baht * 15.244 
WHERE weight_grams IS NULL OR weight_grams = 0;

-- ============================================
-- 3. แจ้งเตือนให้ reload schema cache
-- ============================================
NOTIFY pgrst, 'reload schema';

-- เสร็จสิ้น!

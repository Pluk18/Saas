-- ============================================
-- เพิ่ม Include VAT Column
-- สำหรับบันทึกว่ารายการนี้รวม VAT หรือไม่
-- ============================================

-- เพิ่ม column include_vat
ALTER TABLE sales_transactions 
ADD COLUMN IF NOT EXISTS include_vat BOOLEAN DEFAULT true;

-- เพิ่ม comment
COMMENT ON COLUMN sales_transactions.include_vat IS 'รวม VAT หรือไม่ (true = รวม VAT 7%, false = ไม่รวม VAT)';

-- แสดงผลลัพธ์
DO $$
BEGIN
    RAISE NOTICE '✅ เพิ่ม Include VAT Column สำเร็จ!';
    RAISE NOTICE '   - include_vat (BOOLEAN, default: true)';
    RAISE NOTICE '   - ใช้สำหรับระบุว่ารายการขายนี้รวม VAT หรือไม่';
END $$;


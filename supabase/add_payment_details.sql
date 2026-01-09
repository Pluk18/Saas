-- ============================================
-- เพิ่ม Payment Details Columns
-- สำหรับบันทึกรายละเอียดการชำระเงินแยกตามช่องทาง
-- ============================================

-- เพิ่ม columns สำหรับรายละเอียดการชำระเงิน
ALTER TABLE sales_transactions 
ADD COLUMN IF NOT EXISTS cash_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transfer_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS card_amount DECIMAL(12,2) DEFAULT 0;

-- เพิ่ม comments
COMMENT ON COLUMN sales_transactions.cash_amount IS 'ยอดชำระด้วยเงินสด';
COMMENT ON COLUMN sales_transactions.transfer_amount IS 'ยอดชำระด้วยการโอนเงิน';
COMMENT ON COLUMN sales_transactions.card_amount IS 'ยอดชำระด้วยบัตรเครดิต';

-- แสดงผลลัพธ์
DO $$
BEGIN
    RAISE NOTICE '✅ เพิ่ม Payment Details Columns สำเร็จ!';
    RAISE NOTICE '   - cash_amount';
    RAISE NOTICE '   - transfer_amount';
    RAISE NOTICE '   - card_amount';
END $$;


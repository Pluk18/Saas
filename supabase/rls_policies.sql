-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Thai Gold Jewelry POS System
-- ============================================
-- 
-- วิธีใช้: รันไฟล์นี้ใน Supabase SQL Editor
-- ไปที่: Dashboard > SQL Editor > New Query > วางโค้ดนี้ > Run
--
-- หมายเหตุ: Policies เหล่านี้เหมาะสำหรับ Development
-- สำหรับ Production ควรจำกัดสิทธิ์ตาม Authentication
-- ============================================

-- Drop existing policies if any (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on gold_prices" ON gold_prices;
DROP POLICY IF EXISTS "Allow all operations on product_categories" ON product_categories;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on consignments" ON consignments;
DROP POLICY IF EXISTS "Allow all operations on consignment_payments" ON consignment_payments;
DROP POLICY IF EXISTS "Allow all operations on gold_savings" ON gold_savings;
DROP POLICY IF EXISTS "Allow all operations on gold_saving_transactions" ON gold_saving_transactions;
DROP POLICY IF EXISTS "Allow all operations on sales_transactions" ON sales_transactions;
DROP POLICY IF EXISTS "Allow all operations on sales_items" ON sales_items;
DROP POLICY IF EXISTS "Allow all operations on trade_in_items" ON trade_in_items;
DROP POLICY IF EXISTS "Allow all operations on employees" ON employees;
DROP POLICY IF EXISTS "Allow read on audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow insert on audit_logs" ON audit_logs;

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_saving_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- GOLD PRICES TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on gold_prices" ON gold_prices
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- PRODUCT CATEGORIES TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on product_categories" ON product_categories
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- CONSIGNMENTS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on consignments" ON consignments
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- GOLD SAVINGS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on gold_savings" ON gold_savings
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- SALES TRANSACTIONS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on sales_transactions" ON sales_transactions
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- SALES ITEMS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on sales_items" ON sales_items
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- CONSIGNMENT PAYMENTS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on consignment_payments" ON consignment_payments
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- GOLD SAVING TRANSACTIONS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on gold_saving_transactions" ON gold_saving_transactions
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- TRADE IN ITEMS TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on trade_in_items" ON trade_in_items
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- EMPLOYEES TABLE POLICIES
-- ============================================
CREATE POLICY "Allow all operations on employees" ON employees
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ============================================
-- AUDIT LOGS TABLE POLICIES (Read-only + Insert)
-- ============================================
CREATE POLICY "Allow read on audit_logs" ON audit_logs
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow insert on audit_logs" ON audit_logs
    FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this to verify all policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies สร้างเรียบร้อยแล้ว!';
    RAISE NOTICE '📋 ตรวจสอบรายการ policies ด้านบน';
    RAISE NOTICE '⚠️  สำหรับ Production ควรจำกัดสิทธิ์ตาม Authentication';
END $$;


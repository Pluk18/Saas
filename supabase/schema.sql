-- ============================================
-- Thai Gold Jewelry POS & Management System
-- Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CUSTOMERS TABLE (ลูกค้า)
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    line_id VARCHAR(100),
    address TEXT,
    id_card_number VARCHAR(13) UNIQUE, -- เลขบัตรประชาชน (for AMLO compliance)
    id_card_photo_url TEXT, -- สำหรับ AMLO
    customer_type VARCHAR(20) DEFAULT 'regular', -- regular, vip, wholesale
    total_purchases DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_id_card ON customers(id_card_number);
CREATE INDEX idx_customers_deleted ON customers(deleted_at);

-- ============================================
-- 2. GOLD PRICES TABLE (ราคาทอง)
-- ============================================
CREATE TABLE gold_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_date DATE NOT NULL,
    gold_bar_buy DECIMAL(10,2) NOT NULL, -- ราคารับซื้อทองคำแท่ง 96.5%
    gold_bar_sell DECIMAL(10,2) NOT NULL, -- ราคาขายออกทองคำแท่ง 96.5%
    gold_jewelry_buy DECIMAL(10,2) NOT NULL, -- ราคารับซื้อทองรูปพรรณ 96.5%
    gold_jewelry_sell DECIMAL(10,2) NOT NULL, -- ราคาขายออกทองรูปพรรณ 96.5%
    source VARCHAR(50) DEFAULT 'manual', -- manual, api, thai_gold_association
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_gold_prices_date ON gold_prices(price_date);
CREATE INDEX idx_gold_prices_created ON gold_prices(created_at DESC);

-- ============================================
-- 3. PRODUCT CATEGORIES (หมวดหมู่สินค้า)
-- ============================================
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL, -- แหวน, สร้อยคอ, กำไล, ต่างหู, จี้
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PRODUCTS/INVENTORY (สินค้า/คลังสินค้า)
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    category_id UUID REFERENCES product_categories(id),
    product_name VARCHAR(200) NOT NULL,
    product_type VARCHAR(50) NOT NULL, -- ring, necklace, bracelet, earring, pendant, other
    gold_percentage DECIMAL(5,2) DEFAULT 96.50, -- 96.5% standard
    weight_baht DECIMAL(10,4) NOT NULL, -- น้ำหนักเป็นบาท (1 baht = 15.244g for 96.5%)
    weight_grams DECIMAL(10,4) NOT NULL, -- น้ำหนักเป็นกรัม
    pattern_code VARCHAR(50), -- รหัสลาย
    pattern_name VARCHAR(200), -- ชื่อลาย
    labor_cost DECIMAL(10,2) DEFAULT 0, -- ค่ากำเหน็จ/ค่าแรง
    gem_cost DECIMAL(10,2) DEFAULT 0, -- ค่าพลอย (ถ้ามี)
    other_cost DECIMAL(10,2) DEFAULT 0, -- ค่าใช้จ่ายอื่นๆ
    selling_price DECIMAL(12,2), -- ราคาขาย (อาจคำนวณอัตโนมัติ)
    cost_price DECIMAL(12,2), -- ราคาทุน
    stock_quantity INTEGER DEFAULT 1,
    location VARCHAR(100), -- ตำแหน่งในร้าน/คลัง
    supplier VARCHAR(200), -- ผู้จัดจำหน่าย/ผู้ผลิต
    image_urls TEXT[], -- รูปภาพสินค้า
    qr_code VARCHAR(100), -- QR Code สำหรับสแกน
    barcode VARCHAR(100), -- Barcode
    status VARCHAR(20) DEFAULT 'available', -- available, sold, consignment, reserved
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_deleted ON products(deleted_at);

-- ============================================
-- 5. CONSIGNMENTS/PAWN (ขายฝาก/จำนำ)
-- ============================================
CREATE TABLE consignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignment_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    product_description TEXT NOT NULL, -- รายละเอียดสินค้าที่รับฝาก
    weight_baht DECIMAL(10,4) NOT NULL,
    weight_grams DECIMAL(10,4) NOT NULL,
    gold_percentage DECIMAL(5,2) DEFAULT 96.50,
    principal_amount DECIMAL(12,2) NOT NULL, -- เงินต้น
    interest_rate DECIMAL(5,2) NOT NULL, -- อัตราดอกเบี้ย % ต่อเดือน
    interest_type VARCHAR(20) DEFAULT 'monthly', -- monthly, daily
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_months INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- active, extended, redeemed, foreclosed
    image_urls TEXT[], -- รูปภาพสินค้าที่รับฝาก
    contract_url TEXT, -- สัญญาขายฝาก
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consignments_customer ON consignments(customer_id);
CREATE INDEX idx_consignments_status ON consignments(status);
CREATE INDEX idx_consignments_due_date ON consignments(due_date);

-- ============================================
-- 6. CONSIGNMENT PAYMENTS (การชำระดอกเบี้ยขายฝาก)
-- ============================================
CREATE TABLE consignment_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consignment_id UUID REFERENCES consignments(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    principal_payment DECIMAL(12,2) DEFAULT 0, -- ชำระเงินต้น
    interest_payment DECIMAL(12,2) NOT NULL, -- ชำระดอกเบี้ย
    total_payment DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash', -- cash, transfer, card
    reference_number VARCHAR(100), -- เลขอ้างอิง
    received_by UUID, -- พนักงานที่รับเงิน
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_consignment_payments_consignment ON consignment_payments(consignment_id);
CREATE INDEX idx_consignment_payments_date ON consignment_payments(payment_date);

-- ============================================
-- 7. GOLD SAVINGS (ออมทอง)
-- ============================================
CREATE TABLE gold_savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    target_weight_baht DECIMAL(10,4), -- น้ำหนักทองเป้าหมาย (ถ้ามี)
    current_weight_baht DECIMAL(10,4) DEFAULT 0, -- น้ำหนักทองที่สะสมได้
    total_deposited DECIMAL(12,2) DEFAULT 0, -- เงินที่ฝากทั้งหมด
    status VARCHAR(20) DEFAULT 'active', -- active, withdrawn, converted
    start_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gold_savings_customer ON gold_savings(customer_id);
CREATE INDEX idx_gold_savings_status ON gold_savings(status);

-- ============================================
-- 8. GOLD SAVING TRANSACTIONS (รายการออมทอง)
-- ============================================
CREATE TABLE gold_saving_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gold_saving_id UUID REFERENCES gold_savings(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- deposit, withdrawal, conversion
    amount DECIMAL(12,2) NOT NULL, -- จำนวนเงิน
    gold_price_per_baht DECIMAL(10,2) NOT NULL, -- ราคาทองวันที่ทำรายการ
    weight_baht DECIMAL(10,4) NOT NULL, -- น้ำหนักทอง
    payment_method VARCHAR(20) DEFAULT 'cash',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gold_saving_trans_saving ON gold_saving_transactions(gold_saving_id);
CREATE INDEX idx_gold_saving_trans_date ON gold_saving_transactions(transaction_date);

-- ============================================
-- 9. SALES TRANSACTIONS (การขาย)
-- ============================================
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subtotal DECIMAL(12,2) NOT NULL, -- ยอดรวมก่อน VAT
    vat_amount DECIMAL(12,2) DEFAULT 0, -- VAT 7%
    discount_amount DECIMAL(12,2) DEFAULT 0, -- ส่วนลด
    trade_in_amount DECIMAL(12,2) DEFAULT 0, -- เทิร์นทอง
    total_amount DECIMAL(12,2) NOT NULL, -- ยอดรวมสุทธิ
    payment_method VARCHAR(20) DEFAULT 'cash', -- cash, transfer, card, mixed
    payment_status VARCHAR(20) DEFAULT 'paid', -- paid, pending, partial
    tax_invoice_number VARCHAR(50), -- เลขที่ใบกำกับภาษี
    sold_by UUID, -- พนักงานขาย
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_customer ON sales_transactions(customer_id);
CREATE INDEX idx_sales_date ON sales_transactions(transaction_date DESC);
CREATE INDEX idx_sales_code ON sales_transactions(transaction_code);

-- ============================================
-- 10. SALES ITEMS (รายการสินค้าที่ขาย)
-- ============================================
CREATE TABLE sales_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_transaction_id UUID REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_code VARCHAR(50),
    product_name VARCHAR(200) NOT NULL,
    weight_baht DECIMAL(10,4) NOT NULL,
    gold_price_per_baht DECIMAL(10,2) NOT NULL, -- ราคาทองวันที่ขาย
    labor_cost DECIMAL(10,2) DEFAULT 0,
    gem_cost DECIMAL(10,2) DEFAULT 0,
    other_cost DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_items_transaction ON sales_items(sales_transaction_id);
CREATE INDEX idx_sales_items_product ON sales_items(product_id);

-- ============================================
-- 11. TRADE-IN ITEMS (เทิร์นทอง)
-- ============================================
CREATE TABLE trade_in_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_transaction_id UUID REFERENCES sales_transactions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    weight_baht DECIMAL(10,4) NOT NULL,
    weight_grams DECIMAL(10,4) NOT NULL,
    gold_percentage DECIMAL(5,2) DEFAULT 96.50,
    gold_buy_price_per_baht DECIMAL(10,2) NOT NULL, -- ราคารับซื้อทองวันนั้น
    trade_in_value DECIMAL(12,2) NOT NULL, -- มูลค่าเทิร์น
    image_urls TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trade_in_transaction ON trade_in_items(sales_transaction_id);

-- ============================================
-- 12. AUDIT LOGS (บันทึกการตรวจสอบ)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- user ที่ทำรายการ
    action VARCHAR(50) NOT NULL, -- create, update, delete, login, logout
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- 13. USERS/EMPLOYEES (พนักงาน)
-- ============================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL, -- admin, manager, cashier, staff
    is_active BOOLEAN DEFAULT true,
    hire_date DATE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_role ON employees(role);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON consignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gold_savings_updated_at BEFORE UPDATE ON gold_savings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_transactions_updated_at BEFORE UPDATE ON sales_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - PRODUCT CATEGORIES
-- ============================================
INSERT INTO product_categories (category_code, category_name, sort_order) VALUES
('RING', 'แหวน', 1),
('NECKLACE', 'สร้อยคอ', 2),
('BRACELET', 'กำไล', 3),
('BANGLE', 'กำไลข้อมือ', 4),
('EARRING', 'ต่างหู', 5),
('PENDANT', 'จี้', 6),
('ANKLET', 'กำไลข้อเท้า', 7),
('OTHER', 'อื่นๆ', 99);

-- ============================================
-- SEED DATA - SAMPLE GOLD PRICE
-- ============================================
INSERT INTO gold_prices (price_date, gold_bar_buy, gold_bar_sell, gold_jewelry_buy, gold_jewelry_sell, source) VALUES
(CURRENT_DATE, 38800.00, 39000.00, 38300.00, 39500.00, 'manual');

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ============================================
-- Enable RLS on sensitive tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_savings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: รายงานยอดขายรายวัน
CREATE OR REPLACE VIEW daily_sales_report AS
SELECT 
    DATE(transaction_date) as sale_date,
    COUNT(*) as total_transactions,
    SUM(subtotal) as total_subtotal,
    SUM(vat_amount) as total_vat,
    SUM(discount_amount) as total_discount,
    SUM(trade_in_amount) as total_trade_in,
    SUM(total_amount) as total_sales
FROM sales_transactions
WHERE payment_status = 'paid'
GROUP BY DATE(transaction_date)
ORDER BY sale_date DESC;

-- View: รายงานสินค้าคงคลัง
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    pc.category_name,
    COUNT(p.id) as product_count,
    SUM(p.stock_quantity) as total_quantity,
    SUM(p.weight_baht * p.stock_quantity) as total_weight_baht,
    SUM(p.cost_price * p.stock_quantity) as total_cost_value,
    SUM(p.selling_price * p.stock_quantity) as total_selling_value
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.status = 'available' AND p.deleted_at IS NULL
GROUP BY pc.category_name;

-- View: รายงานขายฝากที่ใกล้ครบกำหนด
CREATE OR REPLACE VIEW consignments_due_soon AS
SELECT 
    c.consignment_code,
    c.customer_id,
    cust.first_name || ' ' || cust.last_name as customer_name,
    cust.phone,
    c.principal_amount,
    c.start_date,
    c.due_date,
    c.due_date - CURRENT_DATE as days_until_due,
    c.status
FROM consignments c
LEFT JOIN customers cust ON c.customer_id = cust.id
WHERE c.status = 'active' 
    AND c.due_date >= CURRENT_DATE 
    AND c.due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY c.due_date ASC;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE customers IS 'ข้อมูลลูกค้า - รองรับ AMLO compliance';
COMMENT ON TABLE gold_prices IS 'ราคาทองประจำวัน';
COMMENT ON TABLE products IS 'สินค้า/คลังสินค้าทองคำ';
COMMENT ON TABLE consignments IS 'ขายฝาก/จำนำทองคำ';
COMMENT ON TABLE gold_savings IS 'บัญชีออมทอง';
COMMENT ON TABLE sales_transactions IS 'รายการขาย';
COMMENT ON TABLE audit_logs IS 'บันทึกการตรวจสอบทุกการทำรายการ';


-- ============================================
-- STORE SETTINGS & NOTIFICATIONS SCHEMA
-- ============================================

-- ============================================
-- STORE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (setting_key, setting_value, description) VALUES
('store_info', '{
  "store_name": "ร้านทองคำ",
  "address": "",
  "phone": "",
  "email": "",
  "tax_id": "",
  "logo_url": ""
}'::jsonb, 'ข้อมูลร้าน'),

('tax_settings', '{
  "vat_enabled": false,
  "vat_rate": 7,
  "gold_vat_special": true
}'::jsonb, 'การตั้งค่าภาษี'),

('labor_cost_defaults', '{
  "แหวน": 500,
  "สร้อย": 800,
  "กำไล": 1000,
  "ต่างหู": 300,
  "จี้": 400
}'::jsonb, 'ค่าแรงเริ่มต้นตามประเภท')
ON CONFLICT (setting_key) DO NOTHING;

CREATE INDEX idx_store_settings_key ON store_settings(setting_key);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(200),
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Store Settings (everyone can read, only authenticated can update)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read store settings"
ON store_settings FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Authenticated users can update store settings"
ON store_settings FOR UPDATE
TO authenticated
USING (true);

-- Notifications (only for authenticated users)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notifications"
ON notifications FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update notifications"
ON notifications FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';

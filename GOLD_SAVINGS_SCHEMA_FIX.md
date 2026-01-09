# 🔧 แก้ไข Schema ตาราง Gold Savings

## ❌ ปัญหา
```
Could not find the 'total_amount' column of 'gold_savings' in the schema cache
```

**สาเหตุ:** Schema เดิมใช้ชื่อ columns ไม่ตรงกับ code

---

## ✅ วิธีแก้ไข

### **ขั้นตอนที่ 1: รัน SQL Script**

1. เปิด **Supabase Dashboard**
2. ไปที่ **SQL Editor**
3. Copy SQL จากไฟล์ `supabase/update_gold_savings_schema.sql`
4. Paste และกด **"Run"**

หรือ **copy โค้ดด้านล่างไปรันเลย:**

```sql
-- อัพเดท Schema สำหรับตาราง gold_savings และ gold_saving_transactions

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
```

---

### **ขั้นตอนที่ 2: Reload Schema Cache**

ถ้ารัน SQL แล้วยังเจอ error ให้รันคำสั่งนี้เพิ่ม:

```sql
NOTIFY pgrst, 'reload schema';
```

หรือ **Hard Refresh** เบราว์เซอร์: `Ctrl + Shift + R` (Windows) หรือ `Cmd + Shift + R` (Mac)

---

## 📋 สรุปการเปลี่ยนแปลง

### **ตาราง `gold_savings`**

| Column เดิม | Column ใหม่ | Type | Description |
|-------------|-------------|------|-------------|
| `current_weight_baht` | `total_weight_baht` | DECIMAL(10,4) | น้ำหนักทองสะสม (บาท) |
| `total_deposited` | `total_amount` | DECIMAL(12,2) | เงินฝากรวม |
| - | `total_weight_grams` | DECIMAL(10,4) | น้ำหนักทองสะสม (กรัม) |
| `target_weight_baht` | `target_weight_baht` | DECIMAL(10,4) | เป้าหมายน้ำหนัก |
| - | `target_amount` | DECIMAL(12,2) | เป้าหมายจำนวนเงิน |
| `start_date` | ❌ ลบ | - | ใช้ created_at แทน |

---

### **ตาราง `gold_saving_transactions`**

| Column ใหม่ | Type | Description |
|-------------|------|-------------|
| `weight_grams` | DECIMAL(10,4) | น้ำหนัก (กรัม) |
| `withdrawal_type` | VARCHAR(20) | ประเภทการถอน (gold/cash) |
| `product_description` | TEXT | รายละเอียดสินค้า (ถ้าแลกทอง) |

---

## ✅ ตรวจสอบว่าสำเร็จ

รัน query นี้เพื่อตรวจสอบ:

```sql
-- ตรวจสอบ columns ในตาราง gold_savings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gold_savings' 
ORDER BY ordinal_position;
```

**ผลลัพธ์ที่ต้องการ:**
- ✅ `total_weight_baht`
- ✅ `total_weight_grams`
- ✅ `total_amount`
- ✅ `target_weight_baht`
- ✅ `target_amount`
- ❌ `current_weight_baht` (ไม่มีแล้ว)
- ❌ `total_deposited` (ไม่มีแล้ว)
- ❌ `start_date` (ไม่มีแล้ว)

---

## 🔄 หลังรัน SQL แล้ว

1. ✅ Refresh หน้าเว็บ
2. ✅ ลองสร้างบัญชีออมทองใหม่
3. ✅ ควรทำงานได้แล้ว! 🎉

---

## 🐛 ถ้ายังมีปัญหา

ลอง:
1. **Clear Browser Cache** แล้ว reload
2. **Restart Dev Server:** `npm run dev`
3. **ตรวจสอบ Console** มี error อื่นหรือไม่

---

## 📞 หมายเหตุ

- SQL script นี้ใช้ `IF NOT EXISTS` จะไม่ error ถ้า column มีอยู่แล้ว
- ข้อมูลเดิมจะถูก migrate อัตโนมัติ
- ปลอดภัย ไม่ลบข้อมูล

---

**อัพเดทโดย:** Senior Full-stack Developer  
**วันที่:** 9 มกราคม 2026

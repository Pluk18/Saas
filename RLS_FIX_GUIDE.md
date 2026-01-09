# 🔒 แก้ไขปัญหา Row Level Security (RLS) Error

## ❌ อาการปัญหา
เมื่อพยายามเพิ่มลูกค้า ขึ้น error:
```
Error 42501: new row violates row-level security policy for table "customers"
(Unauthorized)
```

## 🎯 สาเหตุ
Supabase เปิดใช้งาน **Row Level Security (RLS)** โดย default เพื่อความปลอดภัย แต่ยังไม่มี **Policy** ที่อนุญาตให้เพิ่ม/แก้ไข/ลบข้อมูลได้

## ✅ วิธีแก้ไข (เลือก 1 ใน 2 วิธี)

### วิธีที่ 1: รัน SQL Script (แนะนำ) ⭐

1. **เปิด Supabase Dashboard**
   - ไปที่ [supabase.com](https://supabase.com)
   - เลือก Project ของคุณ

2. **เข้า SQL Editor**
   - คลิกที่เมนู **SQL Editor** ทางด้านซ้าย
   - หรือไปที่ URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID/sql`

3. **รัน RLS Policies Script**
   - คลิก **New Query**
   - คัดลอกโค้ดจากไฟล์ `supabase/rls_policies.sql`
   - วางลงใน SQL Editor
   - คลิก **Run** (หรือกด Ctrl+Enter)

4. **ตรวจสอบผลลัพธ์**
   - ควรเห็นข้อความ ✅ **"RLS Policies สร้างเรียบร้อยแล้ว!"**
   - และตารางแสดงรายการ policies ทั้งหมด

### วิธีที่ 2: ปิด RLS ชั่วคราว (สำหรับ Development เท่านั้น)

⚠️ **คำเตือน:** วิธีนี้ไม่ปลอดภัยสำหรับ Production!

รัน SQL นี้ใน Supabase SQL Editor:

```sql
-- ปิด RLS สำหรับ Development
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE gold_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE consignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE gold_savings DISABLE ROW LEVEL SECURITY;
ALTER TABLE gold_saving_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

## 🔍 ตรวจสอบว่า RLS Policies ถูกสร้างแล้ว

รัน SQL นี้เพื่อดูรายการ policies:

```sql
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

ควรเห็นผลลัพธ์คล้ายนี้:

| tablename | policyname | permissive | cmd |
|-----------|-----------|------------|-----|
| customers | Allow all operations on customers | permissive | ALL |
| products | Allow all operations on products | permissive | ALL |
| ... | ... | ... | ... |

## 🧪 ทดสอบหลังแก้ไข

1. **Refresh หน้าเว็บ** - กด F5 หรือ Ctrl+R
2. **ลองเพิ่มลูกค้าใหม่** - กรอกข้อมูลและกดบันทึก
3. **ตรวจสอบผลลัพธ์**:
   - ✅ ควรเห็นข้อความ "เพิ่มลูกค้าสำเร็จ"
   - ✅ ลูกค้าใหม่ปรากฏในตาราง

## 📚 เอกสารเพิ่มเติม

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## 🔐 หมายเหตุสำคัญสำหรับ Production

**Policies ที่สร้างไว้ในไฟล์นี้เป็นแบบ "Allow All" (อนุญาตทุกอย่าง) เหมาะสำหรับ Development เท่านั้น!**

เมื่อนำขึ้น Production ควร:

1. **ใช้ Supabase Authentication** - เพิ่มระบบ Login/Logout
2. **จำกัดสิทธิ์ตาม User Role** - เช่น:
   - Admin: สามารถทำทุกอย่าง
   - Staff: สามารถเพิ่ม/แก้ไข ลูกค้า/สินค้า/ขาย
   - Customer: สามารถดูข้อมูลตัวเองเท่านั้น

3. **ตัวอย่าง Policy สำหรับ Production:**

```sql
-- อนุญาตให้ authenticated users ทำงานกับ customers ได้
CREATE POLICY "Authenticated users can manage customers" 
ON customers
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- ลูกค้าดูข้อมูลตัวเองได้เท่านั้น
CREATE POLICY "Users can view their own data" 
ON customers
FOR SELECT 
TO authenticated
USING (auth.uid() = id);
```

## ❓ ติดปัญหา?

หากยังแก้ไม่ได้ ตรวจสอบ:

1. ✅ Supabase Project URL และ Anon Key ถูกต้องใน `.env.local`
2. ✅ ตาราง `customers` มีอยู่จริงใน Database
3. ✅ RLS Policies ถูกสร้างสำเร็จ (ตรวจสอบด้วย SQL ด้านบน)
4. ✅ Browser Console ไม่มี error อื่นๆ (กด F12)

---

📅 อัพเดทล่าสุด: December 2025  
💡 หากมีคำถาม สามารถดูเพิ่มเติมใน `INSTALLATION.md`


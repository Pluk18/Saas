# ระบบจัดการร้านทองคำ (Thai Gold Jewelry POS & Management System)

ระบบ POS และการจัดการแบบครบวงจรสำหรับร้านจำหน่ายทองคำ SME ในประเทศไทย

## 🌟 คุณสมบัติหลัก (Phase 1)

### 1. **Live Gold Price Dashboard** 📈
- แสดงราคาทองคำแท่ง และทองรูปพรรณ 96.5%
- ราคารับซื้อ และราคาขายออก
- อ้างอิงจากสมาคมค้าทองคำไทย
- เครื่องมือคำนวณราคาทอง

### 2. **Inventory Management** 📦
- จัดการสินค้าทองคำ (แหวน, สร้อยคอ, กำไล, ต่างหู, จี้)
- ระบบน้ำหนักเป็นบาท (15.244g)
- บันทึกลาย (Pattern) และค่ากำเหน็จ
- ติดตามสต๊อกและมูลค่าคงคลัง

### 3. **Sales & Trade-in Module** 🛍️
- ระบบ POS ขายสินค้า
- คำนวณ VAT 7% (ตามกฎหมายไทย)
- รองรับการเทิร์นทอง (Old Gold Trade-in)
- ออกใบเสร็จ/ใบกำกับภาษี

### 4. **Consignment/Pawn (ขายฝาก)** 🤝
- สัญญาขายฝาก/จำนำทองคำ
- คำนวณดอกเบี้ย (รายเดือน/รายวัน)
- ติดตามวันครบกำหนด
- ระบบแจ้งเตือน

### 5. **Gold Saving (ออมทอง)** 🏦
- ลูกค้าฝากเงินเพื่อ "ล็อค" น้ำหนักทอง
- คำนวณน้ำหนักตามราคาวันทำรายการ
- Portal สำหรับลูกค้าตรวจสอบยอด

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS (Earth Tone Theme)
- **Fonts**: Sarabun, Kanit (Thai Fonts)
- **Icons**: Lucide React

## 📁 โครงสร้างโปรเจค

```
Saas/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Dashboard หลัก
│   │   ├── gold-prices/       # หน้าราคาทอง
│   │   ├── inventory/         # หน้าคลังสินค้า
│   │   ├── pos/               # หน้าขายสินค้า (POS)
│   │   ├── customers/         # หน้าจัดการลูกค้า
│   │   ├── consignments/      # หน้าขายฝาก
│   │   └── gold-savings/      # หน้าออมทอง
│   ├── components/
│   │   ├── Layout/            # Layout components
│   │   └── Dashboard/         # Dashboard components
│   └── lib/
│       ├── supabase.ts        # Supabase client
│       └── utils.ts           # Utility functions
├── supabase/
│   └── schema.sql             # Database Schema
└── package.json
```

## 🚀 การติดตั้งและเริ่มใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และเพิ่มข้อมูล Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. สร้าง Database

1. เข้าไปที่ Supabase Dashboard
2. สร้างโปรเจคใหม่
3. ไปที่ SQL Editor
4. รัน SQL จากไฟล์ `supabase/schema.sql`

### 4. เริ่มต้น Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### ตารางหลัก

- **customers** - ข้อมูลลูกค้า (รองรับ AMLO)
- **gold_prices** - ราคาทองรายวัน
- **product_categories** - หมวดหมู่สินค้า
- **products** - สินค้า/คลังสินค้า
- **consignments** - ขายฝาก/จำนำ
- **gold_savings** - บัญชีออมทอง
- **sales_transactions** - รายการขาย
- **audit_logs** - บันทึกการตรวจสอบ

### Views สำหรับรายงาน

- `daily_sales_report` - รายงานยอดขายรายวัน
- `inventory_summary` - สรุปสินค้าคงคลัง
- `consignments_due_soon` - ขายฝากใกล้ครบกำหนด

## 🎨 Design System (Earth Tone)

### สี (Colors)

- **Primary**: เฉดสีน้ำตาล (#b8884f)
- **Secondary**: เฉดสีครีม (#9d8256)
- **Accent**: เฉดสีทอง (#eab308)
- **Neutral**: เฉดสีเทา (#78716c)

### ฟอนต์ (Fonts)

- **Sarabun**: ฟอนต์หลัก (300-700)
- **Kanit**: ฟอนต์หัวข้อ (400-700)

## 📋 คุณสมบัติพิเศษ

### ✅ Thai Localization
- UI ภาษาไทยทั้งหมด
- คำศัพท์เฉพาะทางทอง (ค่ากำเหน็จ, น้ำหนักทอง, etc.)
- รูปแบบวันที่และเวลาแบบไทย
- รูปแบบสกุลเงินบาท

### ✅ AMLO Compliance
- บันทึกข้อมูลบัตรประชาชน
- อัพโหลดสำเนาบัตร
- Audit logs ทุกการทำรายการ

### ✅ Thai Tax Compliance
- VAT 7% (เฉพาะค่ากำเหน็จหรือทั้งหมด - ตั้งค่าได้)
- ใบเสร็จ/ใบกำกับภาษี
- รายงานภาษี

## 🔒 Security Features

- Row Level Security (RLS)
- Audit Logs ทุกการทำรายการ
- Authentication ด้วย Supabase Auth
- Data encryption

## 📱 Responsive Design

- รองรับทั้ง Desktop และ Tablet
- UI ที่ใช้งานง่าย สำหรับพนักงานทุกระดับ

## 🚧 Roadmap (Phase 2)

- [ ] ระบบ POS แบบเต็มรูปแบบ
- [ ] QR Code/Barcode scanning
- [ ] Receipt Printing
- [ ] Line Notify Integration
- [ ] Customer Portal
- [ ] Mobile App (React Native)
- [ ] API Integration กับสมาคมค้าทองคำจริง
- [ ] Advanced Analytics & Reports

## 📝 License

Private - สำหรับใช้งานภายในองค์กรเท่านั้น

## 👨‍💻 Developer

Developed by Senior Full-stack Developer & Fintech Architect

---

© 2024 Thai Gold Jewelry POS & Management System


'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { Settings, Save, Bell, Lock, Database, Receipt } from 'lucide-react'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            ตั้งค่าระบบ
          </h1>
          <p className="text-neutral-600">จัดการการตั้งค่าทั่วไปของระบบ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Menu */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                เมนูการตั้งค่า
              </h3>
              <nav className="space-y-1">
                {[
                  { icon: <Settings size={18} />, label: 'ตั้งค่าทั่วไป', active: true },
                  { icon: <Receipt size={18} />, label: 'ใบเสร็จ/ใบกำกับภาษี', active: false },
                  { icon: <Bell size={18} />, label: 'การแจ้งเตือน', active: false },
                  { icon: <Lock size={18} />, label: 'ความปลอดภัย', active: false },
                  { icon: <Database size={18} />, label: 'สำรองข้อมูล', active: false },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shop Information */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
                ข้อมูลร้าน
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">ชื่อร้าน</label>
                  <input type="text" className="input" defaultValue="ร้านทองคำบ้านไทย" />
                </div>
                <div>
                  <label className="label">ที่อยู่</label>
                  <textarea className="input" rows={3} defaultValue="123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">เบอร์โทรศัพท์</label>
                    <input type="tel" className="input" defaultValue="02-123-4567" />
                  </div>
                  <div>
                    <label className="label">อีเมล</label>
                    <input type="email" className="input" defaultValue="info@goldshop.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">เลขประจำตัวผู้เสียภาษี</label>
                    <input type="text" className="input" defaultValue="0123456789012" />
                  </div>
                  <div>
                    <label className="label">เลขทะเบียนการค้า</label>
                    <input type="text" className="input" defaultValue="1234567890123" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Price Settings */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
                ตั้งค่าราคาทอง
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">แหล่งข้อมูลราคาทอง</label>
                  <select className="input">
                    <option>สมาคมค้าทองคำ (API)</option>
                    <option selected>ป้อนด้วยตนเอง (Manual)</option>
                  </select>
                </div>
                <div>
                  <label className="label">อัพเดทราคาอัตโนมัติทุก</label>
                  <div className="flex gap-2">
                    <input type="number" className="input max-w-xs" defaultValue="30" />
                    <select className="input max-w-xs">
                      <option>นาที</option>
                      <option>ชั่วโมง</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* VAT Settings */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
                ตั้งค่าภาษีมูลค่าเพิ่ม (VAT)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-800">เปิดใช้งาน VAT 7%</p>
                    <p className="text-sm text-neutral-600">คิด VAT จากยอดขาย</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 
                                  peer-focus:ring-primary-300 rounded-full peer 
                                  peer-checked:after:translate-x-full peer-checked:after:border-white 
                                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                  after:bg-white after:border-neutral-300 after:border after:rounded-full 
                                  after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                    </div>
                  </label>
                </div>

                <div>
                  <label className="label">คิด VAT จาก</label>
                  <select className="input">
                    <option>เฉพาะค่ากำเหน็จ (Labor Cost)</option>
                    <option>ราคาขายทั้งหมด</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Consignment Settings */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
                ตั้งค่าขายฝาก/จำนำ
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">อัตราดอกเบี้ยเริ่มต้น (%/เดือน)</label>
                    <input type="number" step="0.01" className="input" defaultValue="1.25" />
                  </div>
                  <div>
                    <label className="label">ระยะเวลาขายฝาก (เดือน)</label>
                    <input type="number" className="input" defaultValue="3" />
                  </div>
                </div>
                <div>
                  <label className="label">แจ้งเตือนก่อนครบกำหนด (วัน)</label>
                  <input type="number" className="input" defaultValue="7" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary">
                ยกเลิก
              </button>
              <button className="btn btn-primary flex items-center gap-2">
                <Save size={18} />
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { FileText, Download, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              รายงาน
            </h1>
            <p className="text-neutral-600">ดูรายงานและสถิติต่างๆ ของระบบ</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="card">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="label">ประเภทรายงาน</label>
              <select className="input">
                <option>รายงานยอดขาย</option>
                <option>รายงานสินค้าคงคลัง</option>
                <option>รายงานขายฝาก</option>
                <option>รายงานออมทอง</option>
                <option>รายงานลูกค้า</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">วันที่เริ่มต้น</label>
              <input type="date" className="input" defaultValue="2024-12-01" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">วันที่สิ้นสุด</label>
              <input type="date" className="input" defaultValue="2024-12-19" />
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <FileText size={18} />
              สร้างรายงาน
            </button>
            <button className="btn btn-outline flex items-center gap-2">
              <Download size={18} />
              ดาวน์โหลด PDF
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ยอดขายเดือนนี้</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {formatCurrency(12500000)}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">กำไรสุทธิ</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {formatCurrency(1850000)}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">สินค้าขายออก</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">89 ชิ้น</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-600 flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">จำนวนรายการ</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Report */}
        <div className="card">
          <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
            รายงานยอดขายรายวัน
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th className="text-right">จำนวนรายการ</th>
                  <th className="text-right">ยอดขายรวม</th>
                  <th className="text-right">ส่วนลด</th>
                  <th className="text-right">เทิร์นทอง</th>
                  <th className="text-right">VAT 7%</th>
                  <th className="text-right">ยอดสุทธิ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2024-12-19', count: 8, sales: 1250000, discount: 5000, tradeIn: 50000, vat: 12500 },
                  { date: '2024-12-18', count: 12, sales: 1850000, discount: 8000, tradeIn: 75000, vat: 18500 },
                  { date: '2024-12-17', count: 6, sales: 890000, discount: 3000, tradeIn: 30000, vat: 8900 },
                  { date: '2024-12-16', count: 10, sales: 1450000, discount: 7000, tradeIn: 60000, vat: 14500 },
                  { date: '2024-12-15', count: 15, sales: 2100000, discount: 12000, tradeIn: 95000, vat: 21000 },
                ].map((day, idx) => {
                  const net = day.sales - day.discount - day.tradeIn + day.vat
                  return (
                    <tr key={idx}>
                      <td className="font-medium">
                        {new Date(day.date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </td>
                      <td className="text-right">{day.count}</td>
                      <td className="text-right font-medium">{formatCurrency(day.sales)}</td>
                      <td className="text-right text-red-600">-{formatCurrency(day.discount)}</td>
                      <td className="text-right text-red-600">-{formatCurrency(day.tradeIn)}</td>
                      <td className="text-right text-green-600">+{formatCurrency(day.vat)}</td>
                      <td className="text-right font-bold text-primary-700">{formatCurrency(net)}</td>
                    </tr>
                  )
                })}
                <tr className="bg-primary-50 font-semibold">
                  <td>รวม</td>
                  <td className="text-right">51</td>
                  <td className="text-right">{formatCurrency(7540000)}</td>
                  <td className="text-right text-red-600">-{formatCurrency(35000)}</td>
                  <td className="text-right text-red-600">-{formatCurrency(310000)}</td>
                  <td className="text-right text-green-600">+{formatCurrency(75400)}</td>
                  <td className="text-right text-primary-700">{formatCurrency(7270400)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card">
          <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
            สินค้าขายดี Top 5
          </h3>
          <div className="space-y-4">
            {[
              { rank: 1, name: 'สร้อยคอทอง 2 สลึง ลายเกลียว', sold: 25, value: 2125000 },
              { rank: 2, name: 'แหวนทองคำ ลายฉลุ', sold: 18, value: 394200 },
              { rank: 3, name: 'กำไลทอง 1 บาท', sold: 15, value: 657000 },
              { rank: 4, name: 'ต่างหูทองคำ', sold: 12, value: 156000 },
              { rank: 5, name: 'จี้พระทอง', sold: 8, value: 240000 },
            ].map((product) => (
              <div key={product.rank} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
                  {product.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">ขายได้ {product.sold} ชิ้น</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-700">{formatCurrency(product.value)}</p>
                  <p className="text-sm text-neutral-600">
                    เฉลี่ย {formatCurrency(product.value / product.sold)}/ชิ้น
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


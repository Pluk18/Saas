'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { Handshake, Plus, Search, AlertCircle, Calendar, Clock } from 'lucide-react'
import { formatCurrency, formatNumber, formatThaiDate, daysBetween } from '@/lib/utils'

export default function ConsignmentsPage() {
  // Mock data
  const consignments = [
    {
      id: '1',
      code: 'CON-20241201-001',
      customerName: 'คุณประสิทธิ์ มั่งคั่ง',
      customerPhone: '0856781234',
      description: 'สร้อยคอทอง 2 บาท ลายเกลียว',
      weight: 2.0,
      goldPercentage: 96.5,
      principalAmount: 150000,
      interestRate: 1.25,
      startDate: '2024-12-01',
      dueDate: '2025-01-01',
      status: 'active',
    },
    {
      id: '2',
      code: 'CON-20241210-002',
      customerName: 'คุณสมชาย ใจดี',
      customerPhone: '0812345678',
      description: 'กำไลทอง 3 บาท ลายฉลุ',
      weight: 3.0,
      goldPercentage: 96.5,
      principalAmount: 225000,
      interestRate: 1.5,
      startDate: '2024-12-10',
      dueDate: '2025-01-10',
      status: 'active',
    },
    {
      id: '3',
      code: 'CON-20241115-003',
      customerName: 'คุณสมหญิง ศรีสุข',
      customerPhone: '0898765432',
      description: 'แหวนทอง 1 บาท',
      weight: 1.0,
      goldPercentage: 96.5,
      principalAmount: 75000,
      interestRate: 1.25,
      startDate: '2024-11-15',
      dueDate: '2024-12-15',
      status: 'extended',
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: 'ปกติ', color: 'badge-success' },
      extended: { label: 'ต่ออายุ', color: 'badge-warning' },
      redeemed: { label: 'ไถ่ถอนแล้ว', color: 'badge-info' },
      foreclosed: { label: 'ยึดทรัพย์', color: 'badge-danger' },
    }
    return statusMap[status] || statusMap.active
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = daysBetween(new Date(), dueDate)
    return days
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              ขายฝาก/จำนำ
            </h1>
            <p className="text-neutral-600">จัดการสัญญาขายฝากและคำนวณดอกเบี้ย</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            สร้างสัญญาใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Handshake size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">สัญญาทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">145</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">สัญญาปกติ</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">128</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ใกล้ครบกำหนด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">12</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div>
              <p className="text-sm text-neutral-600 mb-1">มูลค่ารวม</p>
              <p className="text-xl font-bold text-primary-700 font-display">
                {formatCurrency(8750000)}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-700 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                มีสัญญาที่ใกล้ครบกำหนด 12 รายการ
              </h4>
              <p className="text-sm text-yellow-800">
                กรุณาติดต่อลูกค้าเพื่อแจ้งเตือนการชำระดอกเบี้ยหรือต่ออายุสัญญา
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหารหัสสัญญา, ชื่อลูกค้า..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select className="input max-w-xs">
              <option>สถานะ: ทั้งหมด</option>
              <option>ปกติ</option>
              <option>ต่ออายุ</option>
              <option>ใกล้ครบกำหนด</option>
              <option>ไถ่ถอนแล้ว</option>
            </select>
          </div>
        </div>

        {/* Consignments Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>รหัสสัญญา</th>
                  <th>ลูกค้า</th>
                  <th>รายละเอียดสินค้า</th>
                  <th className="text-right">น้ำหนัก</th>
                  <th className="text-right">เงินต้น</th>
                  <th className="text-center">ดอกเบี้ย/เดือน</th>
                  <th>วันเริ่มต้น</th>
                  <th>วันครบกำหนด</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {consignments.map((con) => {
                  const daysUntilDue = getDaysUntilDue(con.dueDate)
                  const isNearDue = daysUntilDue <= 7 && daysUntilDue > 0
                  const isOverdue = daysUntilDue < 0

                  return (
                    <tr key={con.id} className={isNearDue || isOverdue ? 'bg-yellow-50' : ''}>
                      <td className="font-mono font-medium text-primary-700">
                        {con.code}
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{con.customerName}</p>
                          <p className="text-xs text-neutral-500">{con.customerPhone}</p>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm">{con.description}</p>
                      </td>
                      <td className="text-right">
                        <p className="font-medium">{formatNumber(con.weight, 2)} บาท</p>
                        <p className="text-xs text-neutral-500">
                          ({formatNumber(con.weight * 15.244, 2)}g)
                        </p>
                      </td>
                      <td className="text-right font-semibold text-primary-700">
                        {formatCurrency(con.principalAmount)}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-info">
                          {con.interestRate}%
                        </span>
                      </td>
                      <td>{formatThaiDate(con.startDate)}</td>
                      <td>
                        <div>
                          <p className={isOverdue ? 'text-red-700 font-medium' : ''}>
                            {formatThaiDate(con.dueDate)}
                          </p>
                          {isOverdue && (
                            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                              <Clock size={12} />
                              เกินกำหนด {Math.abs(daysUntilDue)} วัน
                            </p>
                          )}
                          {isNearDue && (
                            <p className="text-xs text-yellow-700 flex items-center gap-1 mt-1">
                              <Clock size={12} />
                              อีก {daysUntilDue} วัน
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${getStatusBadge(con.status).color}`}>
                          {getStatusBadge(con.status).label}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-outline btn-sm">
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
            <p className="text-sm text-neutral-600">
              แสดง 1-3 จาก 145 รายการ
            </p>
            <div className="flex gap-2">
              <button className="btn btn-secondary" disabled>
                ← ก่อนหน้า
              </button>
              <button className="btn btn-primary">
                ถัดไป →
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-neutral-800 mb-3">ℹ️ วิธีการคำนวณดอกเบี้ย</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• <strong>รายเดือน:</strong> ดอกเบี้ย = เงินต้น × (อัตรา% / 100) × จำนวนเดือน</li>
            <li>• <strong>รายวัน:</strong> ดอกเบี้ย = เงินต้น × (อัตราเดือน% / 100 / 30) × จำนวนวัน</li>
            <li>• ระบบจะแจ้งเตือนอัตโนมัติเมื่อใกล้ครบกำหนด (7 วันก่อน)</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}


'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { Users, Plus, Search, Phone, Mail, Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatThaiPhone } from '@/lib/utils'

export default function CustomersPage() {
  // Mock data
  const customers = [
    {
      id: '1',
      code: 'CUST-001',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phone: '0812345678',
      email: 'somchai@example.com',
      type: 'vip',
      totalPurchases: 850000,
      lastVisit: '2024-12-19',
    },
    {
      id: '2',
      code: 'CUST-002',
      firstName: 'สมหญิง',
      lastName: 'ศรีสุข',
      phone: '0898765432',
      email: 'somying@example.com',
      type: 'regular',
      totalPurchases: 125000,
      lastVisit: '2024-12-18',
    },
    {
      id: '3',
      code: 'CUST-003',
      firstName: 'ประสิทธิ์',
      lastName: 'มั่งคั่ง',
      phone: '0856781234',
      email: null,
      type: 'wholesale',
      totalPurchases: 2450000,
      lastVisit: '2024-12-17',
    },
  ]

  const customerTypes = {
    regular: { label: 'ทั่วไป', color: 'badge-neutral' },
    vip: { label: 'VIP', color: 'badge-warning' },
    wholesale: { label: 'ขายส่ง', color: 'badge-info' },
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              จัดการลูกค้า
            </h1>
            <p className="text-neutral-600">ข้อมูลลูกค้าและประวัติการซื้อ</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            เพิ่มลูกค้าใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">1,245</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Users size={20} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้า VIP</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">85</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ขายส่ง</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">23</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้าใหม่ (เดือนนี้)</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">45</p>
              </div>
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
                  placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select className="input max-w-xs">
              <option>ประเภทลูกค้า: ทั้งหมด</option>
              <option>ทั่วไป</option>
              <option>VIP</option>
              <option>ขายส่ง</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>เบอร์โทรศัพท์</th>
                  <th>อีเมล</th>
                  <th>ประเภท</th>
                  <th className="text-right">ยอดซื้อสะสม</th>
                  <th>เยี่ยมชมล่าสุด</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-mono font-medium text-primary-700">
                      {customer.code}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="font-semibold text-primary-700">
                            {customer.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Phone size={14} />
                        {formatThaiPhone(customer.phone)}
                      </div>
                    </td>
                    <td>
                      {customer.email ? (
                        <div className="flex items-center gap-2 text-neutral-700">
                          <Mail size={14} />
                          {customer.email}
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${customerTypes[customer.type as keyof typeof customerTypes].color}`}>
                        {customerTypes[customer.type as keyof typeof customerTypes].label}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-primary-700">
                      {formatCurrency(customer.totalPurchases)}
                    </td>
                    <td className="text-neutral-700">
                      {new Date(customer.lastVisit).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
            <p className="text-sm text-neutral-600">
              แสดง 1-3 จาก 1,245 รายการ
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
      </div>
    </MainLayout>
  )
}


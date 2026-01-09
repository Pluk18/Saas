'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import ConsignmentModal from '@/components/Consignments/ConsignmentModal'
import ConsignmentDetailModal from '@/components/Consignments/ConsignmentDetailModal'
import DeleteConsignmentModal from '@/components/Consignments/DeleteConsignmentModal'
import PaymentModal from '@/components/Consignments/PaymentModal'
import { useConsignments, useOverdueConsignments } from '@/hooks/useConsignments'
import { calculateConsignmentInterest } from '@/lib/supabaseAPI'
import { Coins, Plus, Search, AlertCircle, Calendar, Clock, Edit, Trash2, Eye, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber, formatThaiDate, daysBetween } from '@/lib/utils'

export default function ConsignmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedConsignment, setSelectedConsignment] = useState<any>(null)
  const [selectedInterest, setSelectedInterest] = useState<any>(null)

  const {
    consignments,
    loading,
    addConsignment,
    editConsignment,
    removeConsignment,
  } = useConsignments({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  })

  const { overdueConsignments } = useOverdueConsignments()

  // Stats
  const activeCount = consignments.filter((c) => c.status === 'active').length
  const nearDueCount = consignments.filter((c) => {
    const days = daysBetween(new Date(), c.due_date)
    return days <= 7 && days > 0 && c.status === 'active'
  }).length
  const totalValue = consignments.reduce((sum, c) => sum + c.principal_amount, 0)

  // Mock data for reference
  const mockConsignments = [
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
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            สร้างสัญญาใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Coins size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">สัญญาทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : consignments.length}
                </p>
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
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : activeCount}
                </p>
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
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : nearDueCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div>
              <p className="text-sm text-neutral-600 mb-1">มูลค่ารวม</p>
              <p className="text-xl font-bold text-primary-700 font-display">
                {loading ? '...' : formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {overdueConsignments.length > 0 && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-700 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  มีสัญญาที่เกินกำหนด {overdueConsignments.length} รายการ
                </h4>
                <p className="text-sm text-red-800">
                  กรุณาติดต่อลูกค้าเพื่อดำเนินการยึดทรัพย์หรือต่ออายุสัญญา
                </p>
              </div>
            </div>
          </div>
        )}

        {nearDueCount > 0 && (
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-yellow-700 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  มีสัญญาที่ใกล้ครบกำหนด {nearDueCount} รายการ
                </h4>
                <p className="text-sm text-yellow-800">
                  กรุณาติดต่อลูกค้าเพื่อแจ้งเตือนการชำระดอกเบี้ยหรือต่ออายุสัญญา
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหารหัสสัญญา, รายละเอียดสินค้า..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select 
              className="input max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">สถานะ: ทั้งหมด</option>
              <option value="active">กำลังดำเนินการ</option>
              <option value="extended">ต่ออายุแล้ว</option>
              <option value="redeemed">ไถ่ถอนแล้ว</option>
              <option value="foreclosed">ยึดทรัพย์แล้ว</option>
            </select>
          </div>
        </div>

        {/* Consignments Table */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : consignments.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Coins size={48} className="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีสัญญาขายฝาก</p>
              <p className="text-sm mt-1">คลิกปุ่ม "สร้างสัญญาใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>รหัสสัญญา</th>
                      <th>ลูกค้า</th>
                      <th>รายละเอียดสินค้า</th>
                      <th className="text-right">น้ำหนัก</th>
                      <th className="text-right">เงินต้น</th>
                      <th className="text-center">ดอกเบี้ย</th>
                      <th>วันเริ่มต้น</th>
                      <th>วันครบกำหนด</th>
                      <th className="text-center">สถานะ</th>
                      <th className="text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consignments.map((con) => {
                      const daysUntilDue = daysBetween(new Date(), con.due_date)
                      const isNearDue = daysUntilDue <= 7 && daysUntilDue > 0
                      const isOverdue = daysUntilDue < 0

                      return (
                        <tr 
                          key={con.id} 
                          className={`${isOverdue ? 'bg-red-50' : isNearDue ? 'bg-yellow-50' : ''}`}
                        >
                          <td className="font-mono font-medium text-primary-700">
                            {con.consignment_code}
                          </td>
                          <td>
                            <div>
                              <p className="font-medium">
                                {con.customer?.first_name} {con.customer?.last_name}
                              </p>
                              <p className="text-xs text-neutral-500">{con.customer?.phone}</p>
                            </div>
                          </td>
                          <td>
                            <p className="text-sm">{con.product_description}</p>
                          </td>
                          <td className="text-right">
                            <p className="font-medium">{formatNumber(con.weight_baht, 2)} บาท</p>
                            <p className="text-xs text-neutral-500">
                              ({formatNumber(con.weight_grams, 2)}g)
                            </p>
                          </td>
                          <td className="text-right font-semibold text-primary-700">
                            {formatCurrency(con.principal_amount)}
                          </td>
                          <td className="text-center">
                            <span className="badge badge-info">
                              {con.interest_rate}% 
                              {con.interest_type === 'monthly' ? '/เดือน' : '/วัน'}
                            </span>
                          </td>
                          <td>{formatThaiDate(con.start_date)}</td>
                          <td>
                            <div>
                              <p className={isOverdue ? 'text-red-700 font-medium' : ''}>
                                {formatThaiDate(con.due_date)}
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
                            <div className="flex items-center justify-center gap-2">
                              {/* ปุ่มรับชำระเงิน - แสดงเฉพาะสัญญาที่ active หรือ extended */}
                              {(con.status === 'active' || con.status === 'extended') && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const interest = await calculateConsignmentInterest(con.id)
                                      setSelectedConsignment(con)
                                      setSelectedInterest(interest)
                                      setIsPaymentModalOpen(true)
                                    } catch (error) {
                                      console.error('Error calculating interest:', error)
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                  title="รับชำระเงิน"
                                >
                                  <DollarSign size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedConsignment(con)
                                  setIsDetailModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title="ดูรายละเอียด"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedConsignment(con)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-amber-600 hover:text-amber-700"
                                title="แก้ไข"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedConsignment(con)
                                  setIsDeleteModalOpen(true)
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="ลบ"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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
                  แสดง 1-{consignments.length} จาก {consignments.length} รายการ
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info Card */}
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-neutral-800 mb-3">ℹ️ วิธีการคำนวณดอกเบี้ย</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• <strong>รายเดือน:</strong> ดอกเบี้ย = เงินต้น × (อัตรา% / 100) × (จำนวนวัน / 30)</li>
            <li>• <strong>รายวัน:</strong> ดอกเบี้ย = เงินต้น × (อัตรา% / 100) × จำนวนวัน</li>
            <li>• ระบบจะแจ้งเตือนอัตโนมัติเมื่อใกล้ครบกำหนด (7 วันก่อน)</li>
            <li>• สามารถคำนวณดอกเบี้ยแบบเรียลไทม์ได้ในหน้ารายละเอียด</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <ConsignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addConsignment}
        mode="add"
      />

      <ConsignmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedConsignment(null)
        }}
        onSave={(data) => editConsignment(selectedConsignment.id, data)}
        consignment={selectedConsignment}
        mode="edit"
      />

      <ConsignmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedConsignment(null)
        }}
        consignmentId={selectedConsignment?.id || null}
        onPaymentClick={(consignment, interest) => {
          setSelectedConsignment(consignment)
          setSelectedInterest(interest)
          setIsPaymentModalOpen(true)
        }}
      />

      <DeleteConsignmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedConsignment(null)
        }}
        onConfirm={() => removeConsignment(selectedConsignment.id)}
        consignment={selectedConsignment}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedConsignment(null)
          setSelectedInterest(null)
        }}
        consignment={selectedConsignment}
        interest={selectedInterest}
        onSuccess={() => {
          // Refresh consignments list
          window.location.reload()
        }}
      />
    </MainLayout>
  )
}


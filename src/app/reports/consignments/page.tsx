'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  ArrowLeft,
  HandCoins,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import KPICard from '@/components/Reports/KPICard'
import PieChartComponent from '@/components/Reports/PieChartComponent'
import ExportButton from '@/components/Reports/ExportButton'
import {
  getConsignmentReport,
  getConsignmentSummary,
  getExpiringConsignments
} from '@/lib/supabaseAPI'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ConsignmentsReportPage() {
  const [loading, setLoading] = useState(true)
  const [consignments, setConsignments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [expiring, setExpiring] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [consignData, summaryData, expiringData] = await Promise.all([
        getConsignmentReport(),
        getConsignmentSummary(),
        getExpiringConsignments(7)
      ])
      setConsignments(consignData)
      setSummary(summaryData)
      setExpiring(expiringData)
    } catch (error) {
      console.error('Error loading consignment report:', error)
      toast.error('ไม่สามารถโหลดรายงานฝากขายได้')
    } finally {
      setLoading(false)
    }
  }

  const filteredConsignments = consignments.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    return true
  })

  const statusDistribution = [
    { name: 'ดำเนินการ', value: summary?.activeConsignments || 0 },
    { name: 'หมดอายุ', value: summary?.expiredConsignments || 0 },
    { name: 'ไถ่ถอนแล้ว', value: summary?.redeemedConsignments || 0 }
  ].filter(item => item.value > 0)

  const exportData = filteredConsignments.map(c => ({
    'เลขสัญญา': c.consignment_number,
    'ลูกค้า': c.customers?.customer_name || '-',
    'เบอร์โทร': c.customers?.phone_number || '-',
    'มูลค่าสินค้า': c.item_value,
    'จำนวนเงินกู้': c.loan_amount,
    'อัตราดอกเบี้ย (%)': c.interest_rate,
    'วันที่ฝาก': new Date(c.consignment_date).toLocaleDateString('th-TH'),
    'วันหมดอายุ': new Date(c.due_date).toLocaleDateString('th-TH'),
    'สถานะ': c.status === 'active' ? 'ดำเนินการ' :
            c.status === 'expired' ? 'หมดอายุ' :
            c.status === 'redeemed' ? 'ไถ่ถอนแล้ว' : 'ยกเลิก'
  }))

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports" className="btn btn-outline btn-sm">
              <ArrowLeft size={18} />
              กลับ
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                รายงานฝากขาย
              </h1>
              <p className="text-neutral-600">
                ดูสัญญาฝากขาย ดอกเบี้ย และสถานะสัญญา
              </p>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="สัญญาทั้งหมด"
              value={summary.totalConsignments}
              icon={HandCoins}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="number"
            />
            <KPICard
              title="มูลค่ารวม"
              value={summary.totalValue}
              icon={DollarSign}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="currency"
            />
            <KPICard
              title="ดำเนินการ"
              value={summary.activeConsignments}
              icon={Clock}
              colorClass="from-primary-50 to-primary-100 border-primary-200"
              format="number"
            />
            <KPICard
              title="ดอกเบี้ยคาดการณ์"
              value={summary.expectedInterest}
              icon={CheckCircle}
              colorClass="from-accent-50 to-accent-100 border-accent-200"
              format="currency"
            />
          </div>
        ) : null}

        {/* Expiring Soon Alert */}
        {!loading && expiring.length > 0 && (
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-amber-900 mb-2">
                  สัญญาใกล้หมดอายุ ({expiring.length} สัญญา)
                </h3>
                <div className="space-y-2">
                  {expiring.slice(0, 5).map((item) => {
                    const daysLeft = getDaysUntilDue(item.due_date)
                    return (
                      <div key={item.consignment_id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.consignment_number}</span>
                          {' - '}
                          <span className="text-neutral-700">{item.customers?.customer_name}</span>
                        </div>
                        <span className={`font-medium ${daysLeft <= 3 ? 'text-red-600' : 'text-amber-700'}`}>
                          เหลือ {daysLeft} วัน
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          {!loading && statusDistribution.length > 0 && (
            <PieChartComponent
              data={statusDistribution}
              title="สัดส่วนสถานะสัญญา"
              colors={['#d4af37', '#ef4444', '#10b981']}
            />
          )}

          {/* Filter */}
          <div className="card">
            <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
              ตัวกรองสถานะ
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`w-full btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
              >
                ทั้งหมด ({consignments.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`w-full btn ${filterStatus === 'active' ? 'btn-primary' : 'btn-outline'}`}
              >
                ดำเนินการ ({summary?.activeConsignments || 0})
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`w-full btn ${filterStatus === 'expired' ? 'btn-primary' : 'btn-outline'}`}
              >
                หมดอายุ ({summary?.expiredConsignments || 0})
              </button>
              <button
                onClick={() => setFilterStatus('redeemed')}
                className={`w-full btn ${filterStatus === 'redeemed' ? 'btn-primary' : 'btn-outline'}`}
              >
                ไถ่ถอนแล้ว ({summary?.redeemedConsignments || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Consignments Table */}
        {!loading && filteredConsignments.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                รายการสัญญาฝากขาย ({filteredConsignments.length} รายการ)
              </h3>
              <ExportButton
                data={exportData}
                filename={`consignments-report-${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>เลขสัญญา</th>
                    <th>ลูกค้า</th>
                    <th className="text-right">จำนวนเงินกู้</th>
                    <th className="text-right">ดอกเบี้ย/เดือน</th>
                    <th>วันหมดอายุ</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsignments.map((item) => {
                    const monthlyInterest = (item.loan_amount * item.interest_rate) / 100
                    return (
                      <tr key={item.consignment_id}>
                        <td className="font-medium">{item.consignment_number}</td>
                        <td>
                          <div>
                            <p className="font-medium">{item.customers?.customer_name || '-'}</p>
                            <p className="text-sm text-neutral-600">
                              {item.customers?.phone_number || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(item.loan_amount)}
                        </td>
                        <td className="text-right text-green-600">
                          {formatCurrency(monthlyInterest)}
                        </td>
                        <td>
                          {new Date(item.due_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          {item.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              <Clock size={14} />
                              ดำเนินการ
                            </span>
                          )}
                          {item.status === 'expired' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              <AlertTriangle size={14} />
                              หมดอายุ
                            </span>
                          )}
                          {item.status === 'redeemed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              <CheckCircle size={14} />
                              ไถ่ถอนแล้ว
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredConsignments.length === 0 && (
          <div className="card text-center py-12">
            <HandCoins size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              ไม่มีสัญญาฝากขาย
            </h3>
            <p className="text-neutral-600">
              ไม่พบสัญญาฝากขายที่ตรงกับตัวกรอง
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { 
  FileText, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, daysBetween } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import KPICard from '@/components/Reports/KPICard'
import StatusPieChart from '@/components/Reports/StatusPieChart'
import ExportButton from '@/components/Reports/ExportButton'

export default function PawnReportPage() {
  const {
    loading,
    loadConsignmentReport,
    loadExpiringConsignments
  } = useReports()

  const [report, setReport] = useState<any>(null)
  const [expiringList, setExpiringList] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [reportData, expiring] = await Promise.all([
      loadConsignmentReport(),
      loadExpiringConsignments(7)
    ])
    setReport(reportData)
    setExpiringList(expiring)
  }

  // Calculate status distribution
  const statusDistribution = [
    { status: 'active', count: report?.activeConsignments || 0 },
    { status: 'expired', count: report?.expiredConsignments || 0 },
    { status: 'redeemed', count: report?.redeemedConsignments || 0 }
  ].filter(item => item.count > 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-2"
            >
              <ArrowLeft size={18} />
              กลับไปหน้ารายงาน
            </Link>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              รายงานขายฝาก
            </h1>
            <p className="text-neutral-600">
              ตรวจสอบสัญญาขายฝาก สถานะ และสัญญาที่ใกล้หมดอายุ
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-neutral-600 mt-4">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Content */}
        {!loading && report && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title="สัญญาทั้งหมด"
                value={report.totalConsignments}
                icon={FileText}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
                subtitle="สัญญา"
              />
              <KPICard
                title="ยังใช้งาน"
                value={report.activeConsignments}
                icon={CheckCircle}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
                subtitle="สัญญา"
              />
              <KPICard
                title="มูลค่ารวม"
                value={formatCurrency(report.totalValue)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
              />
              <KPICard
                title="ดอกเบี้ยรวม"
                value={formatCurrency(report.totalInterest)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200"
                iconBg="bg-accent-600"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <StatusPieChart data={statusDistribution.map(item => ({
                status: item.status === 'active' ? 'available' : item.status,
                count: item.count
              }))} />

              {/* Expiring Soon */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-orange-600" />
                  <h3 className="text-lg font-display font-semibold text-neutral-800">
                    ใกล้หมดอายุ (7 วัน)
                  </h3>
                </div>

                {expiringList.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {expiringList.map((contract: any) => {
                      const daysLeft = daysBetween(new Date(), new Date(contract.due_date))
                      return (
                        <div
                          key={contract.id}
                          className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-neutral-900">
                                {contract.consignment_code}
                              </p>
                              <p className="text-sm text-neutral-600">
                                {contract.customers 
                                  ? `${contract.customers.first_name} ${contract.customers.last_name}`
                                  : '-'
                                }
                              </p>
                            </div>
                            <span className={`badge text-xs ${
                              daysLeft <= 1 
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-orange-100 text-orange-700 border-orange-200'
                            }`}>
                              เหลือ {daysLeft} วัน
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">มูลค่า:</span>
                            <span className="font-semibold text-primary-700">
                              {formatCurrency(contract.principal_amount)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    ไม่มีสัญญาที่ใกล้หมดอายุ
                  </div>
                )}
              </div>
            </div>

            {/* All Contracts Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  สัญญาทั้งหมด ({report.consignments.length} สัญญา)
                </h3>
                <ExportButton
                  data={report.consignments.map((c: any) => ({
                    consignment_code: c.consignment_code,
                    customer: c.customers 
                      ? `${c.customers.first_name} ${c.customers.last_name}`
                      : '-',
                    product_description: c.product_description,
                    principal_amount: c.principal_amount,
                    interest_rate: c.interest_rate,
                    start_date: new Date(c.start_date).toLocaleDateString('th-TH'),
                    due_date: new Date(c.due_date).toLocaleDateString('th-TH'),
                    status: c.status
                  }))}
                  filename={`pawn-contracts-${new Date().toISOString().split('T')[0]}`}
                  columns={[
                    { key: 'consignment_code', label: 'เลขสัญญา' },
                    { key: 'customer', label: 'ลูกค้า' },
                    { key: 'product_description', label: 'รายละเอียด' },
                    { key: 'principal_amount', label: 'มูลค่า' },
                    { key: 'interest_rate', label: 'อัตราดอกเบี้ย' },
                    { key: 'start_date', label: 'วันเริ่ม' },
                    { key: 'due_date', label: 'วันครบกำหนด' },
                    { key: 'status', label: 'สถานะ' }
                  ]}
                />
              </div>

              {report.consignments.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>เลขสัญญา</th>
                        <th>ลูกค้า</th>
                        <th>รายละเอียด</th>
                        <th className="text-right">มูลค่า</th>
                        <th className="text-right">อัตราดอกเบี้ย</th>
                        <th className="text-right">ดอกเบี้ยรวม</th>
                        <th>วันเริ่ม</th>
                        <th>วันสิ้นสุด</th>
                        <th>สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.consignments.map((contract: any) => {
                        const isExpiringSoon = contract.status === 'active' && 
                          daysBetween(new Date(), new Date(contract.due_date)) <= 7

                        return (
                          <tr key={contract.id} className={isExpiringSoon ? 'bg-orange-50' : ''}>
                            <td className="font-medium text-primary-600">
                              {contract.consignment_code}
                              {isExpiringSoon && (
                                <AlertCircle size={14} className="inline ml-1 text-orange-600" />
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-neutral-400" />
                                <span className="text-sm">
                                  {contract.customers 
                                    ? `${contract.customers.first_name} ${contract.customers.last_name}`
                                    : '-'
                                  }
                                </span>
                              </div>
                            </td>
                            <td className="text-sm">{contract.product_description}</td>
                            <td className="text-right font-semibold text-primary-700">
                              {formatCurrency(contract.principal_amount)}
                            </td>
                            <td className="text-right">{contract.interest_rate}%</td>
                            <td className="text-right font-medium">
                              {formatCurrency(
                                (contract.principal_amount * contract.interest_rate / 100) * (contract.total_months || 0)
                              )}
                            </td>
                            <td className="text-sm">
                              {new Date(contract.start_date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-neutral-400" />
                                {new Date(contract.due_date).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td>
                              {contract.status === 'active' && (
                                <span className="badge bg-green-100 text-green-700 border-green-200">
                                  ใช้งาน
                                </span>
                              )}
                              {contract.status === 'expired' && (
                                <span className="badge bg-red-100 text-red-700 border-red-200">
                                  หมดอายุ
                                </span>
                              )}
                              {contract.status === 'redeemed' && (
                                <span className="badge bg-blue-100 text-blue-700 border-blue-200">
                                  ไถ่แล้ว
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ยังไม่มีสัญญาขายฝากในระบบ
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

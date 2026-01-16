'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { 
  PiggyBank, 
  DollarSign, 
  TrendingUp,
  Target,
  ArrowLeft,
  User
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import KPICard from '@/components/Reports/KPICard'
import StatusPieChart from '@/components/Reports/StatusPieChart'
import ExportButton from '@/components/Reports/ExportButton'

export default function GoldSavingsReportPage() {
  const {
    loading,
    loadGoldSavingsReport,
    loadNearGoalAccounts
  } = useReports()

  const [report, setReport] = useState<any>(null)
  const [nearGoalList, setNearGoalList] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [reportData, nearGoal] = await Promise.all([
      loadGoldSavingsReport(),
      loadNearGoalAccounts(90)
    ])
    setReport(reportData)
    setNearGoalList(nearGoal)
  }

  // Calculate status distribution
  const statusDistribution = [
    { status: 'active', count: report?.activeAccounts || 0 },
    { status: 'redeemed', count: report?.closedAccounts || 0 }
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
              รายงานออมทอง
            </h1>
            <p className="text-neutral-600">
              ดูข้อมูลบัญชีออมทอง ยอดเงินรวม และบัญชีที่ใกล้ถึงเป้าหมาย
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
                title="บัญชีทั้งหมด"
                value={report.totalAccounts}
                icon={PiggyBank}
                gradient="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
                iconBg="bg-amber-600"
                subtitle="บัญชี"
              />
              <KPICard
                title="บัญชีที่ใช้งาน"
                value={report.activeAccounts}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
                subtitle="บัญชี"
              />
              <KPICard
                title="ยอดเงินรวม"
                value={formatCurrency(report.totalBalance)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
              />
              <KPICard
                title="ใกล้ถึงเป้า"
                value={nearGoalList.length}
                icon={Target}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
                subtitle="> 90%"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <StatusPieChart data={statusDistribution.map(item => ({
                status: item.status === 'active' ? 'available' : item.status,
                count: item.count
              }))} />

              {/* Near Goal Alert */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={20} className="text-blue-600" />
                  <h3 className="text-lg font-display font-semibold text-neutral-800">
                    ใกล้ถึงเป้าหมาย (> 90%)
                  </h3>
                </div>

                {nearGoalList.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {nearGoalList.map((account: any) => {
                      const progress = account.target_amount 
                        ? (account.balance / account.target_amount * 100)
                        : 0
                      
                      return (
                        <div
                          key={account.id}
                          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-neutral-900">
                                {account.account_number}
                              </p>
                              <p className="text-sm text-neutral-600">
                                {account.customers 
                                  ? `${account.customers.first_name} ${account.customers.last_name}`
                                  : '-'
                                }
                              </p>
                            </div>
                            <span className="badge bg-blue-100 text-blue-700 border-blue-200 text-xs">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-600">ยอดปัจจุบัน:</span>
                              <span className="font-semibold text-primary-700">
                                {formatCurrency(account.balance)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-600">เป้าหมาย:</span>
                              <span className="text-neutral-900">
                                {formatCurrency(account.target_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    ไม่มีบัญชีที่ใกล้ถึงเป้าหมาย
                  </div>
                )}
              </div>
            </div>

            {/* All Accounts Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  บัญชีทั้งหมด ({report.savings.length} บัญชี)
                </h3>
                <ExportButton
                  data={report.savings.map((s: any) => ({
                    account_number: s.account_number,
                    customer: s.customers 
                      ? `${s.customers.first_name} ${s.customers.last_name}`
                      : '-',
                    balance: s.balance,
                    target_amount: s.target_amount || 0,
                    progress: s.target_amount ? (s.balance / s.target_amount * 100).toFixed(2) : 0,
                    status: s.status,
                    created_at: new Date(s.created_at).toLocaleDateString('th-TH')
                  }))}
                  filename={`gold-savings-${new Date().toISOString().split('T')[0]}`}
                  columns={[
                    { key: 'account_number', label: 'เลขบัญชี' },
                    { key: 'customer', label: 'ลูกค้า' },
                    { key: 'balance', label: 'ยอดคงเหลือ' },
                    { key: 'target_amount', label: 'เป้าหมาย' },
                    { key: 'progress', label: 'ความคืบหน้า (%)' },
                    { key: 'status', label: 'สถานะ' },
                    { key: 'created_at', label: 'วันที่สร้าง' }
                  ]}
                />
              </div>

              {report.savings.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>เลขบัญชี</th>
                        <th>ลูกค้า</th>
                        <th className="text-right">ยอดคงเหลือ</th>
                        <th className="text-right">เป้าหมาย</th>
                        <th className="text-right">ความคืบหน้า</th>
                        <th>สถานะ</th>
                        <th>วันที่สร้าง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.savings.map((account: any) => {
                        const progress = account.target_amount 
                          ? (account.balance / account.target_amount * 100)
                          : 0
                        const isNearGoal = progress >= 90

                        return (
                          <tr key={account.id} className={isNearGoal ? 'bg-blue-50' : ''}>
                            <td className="font-medium text-primary-600">
                              {account.account_number}
                              {isNearGoal && (
                                <Target size={14} className="inline ml-1 text-blue-600" />
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-neutral-400" />
                                <span className="text-sm">
                                  {account.customers 
                                    ? `${account.customers.first_name} ${account.customers.last_name}`
                                    : '-'
                                  }
                                </span>
                              </div>
                            </td>
                            <td className="text-right font-semibold text-primary-700">
                              {formatCurrency(account.balance)}
                            </td>
                            <td className="text-right">
                              {account.target_amount 
                                ? formatCurrency(account.target_amount)
                                : '-'
                              }
                            </td>
                            <td className="text-right">
                              {account.target_amount ? (
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 bg-neutral-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        progress >= 100 
                                          ? 'bg-green-600'
                                          : progress >= 90
                                          ? 'bg-blue-600'
                                          : progress >= 50
                                          ? 'bg-primary-600'
                                          : 'bg-neutral-400'
                                      }`}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {progress.toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-neutral-400">-</span>
                              )}
                            </td>
                            <td>
                              {account.status === 'active' && (
                                <span className="badge bg-green-100 text-green-700 border-green-200">
                                  ใช้งาน
                                </span>
                              )}
                              {account.status === 'closed' && (
                                <span className="badge bg-neutral-100 text-neutral-700 border-neutral-200">
                                  ปิดแล้ว
                                </span>
                              )}
                            </td>
                            <td className="text-sm">
                              {new Date(account.created_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ยังไม่มีบัญชีออมทองในระบบ
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

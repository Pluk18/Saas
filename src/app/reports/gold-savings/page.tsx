'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  ArrowLeft,
  PiggyBank,
  DollarSign,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react'
import Link from 'next/link'
import KPICard from '@/components/Reports/KPICard'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import PieChartComponent from '@/components/Reports/PieChartComponent'
import ExportButton from '@/components/Reports/ExportButton'
import {
  getGoldSavingsReport,
  getGoldSavingsSummary,
  getNearGoalAccounts,
  getGoldSavingsTransactionReport
} from '@/lib/supabaseAPI'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function GoldSavingsReportPage() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [savings, setSavings] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [nearGoal, setNearGoal] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setDate(today.getDate() - 30)
    setStartDate(monthAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    loadSavingsData()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      loadTransactionData()
    }
  }, [startDate, endDate])

  const loadSavingsData = async () => {
    try {
      setLoading(true)
      const [savingsData, summaryData, nearGoalData] = await Promise.all([
        getGoldSavingsReport(),
        getGoldSavingsSummary(),
        getNearGoalAccounts(90)
      ])
      setSavings(savingsData)
      setSummary(summaryData)
      setNearGoal(nearGoalData)
    } catch (error) {
      console.error('Error loading gold savings report:', error)
      toast.error('ไม่สามารถโหลดรายงานออมทองได้')
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionData = async () => {
    try {
      const transData = await getGoldSavingsTransactionReport(startDate, endDate)
      setTransactions(transData)
    } catch (error) {
      console.error('Error loading transaction data:', error)
    }
  }

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const filteredSavings = savings.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    return true
  })

  const statusDistribution = [
    { name: 'กำลังใช้งาน', value: summary?.activeAccounts || 0 },
    { name: 'ปิดบัญชี', value: summary?.closedAccounts || 0 }
  ].filter(item => item.value > 0)

  const exportData = filteredSavings.map(s => ({
    'เลขบัญชี': s.account_number,
    'ลูกค้า': s.customers?.customer_name || '-',
    'เบอร์โทร': s.customers?.phone_number || '-',
    'ยอดคงเหลือ': s.balance || 0,
    'เป้าหมาย': s.target_amount || 0,
    'ความคืบหน้า (%)': s.target_amount ? ((s.balance / s.target_amount) * 100).toFixed(2) : 0,
    'วันที่สร้าง': new Date(s.created_at).toLocaleDateString('th-TH'),
    'สถานะ': s.status === 'active' ? 'กำลังใช้งาน' : 'ปิดบัญชี'
  }))

  const exportNearGoalData = nearGoal.map((s, i) => ({
    'อันดับ': i + 1,
    'เลขบัญชี': s.account_number,
    'ลูกค้า': s.customers?.customer_name || '-',
    'ยอดคงเหลือ': s.balance || 0,
    'เป้าหมาย': s.target_amount || 0,
    'ความคืบหน้า (%)': ((s.balance / s.target_amount) * 100).toFixed(2),
    'เหลือ': s.target_amount - s.balance
  }))

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
                รายงานออมทอง
              </h1>
              <p className="text-neutral-600">
                ติดตามบัญชีออมทอง ยอดเงิน และความคืบหน้า
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Picker for Transactions */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

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
              title="บัญชีทั้งหมด"
              value={summary.totalAccounts}
              icon={PiggyBank}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="number"
            />
            <KPICard
              title="ยอดเงินรวม"
              value={summary.totalBalance}
              icon={DollarSign}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="currency"
            />
            <KPICard
              title="บัญชีที่ใช้งาน"
              value={summary.activeAccounts}
              icon={TrendingUp}
              colorClass="from-primary-50 to-primary-100 border-primary-200"
              format="number"
            />
            <KPICard
              title="บัญชีใกล้ถึงเป้า"
              value={nearGoal.length}
              icon={Target}
              colorClass="from-accent-50 to-accent-100 border-accent-200"
              format="number"
            />
          </div>
        ) : null}

        {/* Transaction Summary */}
        {!loading && transactions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 mb-1">ฝากเงิน</p>
                  <p className="text-2xl font-bold text-neutral-900 font-display">
                    {formatCurrency(transactions.totalDeposits)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {transactions.depositCount} ครั้ง
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                  <Activity size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 mb-1">ถอนเงิน</p>
                  <p className="text-2xl font-bold text-neutral-900 font-display">
                    {formatCurrency(transactions.totalWithdrawals)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {transactions.withdrawalCount} ครั้ง
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 mb-1">ส่วนต่าง</p>
                  <p className="text-2xl font-bold text-neutral-900 font-display">
                    {formatCurrency(transactions.totalDeposits - transactions.totalWithdrawals)}
                  </p>
                  <p className="text-sm text-neutral-600">
                    ฝาก - ถอน
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Near Goal Accounts */}
        {!loading && nearGoal.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                บัญชีใกล้ถึงเป้า (≥ 90%)
              </h3>
              <ExportButton
                data={exportNearGoalData}
                filename={`near-goal-accounts-${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            <div className="space-y-3">
              {nearGoal.map((account, idx) => {
                const progress = (account.balance / account.target_amount) * 100
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-neutral-900">{account.account_number}</p>
                        <span className="text-sm text-neutral-600">
                          - {account.customers?.customer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-primary-700 flex-shrink-0">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(account.balance)}
                      </p>
                      <p className="text-sm text-neutral-600">
                        / {formatCurrency(account.target_amount)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          {!loading && statusDistribution.length > 0 && (
            <PieChartComponent
              data={statusDistribution}
              title="สัดส่วนสถานะบัญชี"
              colors={['#d4af37', '#6b7280']}
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
                ทั้งหมด ({savings.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`w-full btn ${filterStatus === 'active' ? 'btn-primary' : 'btn-outline'}`}
              >
                กำลังใช้งาน ({summary?.activeAccounts || 0})
              </button>
              <button
                onClick={() => setFilterStatus('closed')}
                className={`w-full btn ${filterStatus === 'closed' ? 'btn-primary' : 'btn-outline'}`}
              >
                ปิดบัญชี ({summary?.closedAccounts || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Savings Accounts Table */}
        {!loading && filteredSavings.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                บัญชีออมทอง ({filteredSavings.length} บัญชี)
              </h3>
              <ExportButton
                data={exportData}
                filename={`gold-savings-report-${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>เลขบัญชี</th>
                    <th>ลูกค้า</th>
                    <th className="text-right">ยอดคงเหลือ</th>
                    <th className="text-right">เป้าหมาย</th>
                    <th>ความคืบหน้า</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSavings.map((item) => {
                    const progress = item.target_amount
                      ? (item.balance / item.target_amount) * 100
                      : 0
                    return (
                      <tr key={item.saving_id}>
                        <td className="font-medium">{item.account_number}</td>
                        <td>
                          <div>
                            <p className="font-medium">{item.customers?.customer_name || '-'}</p>
                            <p className="text-sm text-neutral-600">
                              {item.customers?.phone_number || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="text-right font-medium text-primary-700">
                          {formatCurrency(item.balance || 0)}
                        </td>
                        <td className="text-right">
                          {item.target_amount ? formatCurrency(item.target_amount) : '-'}
                        </td>
                        <td>
                          {item.target_amount ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-neutral-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-neutral-700">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {item.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              <Activity size={14} />
                              ใช้งาน
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                              ปิดบัญชี
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
        {!loading && filteredSavings.length === 0 && (
          <div className="card text-center py-12">
            <PiggyBank size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              ไม่มีบัญชีออมทอง
            </h3>
            <p className="text-neutral-600">
              ไม่พบบัญชีออมทองที่ตรงกับตัวกรอง
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

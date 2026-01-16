'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  HandCoins,
  PiggyBank
} from 'lucide-react'
import KPICard from '@/components/Reports/KPICard'
import ReportCard from '@/components/Reports/ReportCard'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import SalesChart from '@/components/Reports/SalesChart'
import { getSalesSummary, getDailySalesReport } from '@/lib/supabaseAPI'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [dailyData, setDailyData] = useState<any[]>([])

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setDate(today.getDate() - 30)
    setStartDate(monthAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      loadData()
    }
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [summaryData, dailySales] = await Promise.all([
        getSalesSummary(startDate, endDate),
        getDailySalesReport(startDate, endDate)
      ])
      setSummary(summaryData)
      setDailyData(dailySales)
    } catch (error) {
      console.error('Error loading reports data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลรายงานได้')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              รายงานและสถิติ
            </h1>
            <p className="text-neutral-600">
              ดูรายงานและวิเคราะห์ข้อมูลธุรกิจของคุณ
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        {/* KPI Cards */}
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
              title="ยอดขายสุทธิ"
              value={summary.netAmount}
              icon={DollarSign}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="currency"
            />
            <KPICard
              title="ยอดขายรวม"
              value={summary.totalSales}
              icon={ShoppingCart}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="currency"
            />
            <KPICard
              title="จำนวนบิล"
              value={summary.transactionCount}
              icon={FileText}
              colorClass="from-primary-50 to-primary-100 border-primary-200"
              format="number"
            />
            <KPICard
              title="ยอดเฉลี่ย/บิล"
              value={summary.averagePerTransaction}
              icon={TrendingUp}
              colorClass="from-accent-50 to-accent-100 border-accent-200"
              format="currency"
            />
          </div>
        ) : null}

        {/* Sales Chart */}
        {!loading && dailyData.length > 0 && (
          <SalesChart data={dailyData} title="กราฟยอดขายรายวัน" />
        )}

        {/* Report Cards */}
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">
            รายงานทั้งหมด
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard
              title="รายงานยอดขาย"
              description="ดูรายละเอียดยอดขาย สินค้าขายดี และช่องทางชำระเงิน"
              icon={ShoppingCart}
              href="/reports/sales"
              iconColor="bg-green-600"
            />
            <ReportCard
              title="รายงานสินค้าคงคลัง"
              description="ตรวจสอบสินค้าคงคลัง มูลค่าสินค้า และสินค้าที่ขายแล้ว"
              icon={Package}
              href="/reports/inventory"
              iconColor="bg-blue-600"
            />
            <ReportCard
              title="รายงานลูกค้า"
              description="วิเคราะห์ลูกค้า ลูกค้าที่ซื้อมากที่สุด และลูกค้าใหม่"
              icon={Users}
              href="/reports/customers"
              iconColor="bg-purple-600"
            />
            <ReportCard
              title="รายงานฝากขาย"
              description="ดูสัญญาฝากขาย ดอกเบี้ย และสถานะสัญญา"
              icon={HandCoins}
              href="/reports/consignments"
              iconColor="bg-amber-600"
            />
            <ReportCard
              title="รายงานออมทอง"
              description="ติดตามบัญชีออมทอง ยอดเงิน และความคืบหน้า"
              icon={PiggyBank}
              href="/reports/gold-savings"
              iconColor="bg-primary-600"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

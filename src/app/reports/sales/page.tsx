'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Download
} from 'lucide-react'
import Link from 'next/link'
import KPICard from '@/components/Reports/KPICard'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import SalesChart from '@/components/Reports/SalesChart'
import PieChartComponent from '@/components/Reports/PieChartComponent'
import ExportButton from '@/components/Reports/ExportButton'
import {
  getSalesSummary,
  getDailySalesReport,
  getTopSellingProducts,
  getPaymentMethodBreakdown
} from '@/lib/supabaseAPI'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([])

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
      const [summaryData, dailySales, topProd, paymentData] = await Promise.all([
        getSalesSummary(startDate, endDate),
        getDailySalesReport(startDate, endDate),
        getTopSellingProducts(startDate, endDate, 10),
        getPaymentMethodBreakdown(startDate, endDate)
      ])
      setSummary(summaryData)
      setDailyData(dailySales)
      setTopProducts(topProd)
      setPaymentBreakdown(paymentData)
    } catch (error) {
      console.error('Error loading sales report:', error)
      toast.error('ไม่สามารถโหลดรายงานยอดขายได้')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      cash: 'เงินสด',
      transfer: 'โอนเงิน',
      card: 'บัตรเครดิต',
      mixed: 'ผสม',
      gold_credit: 'เครดิตออมทอง'
    }
    return names[method] || method
  }

  const exportDailyData = dailyData.map(day => ({
    'วันที่': new Date(day.date).toLocaleDateString('th-TH'),
    'จำนวนบิล': day.count,
    'ยอดขาย': day.totalSales,
    'ส่วนลด': day.discount,
    'เทิร์นทอง': day.tradeIn,
    'VAT 7%': day.vat,
    'ยอดสุทธิ': day.net
  }))

  const exportTopProducts = topProducts.map((p, i) => ({
    'อันดับ': i + 1,
    'รหัสสินค้า': p.productCode,
    'ชื่อสินค้า': p.productName,
    'จำนวนขาย': p.quantity,
    'มูลค่ารวม': p.totalValue,
    'ราคาเฉลี่ย': p.totalValue / p.quantity
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
                รายงานยอดขาย
              </h1>
              <p className="text-neutral-600">
                วิเคราะห์ยอดขาย สินค้าขายดี และช่องทางชำระเงิน
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
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
              title="ยอดขายรวม"
              value={summary.totalSales}
              icon={ShoppingCart}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="currency"
            />
            <KPICard
              title="ยอดสุทธิ"
              value={summary.netAmount}
              icon={DollarSign}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="currency"
            />
            <KPICard
              title="จำนวนบิล"
              value={summary.transactionCount}
              icon={Receipt}
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

        {/* Sales Trend Chart */}
        {!loading && dailyData.length > 0 && (
          <SalesChart data={dailyData} title="กราฟยอดขายรายวัน" />
        )}

        {/* Daily Sales Table */}
        {!loading && dailyData.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                รายงานยอดขายรายวัน
              </h3>
              <ExportButton
                data={exportDailyData}
                filename={`sales-daily-${startDate}-${endDate}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th className="text-right">จำนวนบิล</th>
                    <th className="text-right">ยอดขาย</th>
                    <th className="text-right">ส่วนลด</th>
                    <th className="text-right">เทิร์นทอง</th>
                    <th className="text-right">VAT 7%</th>
                    <th className="text-right">ยอดสุทธิ</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((day, idx) => (
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
                      <td className="text-right font-medium">{formatCurrency(day.totalSales)}</td>
                      <td className="text-right text-red-600">
                        {day.discount > 0 ? `-${formatCurrency(day.discount)}` : '-'}
                      </td>
                      <td className="text-right text-red-600">
                        {day.tradeIn > 0 ? `-${formatCurrency(day.tradeIn)}` : '-'}
                      </td>
                      <td className="text-right text-green-600">
                        {day.vat > 0 ? `+${formatCurrency(day.vat)}` : '-'}
                      </td>
                      <td className="text-right font-bold text-primary-700">
                        {formatCurrency(day.net)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary-50 font-semibold">
                    <td>รวม</td>
                    <td className="text-right">{summary?.transactionCount || 0}</td>
                    <td className="text-right">{formatCurrency(summary?.totalSales || 0)}</td>
                    <td className="text-right text-red-600">
                      -{formatCurrency(summary?.totalDiscount || 0)}
                    </td>
                    <td className="text-right text-red-600">
                      -{formatCurrency(summary?.totalTradeIn || 0)}
                    </td>
                    <td className="text-right text-green-600">
                      +{formatCurrency(summary?.totalVat || 0)}
                    </td>
                    <td className="text-right text-primary-700">
                      {formatCurrency(summary?.netAmount || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          {!loading && topProducts.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  สินค้าขายดี Top 10
                </h3>
                <ExportButton
                  data={exportTopProducts}
                  filename={`top-products-${startDate}-${endDate}`}
                />
              </div>
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {product.productName}
                      </p>
                      <p className="text-sm text-neutral-600">
                        ขายได้ {product.quantity} ชิ้น
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-primary-700">
                        {formatCurrency(product.totalValue)}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {formatCurrency(product.totalValue / product.quantity)}/ชิ้น
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Breakdown */}
          {!loading && paymentBreakdown.length > 0 && (
            <PieChartComponent
              data={paymentBreakdown.map(p => ({
                name: getPaymentMethodName(p.method),
                value: p.totalAmount
              }))}
              title="สัดส่วนช่องทางชำระเงิน"
            />
          )}
        </div>

        {/* Empty State */}
        {!loading && dailyData.length === 0 && (
          <div className="card text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              ไม่มีข้อมูลยอดขาย
            </h3>
            <p className="text-neutral-600">
              ไม่พบข้อมูลการขายในช่วงเวลาที่เลือก
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

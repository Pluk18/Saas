'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  FileText,
  Users,
  FileSignature,
  PiggyBank,
  BarChart3
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import KPICard from '@/components/Reports/KPICard'
import SalesChart from '@/components/Reports/SalesChart'
import ReportCard from '@/components/Reports/ReportCard'
import ExportButton from '@/components/Reports/ExportButton'

export default function ReportsPage() {
  const {
    loading,
    startDate,
    endDate,
    updateDateRange,
    salesSummary,
    dailySales,
    topProducts
  } = useReports()

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

        {/* Date Range Filter */}
        <DateRangePicker
          onRangeChange={updateDateRange}
          defaultPreset="month"
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-neutral-600 mt-4">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && salesSummary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title="ยอดขายรวม"
                value={formatCurrency(salesSummary.totalNet)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
                subtitle={`${salesSummary.transactionCount} รายการ`}
              />

              <KPICard
                title="ยอดเฉลี่ยต่อบิล"
                value={formatCurrency(salesSummary.avgPerTransaction)}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
              />

              <KPICard
                title="สินค้าขายออก"
                value={`${salesSummary.totalItems} ชิ้น`}
                icon={Package}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
              />

              <KPICard
                title="จำนวนบิล"
                value={salesSummary.transactionCount}
                icon={ShoppingCart}
                gradient="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200"
                iconBg="bg-accent-600"
              />
            </div>

            {/* Sales Chart */}
            <SalesChart data={dailySales} />

            {/* Report Links */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
                รายงานทั้งหมด
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCard
                  title="รายงานยอดขาย"
                  description="ดูรายละเอียดยอดขาย สินค้าขายดี และช่องทางการชำระเงิน"
                  icon={BarChart3}
                  href="/reports/sales"
                  iconColor="text-green-600"
                  iconBg="bg-green-100"
                />
                <ReportCard
                  title="รายงานสินค้าคงคลัง"
                  description="ตรวจสอบสินค้าคงคลัง มูลค่า และสถานะสินค้า"
                  icon={Package}
                  href="/reports/inventory"
                  iconColor="text-blue-600"
                  iconBg="bg-blue-100"
                />
                <ReportCard
                  title="รายงานลูกค้า"
                  description="ดูข้อมูลลูกค้า ลูกค้าใหม่ และลูกค้าที่ซื้อมากที่สุด"
                  icon={Users}
                  href="/reports/customers"
                  iconColor="text-purple-600"
                  iconBg="bg-purple-100"
                />
                <ReportCard
                  title="รายงานขายฝาก"
                  description="ตรวจสอบสัญญาขายฝาก สถานะ และสัญญาที่ใกล้หมดอายุ"
                  icon={FileSignature}
                  href="/reports/pawn"
                  iconColor="text-orange-600"
                  iconBg="bg-orange-100"
                />
                <ReportCard
                  title="รายงานออมทอง"
                  description="ดูข้อมูลบัญชีออมทอง ยอดเงินรวม และบัญชีที่ใกล้ถึงเป้าหมาย"
                  icon={PiggyBank}
                  href="/reports/gold-savings"
                  iconColor="text-amber-600"
                  iconBg="bg-amber-100"
                />
              </div>
            </div>

            {/* Daily Sales Summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  สรุปยอดขายรายวัน
                </h3>
                <ExportButton
                  data={dailySales}
                  filename={`sales-daily-${startDate}-${endDate}`}
                  columns={[
                    { key: 'date', label: 'วันที่' },
                    { key: 'count', label: 'จำนวนบิล' },
                    { key: 'totalSales', label: 'ยอดขาย' },
                    { key: 'totalDiscount', label: 'ส่วนลด' },
                    { key: 'totalTradeIn', label: 'เทิร์นทอง' },
                    { key: 'totalVat', label: 'VAT' },
                    { key: 'totalNet', label: 'ยอดสุทธิ' }
                  ]}
                />
              </div>
              
              {dailySales.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th className="text-right">จำนวนบิล</th>
                        <th className="text-right">ยอดขาย</th>
                        <th className="text-right">ส่วนลด</th>
                        <th className="text-right">เทิร์นทอง</th>
                        <th className="text-right">VAT</th>
                        <th className="text-right">ยอดสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailySales.map((day, idx) => (
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
                          <td className="text-right font-medium">
                            {formatCurrency(day.totalSales)}
                          </td>
                          <td className="text-right text-red-600">
                            -{formatCurrency(day.totalDiscount)}
                          </td>
                          <td className="text-right text-red-600">
                            -{formatCurrency(day.totalTradeIn)}
                          </td>
                          <td className="text-right text-green-600">
                            +{formatCurrency(day.totalVat)}
                          </td>
                          <td className="text-right font-bold text-primary-700">
                            {formatCurrency(day.totalNet)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-primary-50 font-semibold">
                        <td>รวม</td>
                        <td className="text-right">{salesSummary.transactionCount}</td>
                        <td className="text-right">
                          {formatCurrency(salesSummary.totalSales)}
                        </td>
                        <td className="text-right text-red-600">
                          -{formatCurrency(salesSummary.totalDiscount)}
                        </td>
                        <td className="text-right text-red-600">
                          -{formatCurrency(salesSummary.totalTradeIn)}
                        </td>
                        <td className="text-right text-green-600">
                          +{formatCurrency(salesSummary.totalVat)}
                        </td>
                        <td className="text-right text-primary-700">
                          {formatCurrency(salesSummary.totalNet)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ไม่มีข้อมูลการขายในช่วงเวลานี้
                </div>
              )}
            </div>

            {/* Top Selling Products */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  สินค้าขายดี Top 10
                </h3>
                <ExportButton
                  data={topProducts}
                  filename={`top-products-${startDate}-${endDate}`}
                  columns={[
                    { key: 'productCode', label: 'รหัสสินค้า' },
                    { key: 'productName', label: 'ชื่อสินค้า' },
                    { key: 'productType', label: 'ประเภท' },
                    { key: 'quantitySold', label: 'จำนวนที่ขาย' },
                    { key: 'totalRevenue', label: 'รายได้รวม' }
                  ]}
                />
              </div>
              
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {product.productName}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {product.productCode} • ขายได้ {product.quantitySold} ชิ้น
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-700">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                        <p className="text-sm text-neutral-600">
                          เฉลี่ย {formatCurrency(product.totalRevenue / product.quantitySold)}/ชิ้น
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ไม่มีข้อมูลสินค้าในช่วงเวลานี้
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

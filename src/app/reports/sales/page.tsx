'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Percent,
  Tag,
  Receipt,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import KPICard from '@/components/Reports/KPICard'
import SalesChart from '@/components/Reports/SalesChart'
import PaymentPieChart from '@/components/Reports/PaymentPieChart'
import ExportButton from '@/components/Reports/ExportButton'

export default function SalesReportPage() {
  const {
    loading,
    startDate,
    endDate,
    updateDateRange,
    salesSummary,
    dailySales,
    topProducts,
    paymentBreakdown
  } = useReports()

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
              รายงานยอดขาย
            </h1>
            <p className="text-neutral-600">
              รายละเอียดยอดขาย สินค้าขายดี และช่องทางการชำระเงิน
            </p>
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

        {/* Content */}
        {!loading && salesSummary && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KPICard
                title="ยอดขายรวม"
                value={formatCurrency(salesSummary.totalNet)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
              />
              <KPICard
                title="จำนวนบิล"
                value={salesSummary.transactionCount}
                icon={Receipt}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
              />
              <KPICard
                title="ยอดเฉลี่ย/บิล"
                value={formatCurrency(salesSummary.avgPerTransaction)}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                iconBg="bg-purple-600"
              />
              <KPICard
                title="ส่วนลดรวม"
                value={formatCurrency(salesSummary.totalDiscount)}
                icon={Tag}
                gradient="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                iconBg="bg-red-600"
              />
              <KPICard
                title="เทิร์นทองรวม"
                value={formatCurrency(salesSummary.totalTradeIn)}
                icon={ShoppingCart}
                gradient="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                iconBg="bg-orange-600"
              />
              <KPICard
                title="VAT รวม"
                value={formatCurrency(salesSummary.totalVat)}
                icon={Percent}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
              />
            </div>

            {/* Sales Chart */}
            <SalesChart data={dailySales} title="แนวโน้มยอดขายรายวัน" />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Method Breakdown */}
              <PaymentPieChart data={paymentBreakdown} />

              {/* Top Products Summary Card */}
              <div className="card">
                <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                  สรุปสินค้าขายดี
                </h3>
                {topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.slice(0, 5).map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-neutral-600">
                            ขาย {product.quantitySold} ชิ้น
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-700 text-sm">
                            {formatCurrency(product.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    ไม่มีข้อมูลสินค้า
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Transactions Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  รายการขายทั้งหมด ({salesSummary.transactionCount} รายการ)
                </h3>
                <ExportButton
                  data={salesSummary.transactions.map((t: any) => ({
                    transaction_code: t.transaction_code,
                    transaction_date: new Date(t.transaction_date).toLocaleString('th-TH'),
                    customer: t.customers ? `${t.customers.first_name} ${t.customers.last_name}` : '-',
                    items_count: t.sales_items?.length || 0,
                    subtotal: t.subtotal,
                    discount: t.discount_amount,
                    trade_in: t.trade_in_amount,
                    vat: t.vat_amount,
                    total: t.total_amount,
                    payment_method: t.payment_method
                  }))}
                  filename={`sales-transactions-${startDate}-${endDate}`}
                  columns={[
                    { key: 'transaction_code', label: 'เลขที่บิล' },
                    { key: 'transaction_date', label: 'วันที่-เวลา' },
                    { key: 'customer', label: 'ลูกค้า' },
                    { key: 'items_count', label: 'จำนวนสินค้า' },
                    { key: 'subtotal', label: 'ยอดรวม' },
                    { key: 'discount', label: 'ส่วนลด' },
                    { key: 'trade_in', label: 'เทิร์นทอง' },
                    { key: 'vat', label: 'VAT' },
                    { key: 'total', label: 'ยอดสุทธิ' },
                    { key: 'payment_method', label: 'วิธีชำระ' }
                  ]}
                />
              </div>

              {salesSummary.transactions.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>เลขที่บิล</th>
                        <th>วันที่-เวลา</th>
                        <th>ลูกค้า</th>
                        <th className="text-right">จำนวนสินค้า</th>
                        <th className="text-right">ยอดรวม</th>
                        <th className="text-right">ส่วนลด</th>
                        <th className="text-right">เทิร์น</th>
                        <th className="text-right">VAT</th>
                        <th className="text-right">ยอดสุทธิ</th>
                        <th>วิธีชำระ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesSummary.transactions.map((transaction: any) => (
                        <tr key={transaction.id}>
                          <td className="font-medium text-primary-600">
                            {transaction.transaction_code}
                          </td>
                          <td className="text-sm">
                            {new Date(transaction.transaction_date).toLocaleString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="text-sm">
                            {transaction.customers 
                              ? `${transaction.customers.first_name} ${transaction.customers.last_name}`
                              : '-'
                            }
                          </td>
                          <td className="text-right">
                            {transaction.sales_items?.length || 0}
                          </td>
                          <td className="text-right font-medium">
                            {formatCurrency(transaction.subtotal)}
                          </td>
                          <td className="text-right text-red-600">
                            {transaction.discount_amount > 0 
                              ? `-${formatCurrency(transaction.discount_amount)}`
                              : '-'
                            }
                          </td>
                          <td className="text-right text-red-600">
                            {transaction.trade_in_amount > 0
                              ? `-${formatCurrency(transaction.trade_in_amount)}`
                              : '-'
                            }
                          </td>
                          <td className="text-right text-green-600">
                            {transaction.vat_amount > 0
                              ? `+${formatCurrency(transaction.vat_amount)}`
                              : '-'
                            }
                          </td>
                          <td className="text-right font-bold text-primary-700">
                            {formatCurrency(transaction.total_amount)}
                          </td>
                          <td>
                            <span className="badge badge-primary">
                              {transaction.payment_method === 'cash' && 'เงินสด'}
                              {transaction.payment_method === 'transfer' && 'โอนเงิน'}
                              {transaction.payment_method === 'card' && 'บัตร'}
                              {transaction.payment_method === 'mixed' && 'ผสม'}
                              {transaction.payment_method === 'gold_credit' && 'ออมทอง'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ไม่มีข้อมูลการขายในช่วงเวลานี้
                </div>
              )}
            </div>

            {/* Top 10 Products Detail */}
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
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="w-16">อันดับ</th>
                        <th>รหัสสินค้า</th>
                        <th>ชื่อสินค้า</th>
                        <th>ประเภท</th>
                        <th className="text-right">จำนวนที่ขาย</th>
                        <th className="text-right">รายได้รวม</th>
                        <th className="text-right">ราคาเฉลี่ย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, idx) => (
                        <tr key={idx}>
                          <td className="text-center">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold mx-auto">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="font-medium text-neutral-600">
                            {product.productCode}
                          </td>
                          <td className="font-medium">{product.productName}</td>
                          <td>
                            <span className="badge badge-outline">
                              {product.productType}
                            </span>
                          </td>
                          <td className="text-right font-medium">
                            {product.quantitySold} ชิ้น
                          </td>
                          <td className="text-right font-semibold text-primary-700">
                            {formatCurrency(product.totalRevenue)}
                          </td>
                          <td className="text-right text-neutral-600">
                            {formatCurrency(product.totalRevenue / product.quantitySold)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

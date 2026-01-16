'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { 
  Users, 
  UserPlus, 
  TrendingUp,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import KPICard from '@/components/Reports/KPICard'
import ExportButton from '@/components/Reports/ExportButton'

export default function CustomersReportPage() {
  const {
    loading,
    startDate,
    endDate,
    updateDateRange,
    loadCustomerReport,
    loadTopCustomers,
    loadNewCustomers
  } = useReports()

  const [customerReport, setCustomerReport] = useState<any>(null)
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [newCustomers, setNewCustomers] = useState<any[]>([])

  useEffect(() => {
    if (startDate && endDate) {
      loadData()
    }
  }, [startDate, endDate])

  const loadData = async () => {
    const [report, top, newCust] = await Promise.all([
      loadCustomerReport(),
      loadTopCustomers(10),
      loadNewCustomers()
    ])
    setCustomerReport(report)
    setTopCustomers(top)
    setNewCustomers(newCust)
  }

  // Calculate customer stats
  const customersWithPurchases = customerReport?.customers?.map((c: any) => ({
    ...c,
    purchaseCount: c.sales_transactions?.length || 0,
    totalSpent: c.sales_transactions?.reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0) || 0
  })) || []

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
              รายงานลูกค้า
            </h1>
            <p className="text-neutral-600">
              ดูข้อมูลลูกค้า ลูกค้าใหม่ และลูกค้าที่ซื้อมากที่สุด
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
        {!loading && customerReport && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                title="ลูกค้าทั้งหมด"
                value={customerReport.totalCustomers}
                icon={Users}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
                subtitle="คนในระบบ"
              />
              <KPICard
                title="ลูกค้าใหม่"
                value={newCustomers.length}
                icon={UserPlus}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
                subtitle={`ในช่วง ${startDate} - ${endDate}`}
              />
              <KPICard
                title="ลูกค้า VIP"
                value={topCustomers.length}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
                subtitle="Top 10 ซื้อมากที่สุด"
              />
            </div>

            {/* Top Customers */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  ลูกค้าที่ซื้อมากที่สุด Top 10
                </h3>
                <ExportButton
                  data={topCustomers}
                  filename={`top-customers-${startDate}-${endDate}`}
                  columns={[
                    { key: 'customerName', label: 'ชื่อลูกค้า' },
                    { key: 'phoneNumber', label: 'เบอร์โทร' },
                    { key: 'purchaseCount', label: 'จำนวนซื้อ' },
                    { key: 'totalSpent', label: 'ยอดซื้อรวม' }
                  ]}
                />
              </div>

              {topCustomers.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="w-16">อันดับ</th>
                        <th>ชื่อลูกค้า</th>
                        <th>เบอร์โทร</th>
                        <th className="text-right">จำนวนซื้อ</th>
                        <th className="text-right">ยอดซื้อรวม</th>
                        <th className="text-right">ยอดเฉลี่ย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((customer, idx) => (
                        <tr key={idx}>
                          <td className="text-center">
                            <div className={`w-8 h-8 rounded-lg ${
                              idx === 0 ? 'bg-yellow-500' :
                              idx === 1 ? 'bg-neutral-400' :
                              idx === 2 ? 'bg-orange-600' :
                              'bg-primary-600'
                            } text-white flex items-center justify-center font-bold mx-auto`}>
                              {idx + 1}
                            </div>
                          </td>
                          <td className="font-medium">{customer.customerName}</td>
                          <td>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Phone size={14} />
                              {customer.phoneNumber || '-'}
                            </div>
                          </td>
                          <td className="text-right font-medium">
                            {customer.purchaseCount} ครั้ง
                          </td>
                          <td className="text-right font-semibold text-primary-700">
                            {formatCurrency(customer.totalSpent)}
                          </td>
                          <td className="text-right text-neutral-600">
                            {formatCurrency(customer.totalSpent / customer.purchaseCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ไม่มีข้อมูลการซื้อในช่วงเวลานี้
                </div>
              )}
            </div>

            {/* New Customers */}
            {newCustomers.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display font-semibold text-neutral-800">
                    ลูกค้าใหม่ ({newCustomers.length} คน)
                  </h3>
                  <ExportButton
                    data={newCustomers.map((c: any) => ({
                      customer_code: c.customer_code,
                      name: `${c.first_name} ${c.last_name}`,
                      phone: c.phone,
                      email: c.email,
                      created_at: new Date(c.created_at).toLocaleDateString('th-TH')
                    }))}
                    filename={`new-customers-${startDate}-${endDate}`}
                    columns={[
                      { key: 'customer_code', label: 'รหัสลูกค้า' },
                      { key: 'name', label: 'ชื่อ-นามสกุล' },
                      { key: 'phone', label: 'เบอร์โทร' },
                      { key: 'email', label: 'อีเมล' },
                      { key: 'created_at', label: 'วันที่สมัคร' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newCustomers.map((customer: any) => (
                    <div key={customer.id} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-sm text-neutral-600">{customer.customer_code}</p>
                        </div>
                        <span className="badge bg-green-100 text-green-700 border-green-200 text-xs">
                          ใหม่
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2 text-neutral-600">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        )}
                        <p className="text-neutral-500 text-xs mt-2">
                          สมัคร: {new Date(customer.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Customers */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  ลูกค้าทั้งหมด ({customersWithPurchases.length} คน)
                </h3>
                <ExportButton
                  data={customersWithPurchases.map((c: any) => ({
                    customer_code: c.customer_code,
                    name: `${c.first_name} ${c.last_name}`,
                    phone: c.phone,
                    email: c.email,
                    purchase_count: c.purchaseCount,
                    total_spent: c.totalSpent,
                    created_at: new Date(c.created_at).toLocaleDateString('th-TH')
                  }))}
                  filename={`all-customers-${new Date().toISOString().split('T')[0]}`}
                  columns={[
                    { key: 'customer_code', label: 'รหัสลูกค้า' },
                    { key: 'name', label: 'ชื่อ-นามสกุล' },
                    { key: 'phone', label: 'เบอร์โทร' },
                    { key: 'email', label: 'อีเมล' },
                    { key: 'purchase_count', label: 'จำนวนซื้อ' },
                    { key: 'total_spent', label: 'ยอดซื้อสะสม' },
                    { key: 'created_at', label: 'วันที่สมัคร' }
                  ]}
                />
              </div>

              {customersWithPurchases.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>รหัสลูกค้า</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>เบอร์โทร</th>
                        <th>อีเมล</th>
                        <th className="text-right">จำนวนซื้อ</th>
                        <th className="text-right">ยอดซื้อสะสม</th>
                        <th>วันที่สมัคร</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersWithPurchases
                        .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
                        .map((customer: any) => (
                        <tr key={customer.id}>
                          <td className="font-medium text-primary-600">
                            {customer.customer_code}
                          </td>
                          <td className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </td>
                          <td className="text-sm">{customer.phone || '-'}</td>
                          <td className="text-sm">{customer.email || '-'}</td>
                          <td className="text-right">
                            {customer.purchaseCount > 0 ? (
                              <span className="badge badge-primary">
                                {customer.purchaseCount} ครั้ง
                              </span>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>
                          <td className="text-right font-semibold text-primary-700">
                            {customer.totalSpent > 0 ? formatCurrency(customer.totalSpent) : '-'}
                          </td>
                          <td className="text-sm">
                            {new Date(customer.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  ยังไม่มีลูกค้าในระบบ
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

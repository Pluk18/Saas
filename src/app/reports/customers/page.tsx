'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  ArrowLeft,
  Users,
  UserPlus,
  TrendingUp,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'
import KPICard from '@/components/Reports/KPICard'
import DateRangePicker from '@/components/Reports/DateRangePicker'
import ExportButton from '@/components/Reports/ExportButton'
import { getCustomerReport, getTopCustomers, getNewCustomers } from '@/lib/supabaseAPI'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CustomersReportPage() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [newCustomers, setNewCustomers] = useState<any[]>([])

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setDate(today.getDate() - 30)
    setStartDate(monthAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    loadAllCustomers()
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      loadDateRangeData()
    }
  }, [startDate, endDate])

  const loadAllCustomers = async () => {
    try {
      const data = await getCustomerReport()
      setCustomers(data)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้')
    }
  }

  const loadDateRangeData = async () => {
    try {
      setLoading(true)
      const [topCust, newCust] = await Promise.all([
        getTopCustomers(startDate, endDate, 10),
        getNewCustomers(startDate, endDate)
      ])
      setTopCustomers(topCust)
      setNewCustomers(newCust)
    } catch (error) {
      console.error('Error loading customer report:', error)
      toast.error('ไม่สามารถโหลดรายงานลูกค้าได้')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const exportTopCustomersData = topCustomers.map((c, i) => ({
    'อันดับ': i + 1,
    'ชื่อลูกค้า': c.customerName,
    'เบอร์โทร': c.phoneNumber,
    'จำนวนซื้อ (ครั้ง)': c.purchaseCount,
    'ยอดซื้อรวม': c.totalAmount,
    'ยอดเฉลี่ย': c.totalAmount / c.purchaseCount
  }))

  const exportNewCustomersData = newCustomers.map(c => ({
    'ชื่อลูกค้า': c.customer_name,
    'เบอร์โทร': c.phone_number,
    'อีเมล': c.email || '-',
    'วันที่สมัคร': new Date(c.created_at).toLocaleDateString('th-TH')
  }))

  // Calculate total purchase amount for all customers
  const totalCustomerPurchases = customers.reduce((sum, c) => {
    const customerTotal = c.sales_transactions?.reduce((t: number, s: any) => t + (s.total_amount || 0), 0) || 0
    return sum + customerTotal
  }, 0)

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
                รายงานลูกค้า
              </h1>
              <p className="text-neutral-600">
                วิเคราะห์ลูกค้า ลูกค้าที่ซื้อมากที่สุด และลูกค้าใหม่
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="ลูกค้าทั้งหมด"
              value={customers.length}
              icon={Users}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="number"
            />
            <KPICard
              title="ลูกค้าใหม่"
              value={newCustomers.length}
              icon={UserPlus}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="number"
            />
            <KPICard
              title="ลูกค้าซื้อมากสุด"
              value={topCustomers.length > 0 ? topCustomers[0]?.purchaseCount || 0 : 0}
              icon={TrendingUp}
              colorClass="from-primary-50 to-primary-100 border-primary-200"
              format="number"
            />
            <KPICard
              title="ยอดซื้อรวมทั้งหมด"
              value={totalCustomerPurchases}
              icon={ShoppingBag}
              colorClass="from-accent-50 to-accent-100 border-accent-200"
              format="currency"
            />
          </div>
        )}

        {/* Top Customers */}
        {!loading && topCustomers.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                ลูกค้าซื้อมากที่สุด Top 10
              </h3>
              <ExportButton
                data={exportTopCustomersData}
                filename={`top-customers-${startDate}-${endDate}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>อันดับ</th>
                    <th>ชื่อลูกค้า</th>
                    <th>เบอร์โทร</th>
                    <th className="text-right">จำนวนซื้อ</th>
                    <th className="text-right">ยอดซื้อรวม</th>
                    <th className="text-right">ยอดเฉลี่ย/ครั้ง</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                      </td>
                      <td className="font-medium">{customer.customerName}</td>
                      <td className="text-neutral-600">{customer.phoneNumber}</td>
                      <td className="text-right">{customer.purchaseCount} ครั้ง</td>
                      <td className="text-right font-medium text-primary-700">
                        {formatCurrency(customer.totalAmount)}
                      </td>
                      <td className="text-right text-neutral-600">
                        {formatCurrency(customer.totalAmount / customer.purchaseCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* New Customers */}
        {!loading && newCustomers.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                ลูกค้าใหม่ ({newCustomers.length} ราย)
              </h3>
              <ExportButton
                data={exportNewCustomersData}
                filename={`new-customers-${startDate}-${endDate}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ชื่อลูกค้า</th>
                    <th>เบอร์โทร</th>
                    <th>อีเมล</th>
                    <th>วันที่สมัคร</th>
                  </tr>
                </thead>
                <tbody>
                  {newCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td className="font-medium">{customer.customer_name}</td>
                      <td className="text-neutral-600">{customer.phone_number}</td>
                      <td className="text-neutral-600">{customer.email || '-'}</td>
                      <td className="text-neutral-600">
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
          </div>
        )}

        {/* Empty State */}
        {!loading && topCustomers.length === 0 && newCustomers.length === 0 && (
          <div className="card text-center py-12">
            <Users size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              ไม่มีข้อมูลลูกค้า
            </h3>
            <p className="text-neutral-600">
              ไม่พบข้อมูลลูกค้าในช่วงเวลาที่เลือก
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

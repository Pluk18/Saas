'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { 
  Package, 
  DollarSign, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatWeight } from '@/lib/utils'
import { getInventoryReport } from '@/lib/supabaseAPI'
import KPICard from '@/components/Reports/KPICard'
import StatusPieChart from '@/components/Reports/StatusPieChart'
import ExportButton from '@/components/Reports/ExportButton'

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const data = await getInventoryReport()
      setInventory(data)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  const filteredProducts = inventory?.products?.filter((p: any) => {
    const categoryMatch = categoryFilter === 'all' || p.product_type === categoryFilter
    const statusMatch = statusFilter === 'all' || p.status === statusFilter
    return categoryMatch && statusMatch
  }) || []

  // Calculate category breakdown
  const categoryBreakdown = inventory?.products?.reduce((acc: any, p: any) => {
    const category = p.product_type || 'อื่นๆ'
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 }
    }
    acc[category].count++
    acc[category].value += p.selling_price || 0
    return acc
  }, {}) || {}

  // Calculate status distribution
  const statusDistribution = inventory?.products?.reduce((acc: any, p: any) => {
    const existing = acc.find((item: any) => item.status === p.status)
    if (existing) {
      existing.count++
    } else {
      acc.push({ status: p.status, count: 1 })
    }
    return acc
  }, []) || []

  // Get unique categories
  const categories = [...new Set(inventory?.products?.map((p: any) => p.product_type) || [])]

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
              รายงานสินค้าคงคลัง
            </h1>
            <p className="text-neutral-600">
              ตรวจสอบสินค้าคงคลัง มูลค่า และสถานะสินค้า
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
        {!loading && inventory && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title="มูลค่ารวม"
                value={formatCurrency(inventory.totalValue)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                iconBg="bg-green-600"
              />
              <KPICard
                title="สินค้าทั้งหมด"
                value={`${inventory.totalProducts} ชิ้น`}
                icon={Package}
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                iconBg="bg-blue-600"
              />
              <KPICard
                title="พร้อมขาย"
                value={`${inventory.availableProducts} ชิ้น`}
                icon={CheckCircle}
                gradient="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
                iconBg="bg-primary-600"
              />
              <KPICard
                title="ขายแล้ว"
                value={`${inventory.soldProducts} ชิ้น`}
                icon={XCircle}
                gradient="bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200"
                iconBg="bg-neutral-600"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <StatusPieChart data={statusDistribution} />

              {/* Category Breakdown */}
              <div className="card">
                <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                  แยกตามประเภท
                </h3>
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">{category}</p>
                        <p className="text-sm text-neutral-600">{data.count} ชิ้น</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-700">
                          {formatCurrency(data.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {Object.keys(categoryBreakdown).length === 0 && (
                    <div className="text-center py-8 text-neutral-500">
                      ไม่มีข้อมูล
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="flex flex-wrap gap-4 items-center">
                <Filter size={20} className="text-neutral-600" />
                <div className="flex-1 min-w-[200px]">
                  <label className="label">ประเภทสินค้า</label>
                  <select
                    className="input"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    {categories.map((cat: any) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="label">สถานะ</label>
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="available">พร้อมขาย</option>
                    <option value="sold">ขายแล้ว</option>
                    <option value="reserved">จอง</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  รายการสินค้าทั้งหมด ({filteredProducts.length} ชิ้น)
                </h3>
                <ExportButton
                  data={filteredProducts.map((p: any) => ({
                    product_code: p.product_code,
                    product_name: p.product_name,
                    product_type: p.product_type,
                    weight_baht: p.weight_baht,
                    selling_price: p.selling_price,
                    status: p.status,
                    created_at: new Date(p.created_at).toLocaleDateString('th-TH')
                  }))}
                  filename={`inventory-${new Date().toISOString().split('T')[0]}`}
                  columns={[
                    { key: 'product_code', label: 'รหัสสินค้า' },
                    { key: 'product_name', label: 'ชื่อสินค้า' },
                    { key: 'product_type', label: 'ประเภท' },
                    { key: 'weight_baht', label: 'น้ำหนัก (บาท)' },
                    { key: 'selling_price', label: 'ราคาขาย' },
                    { key: 'status', label: 'สถานะ' },
                    { key: 'created_at', label: 'วันที่เพิ่ม' }
                  ]}
                />
              </div>

              {filteredProducts.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>รหัสสินค้า</th>
                        <th>ชื่อสินค้า</th>
                        <th>ประเภท</th>
                        <th className="text-right">น้ำหนัก</th>
                        <th className="text-right">ราคาขาย</th>
                        <th>สถานะ</th>
                        <th>วันที่เพิ่ม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product: any) => (
                        <tr key={product.id}>
                          <td className="font-medium text-primary-600">
                            {product.product_code}
                          </td>
                          <td>{product.product_name}</td>
                          <td>
                            <span className="badge badge-outline">
                              {product.product_type}
                            </span>
                          </td>
                          <td className="text-right">
                            {formatWeight(product.weight_baht)}
                          </td>
                          <td className="text-right font-semibold text-primary-700">
                            {formatCurrency(product.selling_price)}
                          </td>
                          <td>
                            {product.status === 'available' && (
                              <span className="badge bg-green-100 text-green-700 border-green-200">
                                พร้อมขาย
                              </span>
                            )}
                            {product.status === 'sold' && (
                              <span className="badge bg-neutral-100 text-neutral-700 border-neutral-200">
                                ขายแล้ว
                              </span>
                            )}
                            {product.status === 'reserved' && (
                              <span className="badge bg-orange-100 text-orange-700 border-orange-200">
                                จอง
                              </span>
                            )}
                          </td>
                          <td className="text-sm">
                            {new Date(product.created_at).toLocaleDateString('th-TH', {
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
                  ไม่มีสินค้าที่ตรงกับเงื่อนไข
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

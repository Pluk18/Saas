'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import {
  ArrowLeft,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import KPICard from '@/components/Reports/KPICard'
import ExportButton from '@/components/Reports/ExportButton'
import { getInventoryReport, getInventorySummary } from '@/lib/supabaseAPI'
import { formatCurrency, formatWeight } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [inventoryData, summaryData] = await Promise.all([
        getInventoryReport(),
        getInventorySummary()
      ])
      setInventory(inventoryData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading inventory report:', error)
      toast.error('ไม่สามารถโหลดรายงานสินค้าคงคลังได้')
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = inventory.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    if (filterCategory !== 'all' && item.product_type !== filterCategory) return false
    return true
  })

  const exportData = filteredInventory.map(item => ({
    'รหัสสินค้า': item.product_code,
    'ชื่อสินค้า': item.product_name,
    'ประเภท': item.product_type === 'ring' ? 'แหวน' :
             item.product_type === 'necklace' ? 'สร้อยคอ' :
             item.product_type === 'bracelet' ? 'กำไล' :
             item.product_type === 'earring' ? 'ต่างหู' :
             item.product_type === 'amulet' ? 'พระ/จี้' : 'อื่นๆ',
    'น้ำหนัก (กรัม)': item.weight_grams,
    'ค่าแรง': item.labor_cost,
    'ราคาขาย': item.sale_price,
    'สถานะ': item.status === 'available' ? 'พร้อมขาย' : 'ขายแล้ว'
  }))

  const categories = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'ring', label: 'แหวน' },
    { value: 'necklace', label: 'สร้อยคอ' },
    { value: 'bracelet', label: 'กำไล' },
    { value: 'earring', label: 'ต่างหู' },
    { value: 'amulet', label: 'พระ/จี้' },
    { value: 'other', label: 'อื่นๆ' }
  ]

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
                รายงานสินค้าคงคลัง
              </h1>
              <p className="text-neutral-600">
                ตรวจสอบสินค้าคงคลัง มูลค่าสินค้า และสินค้าที่ขายแล้ว
              </p>
            </div>
          </div>
        </div>

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
              title="มูลค่าสินค้าคงคลัง"
              value={summary.totalValue}
              icon={DollarSign}
              colorClass="from-green-50 to-green-100 border-green-200"
              format="currency"
            />
            <KPICard
              title="สินค้าทั้งหมด"
              value={summary.totalProducts}
              icon={Package}
              colorClass="from-blue-50 to-blue-100 border-blue-200"
              format="number"
            />
            <KPICard
              title="พร้อมขาย"
              value={summary.availableProducts}
              icon={CheckCircle}
              colorClass="from-primary-50 to-primary-100 border-primary-200"
              format="number"
            />
            <KPICard
              title="ขายแล้ว"
              value={summary.soldProducts}
              icon={XCircle}
              colorClass="from-accent-50 to-accent-100 border-accent-200"
              format="number"
            />
          </div>
        ) : null}

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="label">ประเภทสินค้า</label>
              <select
                className="input"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">สถานะ</label>
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="available">พร้อมขาย</option>
                <option value="sold">ขายแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        {!loading && filteredInventory.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-neutral-800">
                รายการสินค้า ({filteredInventory.length} รายการ)
              </h3>
              <ExportButton
                data={exportData}
                filename={`inventory-report-${new Date().toISOString().split('T')[0]}`}
              />
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>รหัสสินค้า</th>
                    <th>ชื่อสินค้า</th>
                    <th>ประเภท</th>
                    <th className="text-right">น้ำหนัก</th>
                    <th className="text-right">ค่าแรง</th>
                    <th className="text-right">ราคาขาย</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.product_id}>
                      <td className="font-medium">{item.product_code}</td>
                      <td>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.pattern_name && (
                            <p className="text-sm text-neutral-600">{item.pattern_name}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                          {item.product_type === 'ring' && 'แหวน'}
                          {item.product_type === 'necklace' && 'สร้อยคอ'}
                          {item.product_type === 'bracelet' && 'กำไล'}
                          {item.product_type === 'earring' && 'ต่างหู'}
                          {item.product_type === 'amulet' && 'พระ/จี้'}
                          {item.product_type === 'other' && 'อื่นๆ'}
                        </span>
                      </td>
                      <td className="text-right">
                        {formatWeight(item.weight_grams)} กรัม
                      </td>
                      <td className="text-right">{formatCurrency(item.labor_cost)}</td>
                      <td className="text-right font-medium text-primary-700">
                        {formatCurrency(item.sale_price)}
                      </td>
                      <td>
                        {item.status === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            <CheckCircle size={14} />
                            พร้อมขาย
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-700">
                            <XCircle size={14} />
                            ขายแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInventory.length === 0 && (
          <div className="card text-center py-12">
            <Package size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              ไม่มีสินค้า
            </h3>
            <p className="text-neutral-600">
              ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

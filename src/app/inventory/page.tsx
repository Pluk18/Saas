'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock data
  const categories = [
    { id: 'all', name: 'ทั้งหมด', count: 245 },
    { id: 'ring', name: 'แหวน', count: 85 },
    { id: 'necklace', name: 'สร้อยคอ', count: 65 },
    { id: 'bracelet', name: 'กำไล', count: 45 },
    { id: 'earring', name: 'ต่างหู', count: 30 },
    { id: 'pendant', name: 'จี้', count: 20 },
  ]

  const products = [
    {
      id: '1',
      code: 'RING-001',
      name: 'แหวนทองคำ ลายฉลุ',
      category: 'แหวน',
      weight: 0.5,
      weightGrams: 7.622,
      pattern: 'ลายไทย',
      laborCost: 2500,
      goldPrice: 19400,
      sellingPrice: 21900,
      stock: 3,
      status: 'available',
    },
    {
      id: '2',
      code: 'NECK-001',
      name: 'สร้อยคอทอง 2 สลึง',
      category: 'สร้อยคอ',
      weight: 2.0,
      weightGrams: 30.488,
      pattern: 'ลายเกลียว',
      laborCost: 8000,
      goldPrice: 77600,
      sellingPrice: 85600,
      stock: 1,
      status: 'available',
    },
    {
      id: '3',
      code: 'BRAC-001',
      name: 'กำไลทอง 1 บาท',
      category: 'กำไล',
      weight: 1.0,
      weightGrams: 15.244,
      pattern: 'ลายดอกไม้',
      laborCost: 5000,
      goldPrice: 38800,
      sellingPrice: 43800,
      stock: 2,
      status: 'available',
    },
  ]

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0)
  const totalWeight = products.reduce((sum, p) => sum + (p.weight * p.stock), 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              คลังสินค้า
            </h1>
            <p className="text-neutral-600">จัดการสินค้าทองคำในร้าน</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline flex items-center gap-2">
              <Download size={18} />
              ส่งออกข้อมูล
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus size={18} />
              เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">245</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent-600 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">น้ำหนักรวม</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {formatNumber(totalWeight, 2)} บาท
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">มูลค่าคงคลัง</p>
                <p className="text-2xl font-bold text-green-700 font-display">
                  {formatCurrency(totalInventoryValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหารหัสสินค้า, ชื่อสินค้า, ลาย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            <button className="btn btn-outline flex items-center gap-2">
              <Filter size={18} />
              ตัวกรองเพิ่มเติม
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>รหัสสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>หมวดหมู่</th>
                  <th className="text-right">น้ำหนัก (บาท)</th>
                  <th className="text-right">ราคาทอง</th>
                  <th className="text-right">ค่ากำเหน็จ</th>
                  <th className="text-right">ราคาขาย</th>
                  <th className="text-center">คงเหลือ</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-mono font-medium text-primary-700">
                      {product.code}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.pattern}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{product.category}</span>
                    </td>
                    <td className="text-right">
                      <div>
                        <p className="font-medium">{formatNumber(product.weight, 2)} บาท</p>
                        <p className="text-xs text-neutral-500">
                          ({formatNumber(product.weightGrams, 3)} กรัม)
                        </p>
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(product.goldPrice)}
                    </td>
                    <td className="text-right font-medium text-accent-700">
                      {formatCurrency(product.laborCost)}
                    </td>
                    <td className="text-right font-bold text-primary-700">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        product.stock > 2 ? 'badge-success' : 
                        product.stock > 0 ? 'badge-warning' : 
                        'badge-danger'
                      }`}>
                        {product.stock} ชิ้น
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success">
                        พร้อมขาย
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
            <p className="text-sm text-neutral-600">
              แสดง 1-3 จาก 245 รายการ
            </p>
            <div className="flex gap-2">
              <button className="btn btn-secondary" disabled>
                ← ก่อนหน้า
              </button>
              <button className="btn btn-primary">
                ถัดไป →
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import ProductModal from '@/components/Inventory/ProductModal'
import DeleteConfirmModal from '@/components/Inventory/DeleteConfirmModal'
import { useProducts } from '@/hooks/useProducts'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)

  const { products, loading, addProduct, editProduct, removeProduct } = useProducts({
    category: selectedCategory,
    search: searchQuery
  })

  // Mock categories - จะดึงจาก database ในภายหลัง
  const categories = [
    { id: 'all', name: 'ทั้งหมด', count: products.length },
    { id: 'ring', name: 'แหวน', count: products.filter(p => p.product_type === 'ring').length },
    { id: 'necklace', name: 'สร้อยคอ', count: products.filter(p => p.product_type === 'necklace').length },
    { id: 'bracelet', name: 'กำไล', count: products.filter(p => p.product_type === 'bracelet').length },
    { id: 'earring', name: 'ต่างหู', count: products.filter(p => p.product_type === 'earring').length },
    { id: 'pendant', name: 'จี้', count: products.filter(p => p.product_type === 'pendant').length },
  ]

  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.selling_price || 0) * p.stock_quantity), 0)
  const totalWeight = products.reduce((sum, p) => sum + (p.weight_baht * p.stock_quantity), 0)

  const handleAddProduct = () => {
    setModalMode('create')
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setModalMode('edit')
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await removeProduct(productToDelete.id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleSaveProduct = async (productData: any) => {
    if (modalMode === 'create') {
      await addProduct(productData)
    } else if (selectedProduct) {
      await editProduct(selectedProduct.id, productData)
    }
  }

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
            <button 
              onClick={handleAddProduct}
              className="btn btn-primary flex items-center gap-2"
            >
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
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : products.length}
                </p>
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
                  {loading ? '...' : formatNumber(totalWeight, 2)} บาท
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
                  {loading ? '...' : formatCurrency(totalInventoryValue)}
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-600 mb-2">ไม่พบสินค้า</p>
              <button onClick={handleAddProduct} className="btn btn-primary btn-sm">
                เพิ่มสินค้าใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>รหัสสินค้า</th>
                      <th>ชื่อสินค้า</th>
                      <th>หมวดหมู่</th>
                      <th className="text-right">น้ำหนัก (บาท)</th>
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
                          {product.product_code}
                        </td>
                        <td>
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            {product.pattern_name && (
                              <p className="text-xs text-neutral-500">{product.pattern_name}</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">
                            {product.product_categories?.category_name || product.product_type}
                          </span>
                        </td>
                        <td className="text-right">
                          <div>
                            <p className="font-medium">{formatNumber(product.weight_baht, 2)} บาท</p>
                            <p className="text-xs text-neutral-500">
                              ({formatNumber(product.weight_grams, 3)} กรัม)
                            </p>
                          </div>
                        </td>
                        <td className="text-right font-medium text-accent-700">
                          {formatCurrency(product.labor_cost)}
                        </td>
                        <td className="text-right font-bold text-primary-700">
                          {formatCurrency(product.selling_price || 0)}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${
                            product.stock_quantity > 2 ? 'badge-success' : 
                            product.stock_quantity > 0 ? 'badge-warning' : 
                            'badge-danger'
                          }`}>
                            {product.stock_quantity} ชิ้น
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${
                            product.status === 'available' ? 'badge-success' :
                            product.status === 'reserved' ? 'badge-warning' :
                            product.status === 'sold' ? 'badge-neutral' :
                            'badge-info'
                          }`}>
                            {product.status === 'available' ? 'พร้อมขาย' :
                             product.status === 'reserved' ? 'จอง' :
                             product.status === 'sold' ? 'ขายแล้ว' :
                             'ฝากขาย'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(product)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
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
                  แสดง {products.length} รายการ
                </p>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" disabled>
                    ← ก่อนหน้า
                  </button>
                  <button className="btn btn-primary" disabled>
                    ถัดไป →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.product_name || ''}
      />
    </MainLayout>
  )
}

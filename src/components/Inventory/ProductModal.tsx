'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { X } from 'lucide-react'
import { bahtToGrams, gramsToBaht } from '@/lib/utils'
import { getProductCategories } from '@/lib/supabaseAPI'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: any) => Promise<void>
  product?: any
  mode: 'create' | 'edit'
}

export default function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    product_code: '',
    category_id: '',
    product_name: '',
    product_type: '',
    gold_percentage: 96.5,
    weight_baht: 0,
    weight_grams: 0,
    pattern_code: '',
    pattern_name: '',
    labor_cost: 0,
    gem_cost: 0,
    other_cost: 0,
    selling_price: 0,
    cost_price: 0,
    stock_quantity: 1,
    location: '',
    supplier: '',
    status: 'available',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        product_code: product.product_code || '',
        category_id: product.category_id || '',
        product_name: product.product_name || '',
        product_type: product.product_type || '',
        gold_percentage: product.gold_percentage || 96.5,
        weight_baht: product.weight_baht || 0,
        weight_grams: product.weight_grams || 0,
        pattern_code: product.pattern_code || '',
        pattern_name: product.pattern_name || '',
        labor_cost: product.labor_cost || 0,
        gem_cost: product.gem_cost || 0,
        other_cost: product.other_cost || 0,
        selling_price: product.selling_price || 0,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity || 1,
        location: product.location || '',
        supplier: product.supplier || '',
        status: product.status || 'available',
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        product_code: '',
        category_id: '',
        product_name: '',
        product_type: '',
        gold_percentage: 96.5,
        weight_baht: 0,
        weight_grams: 0,
        pattern_code: '',
        pattern_name: '',
        labor_cost: 0,
        gem_cost: 0,
        other_cost: 0,
        selling_price: 0,
        cost_price: 0,
        stock_quantity: 1,
        location: '',
        supplier: '',
        status: 'available',
      })
    }
  }, [product, mode])

  const fetchCategories = async () => {
    try {
      const data = await getProductCategories()
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculate weight conversions
      if (field === 'weight_baht') {
        const numValue = value === '' ? 0 : Number(value)
        updated.weight_grams = isNaN(numValue) ? 0 : bahtToGrams(numValue)
      } else if (field === 'weight_grams') {
        const numValue = value === '' ? 0 : Number(value)
        updated.weight_baht = isNaN(numValue) ? 0 : gramsToBaht(numValue)
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">รหัสสินค้า *</label>
              <input
                type="text"
                className="input"
                value={formData.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                required
                disabled={mode === 'edit'}
              />
            </div>
            <div>
              <label className="label">หมวดหมู่ *</label>
              <select
                className="input"
                value={formData.category_id}
                onChange={(e) => {
                  handleChange('category_id', e.target.value)
                  const cat = categories.find(c => c.id === e.target.value)
                  if (cat) handleChange('product_type', cat.category_code.toLowerCase())
                }}
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">ชื่อสินค้า *</label>
            <input
              type="text"
              className="input"
              value={formData.product_name}
              onChange={(e) => handleChange('product_name', e.target.value)}
              required
            />
          </div>

          {/* Weight */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">น้ำหนัก (บาท) *</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.weight_baht}
                onChange={(e) => handleChange('weight_baht', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">น้ำหนัก (กรัม)</label>
              <input
                type="number"
                step="0.001"
                className="input"
                value={typeof formData.weight_grams === 'number' && !isNaN(formData.weight_grams) 
                  ? formData.weight_grams.toFixed(3) 
                  : '0.000'}
                onChange={(e) => handleChange('weight_grams', e.target.value)}
              />
            </div>
            <div>
              <label className="label">เปอร์เซ็นต์ทอง</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={formData.gold_percentage}
                onChange={(e) => handleChange('gold_percentage', e.target.value)}
              />
            </div>
          </div>

          {/* Pattern */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">รหัสลาย</label>
              <input
                type="text"
                className="input"
                value={formData.pattern_code}
                onChange={(e) => handleChange('pattern_code', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ชื่อลาย</label>
              <input
                type="text"
                className="input"
                value={formData.pattern_name}
                onChange={(e) => handleChange('pattern_name', e.target.value)}
              />
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">ค่ากำเหน็จ (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.labor_cost}
                onChange={(e) => handleChange('labor_cost', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ค่าพลอย (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.gem_cost}
                onChange={(e) => handleChange('gem_cost', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ค่าใช้จ่ายอื่นๆ (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.other_cost}
                onChange={(e) => handleChange('other_cost', e.target.value)}
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ราคาทุน (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.cost_price}
                onChange={(e) => handleChange('cost_price', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ราคาขาย (บาท)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.selling_price}
                onChange={(e) => handleChange('selling_price', e.target.value)}
              />
            </div>
          </div>

          {/* Other */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">จำนวนสต๊อก</label>
              <input
                type="number"
                className="input"
                value={formData.stock_quantity}
                onChange={(e) => handleChange('stock_quantity', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ตำแหน่ง</label>
              <input
                type="text"
                className="input"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="เช่น ตู้ A ชั้น 1"
              />
            </div>
            <div>
              <label className="label">สถานะ</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="available">พร้อมขาย</option>
                <option value="reserved">จอง</option>
                <option value="sold">ขายแล้ว</option>
                <option value="consignment">ฝากขาย</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">ผู้จัดจำหน่าย/ผู้ผลิต</label>
            <input
              type="text"
              className="input"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : mode === 'create' ? 'เพิ่มสินค้า' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </Modal>
  )
}


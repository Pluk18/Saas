'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { bahtToGrams, gramsToBaht } from '@/lib/utils'
import { useCustomers } from '@/hooks/useCustomers'
import { Calendar, Percent, User, Weight, FileText } from 'lucide-react'

interface ConsignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  consignment?: any
  mode: 'add' | 'edit'
}

export default function ConsignmentModal({
  isOpen,
  onClose,
  consignment,
  onSave,
  mode,
}: ConsignmentModalProps) {
  const { customers } = useCustomers()
  
  const [formData, setFormData] = useState({
    customer_id: '',
    product_description: '',
    weight_baht: 0,
    weight_grams: 0,
    gold_percentage: 96.5,
    principal_amount: 0,
    interest_rate: 1.25,
    interest_type: 'monthly' as 'monthly' | 'daily',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_months: 3,
    notes: '',
    status: 'active' as 'active' | 'extended' | 'redeemed' | 'foreclosed',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (consignment && mode === 'edit') {
      setFormData({
        customer_id: consignment.customer_id || '',
        product_description: consignment.product_description || '',
        weight_baht: consignment.weight_baht || 0,
        weight_grams: consignment.weight_grams || 0,
        gold_percentage: consignment.gold_percentage || 96.5,
        principal_amount: consignment.principal_amount || 0,
        interest_rate: consignment.interest_rate || 1.25,
        interest_type: consignment.interest_type || 'monthly',
        start_date: consignment.start_date || new Date().toISOString().split('T')[0],
        due_date: consignment.due_date || '',
        total_months: consignment.total_months || 3,
        notes: consignment.notes || '',
        status: consignment.status || 'active',
      })
    } else {
      // Reset for add mode
      setFormData({
        customer_id: '',
        product_description: '',
        weight_baht: 0,
        weight_grams: 0,
        gold_percentage: 96.5,
        principal_amount: 0,
        interest_rate: 1.25,
        interest_type: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        total_months: 3,
        notes: '',
        status: 'active',
      })
      setErrors({})
    }
  }, [consignment, mode, isOpen])

  // Auto-calculate due date based on total_months
  useEffect(() => {
    if (formData.start_date && formData.total_months > 0) {
      const startDate = new Date(formData.start_date)
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + formData.total_months)
      setFormData((prev) => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0],
      }))
    }
  }, [formData.start_date, formData.total_months])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    // Handle weight conversion
    if (name === 'weight_baht') {
      const baht = parseFloat(value) || 0
      setFormData({
        ...formData,
        weight_baht: baht,
        weight_grams: bahtToGrams(baht),
      })
    } else if (name === 'weight_grams') {
      const grams = parseFloat(value) || 0
      setFormData({
        ...formData,
        weight_grams: grams,
        weight_baht: gramsToBaht(grams),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_id) newErrors.customer_id = 'กรุณาเลือกลูกค้า'
    if (!formData.product_description) newErrors.product_description = 'กรุณาระบุรายละเอียดสินค้า'
    if (formData.weight_baht <= 0) newErrors.weight_baht = 'กรุณาระบุน้ำหนักที่ถูกต้อง'
    if (formData.principal_amount <= 0) newErrors.principal_amount = 'กรุณาระบุเงินต้นที่ถูกต้อง'
    if (formData.interest_rate <= 0) newErrors.interest_rate = 'กรุณาระบุอัตราดอกเบี้ยที่ถูกต้อง'
    if (!formData.start_date) newErrors.start_date = 'กรุณาเลือกวันที่เริ่ม'
    if (!formData.due_date) newErrors.due_date = 'กรุณาเลือกวันครบกำหนด'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving consignment:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'เพิ่มการขายฝาก' : 'แก้ไขการขายฝาก'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User size={16} className="inline mr-1" />
            ลูกค้า <span className="text-red-500">*</span>
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className={`input ${errors.customer_id ? 'border-red-500' : ''}`}
            disabled={mode === 'edit'}
          >
            <option value="">เลือกลูกค้า</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} - {customer.phone}
              </option>
            ))}
          </select>
          {errors.customer_id && (
            <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>
          )}
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText size={16} className="inline mr-1" />
            รายละเอียดสินค้า <span className="text-red-500">*</span>
          </label>
          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            rows={3}
            className={`input ${errors.product_description ? 'border-red-500' : ''}`}
            placeholder="เช่น แหวนทองคำ 96.5% ฝังเพชร..."
          />
          {errors.product_description && (
            <p className="text-red-500 text-xs mt-1">{errors.product_description}</p>
          )}
        </div>

        {/* Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Weight size={16} className="inline mr-1" />
              น้ำหนัก (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight_baht"
              value={formData.weight_baht || ''}
              onChange={handleChange}
              step="0.0001"
              min="0"
              className={`input ${errors.weight_baht ? 'border-red-500' : ''}`}
            />
            {errors.weight_baht && (
              <p className="text-red-500 text-xs mt-1">{errors.weight_baht}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              น้ำหนัก (กรัม)
            </label>
            <input
              type="number"
              name="weight_grams"
              value={formData.weight_grams ? formData.weight_grams.toFixed(3) : '0.000'}
              onChange={handleChange}
              step="0.001"
              min="0"
              className="input"
            />
          </div>
        </div>

        {/* Gold Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เปอร์เซ็นต์ทอง (%)
          </label>
          <select
            name="gold_percentage"
            value={formData.gold_percentage}
            onChange={handleChange}
            className="input"
          >
            <option value="96.5">96.5%</option>
            <option value="99.99">99.99%</option>
            <option value="90">90%</option>
          </select>
        </div>

        {/* Principal Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เงินต้น (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="principal_amount"
            value={formData.principal_amount || ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`input ${errors.principal_amount ? 'border-red-500' : ''}`}
          />
          {errors.principal_amount && (
            <p className="text-red-500 text-xs mt-1">{errors.principal_amount}</p>
          )}
        </div>

        {/* Interest Rate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Percent size={16} className="inline mr-1" />
              อัตราดอกเบี้ย (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="interest_rate"
              value={formData.interest_rate || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`input ${errors.interest_rate ? 'border-red-500' : ''}`}
            />
            {errors.interest_rate && (
              <p className="text-red-500 text-xs mt-1">{errors.interest_rate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทดอกเบี้ย
            </label>
            <select
              name="interest_type"
              value={formData.interest_type}
              onChange={handleChange}
              className="input"
            >
              <option value="monthly">รายเดือน</option>
              <option value="daily">รายวัน</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="inline mr-1" />
              วันที่เริ่ม <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`input ${errors.start_date ? 'border-red-500' : ''}`}
              disabled={mode === 'edit'}
            />
            {errors.start_date && (
              <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ระยะเวลา (เดือน)
            </label>
            <input
              type="number"
              name="total_months"
              value={formData.total_months || ''}
              onChange={handleChange}
              min="1"
              className="input"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันครบกำหนด <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={`input ${errors.due_date ? 'border-red-500' : ''}`}
          />
          {errors.due_date && (
            <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
          )}
        </div>

        {/* Status - แสดงเฉพาะโหมดแก้ไข */}
        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะสัญญา
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="active">กำลังดำเนินการ</option>
              <option value="extended">ต่ออายุแล้ว</option>
              <option value="redeemed">ไถ่ถอนแล้ว</option>
              <option value="foreclosed">ยึดทรัพย์แล้ว</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              เปลี่ยนสถานะเมื่อลูกค้าไถ่ถอน, ต่ออายุ หรือยึดทรัพย์
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            หมายเหตุ
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="input"
            placeholder="หมายเหตุเพิ่มเติม..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            ยกเลิก
          </button>
          <button type="submit" className="btn-primary flex-1">
            {mode === 'add' ? 'เพิ่มการขายฝาก' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </Modal>
  )
}


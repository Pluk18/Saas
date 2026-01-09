'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { validateThaiID, validateThaiPhone, formatThaiPhone } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: any) => Promise<void>
  customer?: any
  mode: 'create' | 'edit'
}

export default function CustomerModal({ isOpen, onClose, onSave, customer, mode }: CustomerModalProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    customer_code: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    line_id: '',
    address: '',
    id_card_number: '',
    customer_type: 'regular',
  })

  useEffect(() => {
    if (customer && mode === 'edit') {
      setFormData({
        customer_code: customer.customer_code || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        line_id: customer.line_id || '',
        address: customer.address || '',
        id_card_number: customer.id_card_number || '',
        customer_type: customer.customer_type || 'regular',
      })
    } else if (mode === 'create') {
      // Generate customer code
      const timestamp = Date.now().toString().slice(-6)
      setFormData({
        customer_code: `CUST-${timestamp}`,
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        line_id: '',
        address: '',
        id_card_number: '',
        customer_type: 'regular',
      })
    }
    setErrors({})
  }, [customer, mode, isOpen])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'กรุณากรอกชื่อ'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'กรุณากรอกนามสกุล'
    }

    if (formData.phone && !validateThaiPhone(formData.phone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นเบอร์ไทย 10 หลัก)'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'อีเมลไม่ถูกต้อง'
    }

    if (formData.id_card_number && !validateThaiID(formData.id_card_number)) {
      newErrors.id_card_number = 'เลขบัตรประชาชนไม่ถูกต้อง'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      toast.error('กรุณากรอกข้อมูลให้ถูกต้อง')
      return
    }

    setLoading(true)
    try {
      // Clean data: remove empty strings for optional fields
      const cleanedData: any = {
        customer_code: formData.customer_code,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        customer_type: formData.customer_type || 'regular',
      }

      // Only add optional fields if they have values
      if (formData.phone && formData.phone.trim()) {
        cleanedData.phone = formData.phone.trim()
      }
      if (formData.email && formData.email.trim()) {
        cleanedData.email = formData.email.trim()
      }
      if (formData.line_id && formData.line_id.trim()) {
        cleanedData.line_id = formData.line_id.trim()
      }
      if (formData.address && formData.address.trim()) {
        cleanedData.address = formData.address.trim()
      }
      if (formData.id_card_number && formData.id_card_number.trim()) {
        cleanedData.id_card_number = formData.id_card_number.trim()
      }

      console.log('Submitting customer data:', cleanedData)
      await onSave(cleanedData)
      onClose()
    } catch (error) {
      console.error('Error saving customer:', error)
      // Error is already shown by the hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'เพิ่มลูกค้าใหม่' : 'แก้ไขข้อมูลลูกค้า'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Customer Code */}
          <div>
            <label className="label">รหัสลูกค้า</label>
            <input
              type="text"
              className="input bg-neutral-100"
              value={formData.customer_code}
              disabled
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ชื่อ *</label>
              <input
                type="text"
                className={`input ${errors.first_name ? 'border-red-500' : ''}`}
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
              />
              {errors.first_name && (
                <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="label">นามสกุล *</label>
              <input
                type="text"
                className={`input ${errors.last_name ? 'border-red-500' : ''}`}
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
              />
              {errors.last_name && (
                <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0812345678"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="label">อีเมล</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Line ID */}
          <div>
            <label className="label">Line ID</label>
            <input
              type="text"
              className="input"
              value={formData.line_id}
              onChange={(e) => handleChange('line_id', e.target.value)}
              placeholder="@lineid"
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">ที่อยู่</label>
            <textarea
              className="input"
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 ถ.สุขุมวิท แขวงคลองเตย..."
            />
          </div>

          {/* ID Card (AMLO) */}
          <div>
            <label className="label">เลขบัตรประชาชน (สำหรับ AMLO)</label>
            <input
              type="text"
              className={`input ${errors.id_card_number ? 'border-red-500' : ''}`}
              value={formData.id_card_number}
              onChange={(e) => handleChange('id_card_number', e.target.value)}
              placeholder="1234567890123"
              maxLength={13}
            />
            {errors.id_card_number && (
              <p className="text-xs text-red-600 mt-1">{errors.id_card_number}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              ⚠️ ข้อมูลนี้จำเป็นสำหรับการปฏิบัติตาม พ.ร.บ. ป้องกันและปราบปรามการฟอกเงิน
            </p>
          </div>

          {/* Customer Type */}
          <div>
            <label className="label">ประเภทลูกค้า</label>
            <select
              className="input"
              value={formData.customer_type}
              onChange={(e) => handleChange('customer_type', e.target.value)}
            >
              <option value="regular">ลูกค้าทั่วไป</option>
              <option value="vip">ลูกค้า VIP</option>
              <option value="wholesale">ขายส่ง</option>
            </select>
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
            {loading ? 'กำลังบันทึก...' : mode === 'create' ? 'เพิ่มลูกค้า' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </Modal>
  )
}


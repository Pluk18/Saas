'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { User, FileText, Target, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface GoldSavingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  customers: any[]
  mode?: 'create' | 'edit'
  saving?: any
}

export default function GoldSavingModal({
  isOpen,
  onClose,
  onSave,
  customers,
  mode = 'create',
  saving,
}: GoldSavingModalProps) {
  const [formData, setFormData] = useState({
    customer_id: '',
    account_code: '',
    target_type: 'none' as 'amount' | 'none',
    target_amount: 0,
    notes: '',
  })

  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (mode === 'create') {
      // Auto-generate account code
      const timestamp = Date.now().toString().slice(-6)
      setFormData((prev) => ({
        ...prev,
        account_code: `GSAV-${timestamp}`,
      }))
    } else if (mode === 'edit' && saving) {
      setFormData({
        customer_id: saving.customer_id,
        account_code: saving.account_code,
        target_type: saving.target_amount ? 'amount' : 'none',
        target_amount: saving.target_amount || 0,
        notes: saving.notes || '',
      })
    }
  }, [mode, saving, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id) {
      toast.error('กรุณาเลือกลูกค้า')
      return
    }

    setProcessing(true)
    try {
      const dataToSave: any = {
        customer_id: formData.customer_id,
        account_code: formData.account_code,
        notes: formData.notes || undefined,
      }

      if (formData.target_type === 'amount' && formData.target_amount > 0) {
        dataToSave.target_amount = formData.target_amount
      }

      await onSave(dataToSave)
      onClose()
    } catch (error) {
      // Error already handled in hook
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'สร้างบัญชีออมทองใหม่' : 'แก้ไขบัญชีออมทอง'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User size={16} className="inline mr-1" />
            ลูกค้า <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className="input"
            required
            disabled={mode === 'edit'}
          >
            <option value="">-- เลือกลูกค้า --</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_code} - {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            รหัสบัญชี <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.account_code}
            onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
            className="input"
            required
            readOnly={mode === 'edit'}
          />
        </div>

        {/* Target Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target size={16} className="inline mr-1" />
            เป้าหมาย
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="target_type"
                value="none"
                checked={formData.target_type === 'none'}
                onChange={(e) => setFormData({ ...formData, target_type: 'none' })}
                className="w-4 h-4"
              />
              <span>ไม่กำหนดเป้าหมาย</span>
            </label>

            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="target_type"
                value="amount"
                checked={formData.target_type === 'amount'}
                onChange={(e) => setFormData({ ...formData, target_type: 'amount' })}
                className="w-4 h-4"
              />
              <span>เป้าหมายจำนวนเงิน (บาท)</span>
            </label>

            {formData.target_type === 'amount' && (
              <div className="ml-8">
                <input
                  type="number"
                  value={formData.target_amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })
                  }
                  step="1"
                  min="0"
                  className="input"
                  placeholder="เช่น 50000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText size={16} className="inline mr-1" />
            หมายเหตุ
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="input"
            placeholder="หมายเหตุเพิ่มเติม..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={processing}
          >
            ยกเลิก
          </button>
          <button type="submit" className="flex-1 btn-primary" disabled={processing}>
            {processing ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างบัญชี' : 'บันทึก'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

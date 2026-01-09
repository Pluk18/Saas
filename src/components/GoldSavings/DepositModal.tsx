'use client'

import { useState } from 'react'
import Modal from '@/components/Common/Modal'
import { formatCurrency } from '@/lib/utils'
import { Calendar, DollarSign, CreditCard, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  saving: any
  onSuccess: () => void
}

export default function DepositModal({
  isOpen,
  onClose,
  saving,
  onSuccess,
}: DepositModalProps) {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'cash' as 'cash' | 'transfer' | 'card',
    reference_number: '',
    notes: '',
  })

  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน')
      return
    }

    setProcessing(true)
    try {
      // Call parent's deposit function through onSuccess
      const depositData = {
        gold_saving_id: saving.id,
        transaction_date: formData.transaction_date,
        amount: formData.amount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
      }

      // Pass data to parent
      await onSuccess(depositData)
      onClose()
    } catch (error) {
      // Error handled in parent
    } finally {
      setProcessing(false)
    }
  }

  if (!saving) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ฝากเงินออมทอง">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">ข้อมูลบัญชี</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">รหัสบัญชี:</span>{' '}
              <span className="font-medium">{saving.account_code}</span>
            </p>
            <p>
              <span className="text-gray-600">ลูกค้า:</span>{' '}
              <span className="font-medium">
                {saving.customer?.first_name} {saving.customer?.last_name}
              </span>
            </p>
            <p>
              <span className="text-gray-600">ยอดคงเหลือ:</span>{' '}
              <span className="font-bold text-amber-700 text-lg">
                {formatCurrency(saving.balance || 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Transaction Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar size={16} className="inline mr-1" />
            วันที่ฝาก
          </label>
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            className="input"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign size={16} className="inline mr-1" />
            จำนวนเงิน (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            step="1"
            min="1"
            className="input text-lg font-semibold"
            placeholder="0"
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard size={16} className="inline mr-1" />
            วิธีชำระเงิน
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'cash', label: 'เงินสด' },
              { value: 'transfer', label: 'โอน' },
              { value: 'card', label: 'บัตร' },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: method.value as any })}
                className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  formData.payment_method === method.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Number */}
        {(formData.payment_method === 'transfer' || formData.payment_method === 'card') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลขอ้างอิง
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              className="input"
              placeholder="เลขที่อ้างอิงธุรกรรม"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText size={16} className="inline mr-1" />
            หมายเหตุ
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
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
          <button
            type="submit"
            className="flex-1 btn-success"
            disabled={processing}
          >
            {processing ? 'กำลังบันทึก...' : 'ฝากเงิน'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

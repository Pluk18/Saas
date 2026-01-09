'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { formatCurrency } from '@/lib/utils'
import { Calendar, DollarSign, FileText, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  saving: any
  onSuccess: () => void
}

export default function WithdrawModal({
  isOpen,
  onClose,
  saving,
  onSuccess,
}: WithdrawModalProps) {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    withdrawal_type: 'gold' as 'gold' | 'cash',
    amount: 0,
    product_description: '',
    notes: '',
  })

  const [processing, setProcessing] = useState(false)

  // Set default amount to full balance when modal opens
  useEffect(() => {
    if (isOpen && saving) {
      setFormData((prev) => ({
        ...prev,
        amount: saving.balance || 0,
      }))
    }
  }, [isOpen, saving])

  const handleGoToPOS = () => {
    if (formData.amount <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน')
      return
    }

    const maxAmount = saving.balance || 0
    if (formData.amount > maxAmount) {
      toast.error('จำนวนเงินที่ถอนมากกว่ายอดคงเหลือ')
      return
    }

    // Redirect to POS with gold credit data
    const params = new URLSearchParams({
      mode: 'gold_credit',
      saving_id: saving.id,
      customer_id: saving.customer_id,
      customer_name: `${saving.customer.first_name} ${saving.customer.last_name}`,
      credit_amount: formData.amount.toString(),
      transaction_date: formData.transaction_date,
    })

    window.location.href = `/pos?${params.toString()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน')
      return
    }

    const maxAmount = saving.balance || 0
    if (formData.amount > maxAmount) {
      toast.error('จำนวนเงินที่ถอนมากกว่ายอดคงเหลือ')
      return
    }

    if (formData.withdrawal_type === 'gold' && !formData.product_description) {
      toast.error('กรุณาระบุรายละเอียดสินค้าที่แลก')
      return
    }

    setProcessing(true)
    try {
      const withdrawalData = {
        gold_saving_id: saving.id,
        transaction_date: formData.transaction_date,
        amount: formData.amount,
        withdrawal_type: formData.withdrawal_type,
        product_description: formData.product_description || undefined,
        notes: formData.notes || undefined,
      }

      await onSuccess(withdrawalData)
      onClose()
    } catch (error) {
      // Error handled in parent
    } finally {
      setProcessing(false)
    }
  }

  if (!saving) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ถอนทอง">
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
            วันที่ถอน
          </label>
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            className="input"
            required
          />
        </div>

        {/* Withdrawal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingDown size={16} className="inline mr-1" />
            ประเภทการถอน
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border-2 border-amber-300 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
              <input
                type="radio"
                name="withdrawal_type"
                value="gold"
                checked={formData.withdrawal_type === 'gold'}
                onChange={(e) => setFormData({ ...formData, withdrawal_type: 'gold' })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-medium text-amber-900">แลกเป็นสินค้าทอง</span>
                <p className="text-xs text-amber-700">ลูกค้ารับทองตามน้ำหนักที่เลือก</p>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="withdrawal_type"
                value="cash"
                checked={formData.withdrawal_type === 'cash'}
                onChange={(e) => setFormData({ ...formData, withdrawal_type: 'cash' })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-medium">ถอนเป็นเงินสด</span>
                <p className="text-xs text-gray-600">คำนวณตามราคาทองวันที่ถอน</p>
              </div>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign size={16} className="inline mr-1" />
            จำนวนเงินที่ถอน (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            step="0.01"
            min="0.01"
            max={saving.balance || 0}
            className="input text-lg font-semibold"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            คงเหลือ: {formatCurrency(saving.balance || 0)}
          </p>
        </div>

        {/* Product Selection (if gold) */}
        {formData.withdrawal_type === 'gold' && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              🛍️ เลือกสินค้าที่ต้องการแลก
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              คลิกปุ่มด้านล่างเพื่อไปหน้า POS และเลือกสินค้าจากคลังที่ต้องการแลก
              ระบบจะคำนวณส่วนต่างให้อัตโนมัติ
            </p>
            <button
              type="button"
              onClick={handleGoToPOS}
              disabled={formData.amount <= 0}
              className="w-full btn-primary text-lg font-semibold py-3"
            >
              🛒 ไปเลือกสินค้าที่ POS
            </button>
            <div className="mt-3 text-xs text-amber-700">
              <p>💡 <strong>ขั้นตอนต่อไป:</strong></p>
              <ol className="list-decimal ml-5 mt-1 space-y-1">
                <li>เลือกสินค้าที่ต้องการจากคลัง</li>
                <li>ระบบคำนวณส่วนต่างอัตโนมัติ</li>
                <li>ชำระเงินส่วนต่าง (ถ้ามี)</li>
                <li>บันทึกการถอน + ออกใบเสร็จ</li>
              </ol>
            </div>
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

        {/* Warning */}
        {formData.amount >= (saving.balance || 0) && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>คำเตือน:</strong> การถอนทั้งหมดจะเปลี่ยนสถานะบัญชีเป็น "ถอนแล้ว"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={processing}
          >
            {formData.withdrawal_type === 'gold' ? 'ปิด' : 'ยกเลิก'}
          </button>
          {formData.withdrawal_type === 'cash' && (
            <button
              type="submit"
              className="flex-1 btn-danger"
              disabled={processing}
            >
              {processing ? 'กำลังบันทึก...' : 'ยืนยันการถอน'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

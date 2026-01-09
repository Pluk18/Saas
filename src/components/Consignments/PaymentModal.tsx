'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { formatCurrency, formatThaiDate } from '@/lib/utils'
import { createConsignmentPayment, updateConsignment } from '@/lib/supabaseAPI'
import { DollarSign, Calendar, CreditCard, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  consignment: any
  interest: any
  onSuccess: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  consignment,
  interest,
  onSuccess,
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'interest' as 'interest' | 'principal' | 'full',
    amount: 0,
    payment_method: 'cash' as 'cash' | 'transfer' | 'card',
    reference_number: '',
    notes: '',
  })
  
  const [processing, setProcessing] = useState(false)

  // Auto-calculate amount based on payment type
  useEffect(() => {
    if (!interest) return

    let calculatedAmount = 0
    if (formData.payment_type === 'interest') {
      calculatedAmount = interest.remainingInterest
    } else if (formData.payment_type === 'principal') {
      calculatedAmount = interest.principal
    } else if (formData.payment_type === 'full') {
      calculatedAmount = interest.totalAmount
    }

    setFormData((prev) => ({
      ...prev,
      amount: calculatedAmount,
    }))
  }, [formData.payment_type, interest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.amount <= 0) {
      toast.error('กรุณาระบุจำนวนเงิน')
      return
    }

    setProcessing(true)
    try {
      // Calculate principal and interest payments
      let principalPayment = 0
      let interestPayment = 0

      if (formData.payment_type === 'interest') {
        interestPayment = formData.amount
      } else if (formData.payment_type === 'principal') {
        principalPayment = formData.amount
      } else if (formData.payment_type === 'full') {
        principalPayment = interest.principal
        interestPayment = interest.remainingInterest
      }

      // Create payment record
      await createConsignmentPayment({
        consignment_id: consignment.id,
        payment_date: formData.payment_date,
        principal_payment: principalPayment,
        interest_payment: interestPayment,
        total_payment: formData.amount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
      })

      // If full payment, update consignment status to redeemed
      if (formData.payment_type === 'full') {
        await updateConsignment(consignment.id, {
          status: 'redeemed',
        })
      }

      toast.success('บันทึกการรับชำระเงินสำเร็จ')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast.error(`ไม่สามารถบันทึกการชำระเงินได้: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (!consignment || !interest) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="บันทึกการรับชำระเงิน">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consignment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ข้อมูลสัญญา</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">รหัสสัญญา:</span>{' '}
              <span className="font-medium">{consignment.consignment_code}</span>
            </p>
            <p>
              <span className="text-gray-600">ลูกค้า:</span>{' '}
              <span className="font-medium">
                {consignment.customer?.first_name} {consignment.customer?.last_name}
              </span>
            </p>
            <p>
              <span className="text-gray-600">เงินต้น:</span>{' '}
              <span className="font-medium">{formatCurrency(consignment.principal_amount)}</span>
            </p>
          </div>
        </div>

        {/* Interest Summary */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-3">สรุปดอกเบี้ย</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ดอกเบี้ยทั้งหมด:</span>
              <span className="font-medium">{formatCurrency(interest.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ชำระแล้ว:</span>
              <span className="font-medium text-green-600">{formatCurrency(interest.paidInterest)}</span>
            </div>
            <div className="flex justify-between border-t border-amber-300 pt-2">
              <span className="font-semibold text-gray-800">ดอกเบี้ยคงเหลือ:</span>
              <span className="font-bold text-orange-600">{formatCurrency(interest.remainingInterest)}</span>
            </div>
            {interest.isOverdue && (
              <div className="text-xs text-red-600 flex items-center gap-1 mt-2">
                ⚠️ เกินกำหนด {interest.daysOverdue} วัน
              </div>
            )}
          </div>
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar size={16} className="inline mr-1" />
            วันที่รับชำระ
          </label>
          <input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            className="input"
            required
          />
        </div>

        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ประเภทการชำระ
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment_type"
                value="interest"
                checked={formData.payment_type === 'interest'}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-medium">ชำระดอกเบี้ย</span>
                <p className="text-xs text-gray-500">ชำระดอกเบี้ยเท่านั้น</p>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {formatCurrency(interest.remainingInterest)}
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment_type"
                value="principal"
                checked={formData.payment_type === 'principal'}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-medium">ชำระเงินต้น</span>
                <p className="text-xs text-gray-500">ชำระเงินต้นเท่านั้น</p>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {formatCurrency(interest.principal)}
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 border-2 border-green-300 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
              <input
                type="radio"
                name="payment_type"
                value="full"
                checked={formData.payment_type === 'full'}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-medium text-green-900">ชำระเต็มจำนวน (ไถ่ถอน)</span>
                <p className="text-xs text-green-700">ชำระเงินต้น + ดอกเบี้ย (เปลี่ยนสถานะเป็นไถ่ถอนแล้ว)</p>
              </div>
              <span className="text-sm font-bold text-green-700">
                {formatCurrency(interest.totalAmount)}
              </span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign size={16} className="inline mr-1" />
            จำนวนเงิน (บาท)
          </label>
          <input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            step="0.01"
            min="0"
            className="input text-lg font-semibold"
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

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">ยอดรับชำระทั้งหมด:</span>
            <span className="text-3xl font-bold">{formatCurrency(formData.amount)}</span>
          </div>
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
            {processing ? 'กำลังบันทึก...' : 'บันทึกการรับชำระ'}
          </button>
        </div>
      </form>
    </Modal>
  )
}


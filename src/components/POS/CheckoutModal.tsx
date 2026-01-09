'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { formatCurrency } from '@/lib/utils'
import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (paymentDetails: {
    cash_amount?: number
    transfer_amount?: number
    card_amount?: number
    notes?: string
  }) => Promise<void>
  total: number
  paymentMethod: 'cash' | 'transfer' | 'card' | 'mixed' | 'gold_credit'
  goldCreditMode?: boolean
  goldCreditAmount?: number
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onConfirm,
  total,
  paymentMethod,
  goldCreditMode = false,
  goldCreditAmount = 0
}: CheckoutModalProps) {
  const [cashAmount, setCashAmount] = useState(0)
  const [transferAmount, setTransferAmount] = useState(0)
  const [cardAmount, setCardAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset and set default amounts
      if (paymentMethod === 'cash') {
        setCashAmount(total)
        setTransferAmount(0)
        setCardAmount(0)
      } else if (paymentMethod === 'transfer') {
        setCashAmount(0)
        setTransferAmount(total)
        setCardAmount(0)
      } else if (paymentMethod === 'card') {
        setCashAmount(0)
        setTransferAmount(0)
        setCardAmount(total)
      } else if (paymentMethod === 'gold_credit') {
        // Gold credit - amount depends on total vs credit
        setCashAmount(Math.max(0, total))
        setTransferAmount(0)
        setCardAmount(0)
      } else {
        // mixed - reset all
        setCashAmount(0)
        setTransferAmount(0)
        setCardAmount(0)
      }
      setNotes('')
    }
  }, [isOpen, total, paymentMethod])

  const totalPaid = cashAmount + transferAmount + cardAmount
  const change = totalPaid - total
  const remaining = total - totalPaid

  const handleConfirm = async () => {
    if (totalPaid < total) {
      toast.error('ยอดชำระไม่เพียงพอ')
      return
    }

    setProcessing(true)
    try {
      await onConfirm({
        cash_amount: cashAmount > 0 ? cashAmount : undefined,
        transfer_amount: transferAmount > 0 ? transferAmount : undefined,
        card_amount: cardAmount > 0 ? cardAmount : undefined,
        notes: notes.trim() || undefined
      })
      onClose()
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const quickCashButtons = [
    { label: '100', value: 100 },
    { label: '500', value: 500 },
    { label: '1,000', value: 1000 },
    { label: 'พอดี', value: total },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ชำระเงิน"
      size="lg"
    >
      <div className="space-y-6">
        {/* Total Amount */}
        <div className="p-6 bg-primary-50 rounded-lg border-2 border-primary-200">
          <p className="text-sm text-primary-700 mb-1">ยอดชำระทั้งหมด</p>
          <p className="text-4xl font-bold text-primary-900 font-display">
            {formatCurrency(total)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="label">วิธีชำระเงิน</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethod === 'cash' && (
              <div className="col-span-2 p-4 bg-green-50 border-2 border-green-500 rounded-lg flex items-center gap-3">
                <Banknote className="text-green-700" size={24} />
                <span className="font-semibold text-green-900">เงินสด</span>
              </div>
            )}
            {paymentMethod === 'transfer' && (
              <div className="col-span-2 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg flex items-center gap-3">
                <Smartphone className="text-blue-700" size={24} />
                <span className="font-semibold text-blue-900">โอนเงิน</span>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="col-span-2 p-4 bg-purple-50 border-2 border-purple-500 rounded-lg flex items-center gap-3">
                <CreditCard className="text-purple-700" size={24} />
                <span className="font-semibold text-purple-900">บัตรเครดิต</span>
              </div>
            )}
            {paymentMethod === 'mixed' && (
              <div className="col-span-2 p-4 bg-orange-50 border-2 border-orange-500 rounded-lg flex items-center gap-3">
                <Wallet className="text-orange-700" size={24} />
                <span className="font-semibold text-orange-900">ชำระแบบผสม</span>
              </div>
            )}
            {paymentMethod === 'gold_credit' && goldCreditMode && (
              <div className="col-span-2 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-amber-700" size={24} />
                    <div>
                      <span className="font-semibold text-amber-900 block">เครดิตออมทอง</span>
                      <span className="text-xs text-amber-700">หักจากบัญชีออมทอง</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-700">เครดิตคงเหลือ</p>
                    <p className="text-xl font-bold text-amber-900">
                      {formatCurrency(goldCreditAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Amounts */}
        {(paymentMethod === 'cash' || paymentMethod === 'mixed') && (
          <div>
            <label className="label">เงินสดที่รับ</label>
            <input
              type="number"
              step="0.01"
              className="input text-lg font-semibold"
              value={cashAmount || ''}
              onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              autoFocus
            />
            {paymentMethod === 'cash' && (
              <div className="flex gap-2 mt-2">
                {quickCashButtons.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => setCashAmount(btn.value)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(paymentMethod === 'transfer' || paymentMethod === 'mixed') && (
          <div>
            <label className="label">โอนเงิน</label>
            <input
              type="number"
              step="0.01"
              className="input text-lg font-semibold"
              value={transferAmount || ''}
              onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        )}

        {(paymentMethod === 'card' || paymentMethod === 'mixed') && (
          <div>
            <label className="label">บัตรเครดิต</label>
            <input
              type="number"
              step="0.01"
              className="input text-lg font-semibold"
              value={cardAmount || ''}
              onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">ยอดที่ต้องชำระ:</span>
            <span className="font-semibold text-neutral-900">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">ยอดที่รับมา:</span>
            <span className="font-semibold text-blue-700">{formatCurrency(totalPaid)}</span>
          </div>
          {goldCreditMode ? (
            // Gold Credit Mode - show credit deduction
            <>
              <div className="flex justify-between text-sm border-t border-amber-200 pt-2">
                <span className="text-amber-700 font-medium">หัก: เครดิตออมทอง</span>
                <span className="text-amber-700 font-medium">-{formatCurrency(Math.min(total, goldCreditAmount))}</span>
              </div>
              {total > goldCreditAmount ? (
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-semibold text-red-700">ต้องชำระเพิ่ม:</span>
                  <span className="text-2xl font-bold text-red-700">{formatCurrency(total - goldCreditAmount)}</span>
                </div>
              ) : (
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-semibold text-green-700">🔥 คืนเงิน:</span>
                  <span className="text-2xl font-bold text-green-700">{formatCurrency(goldCreditAmount - total)}</span>
                </div>
              )}
            </>
          ) : remaining > 0 ? (
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-red-700">ยังขาดอีก:</span>
              <span className="text-xl font-bold text-red-700">{formatCurrency(remaining)}</span>
            </div>
          ) : (
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-green-700">เงินทอน:</span>
              <span className="text-2xl font-bold text-green-700">{formatCurrency(change)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="label">หมายเหตุ (ถ้ามี)</label>
          <textarea
            className="input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="บันทึกเพิ่มเติม..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={processing}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn btn-success flex-1"
            disabled={totalPaid < total || processing}
          >
            {processing ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
          </button>
        </div>
      </div>
    </Modal>
  )
}


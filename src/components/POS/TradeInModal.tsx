'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { bahtToGrams, gramsToBaht, formatCurrency, formatNumber } from '@/lib/utils'
import type { GoldPrice } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface TradeInModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tradeIn: {
    description: string
    weight_baht: number
    weight_grams: number
    gold_percentage: number
    buy_price_per_baht: number
    total_buy_price: number
  }) => void
  goldPrice: GoldPrice | null
}

export default function TradeInModal({ isOpen, onClose, onSave, goldPrice }: TradeInModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    weight_baht: 0,
    weight_grams: 0,
    gold_percentage: 96.5,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        description: '',
        weight_baht: 0,
        weight_grams: 0,
        gold_percentage: 96.5,
      })
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (field: string, value: any) => {
    let newData = { ...formData, [field]: value }

    // Auto-calculate weight conversions
    if (field === 'weight_baht') {
      const baht = parseFloat(value) || 0
      newData.weight_grams = bahtToGrams(baht)
    } else if (field === 'weight_grams') {
      const grams = parseFloat(value) || 0
      newData.weight_baht = gramsToBaht(grams)
    }

    setFormData(newData)

    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณาระบุรายละเอียดทองเก่า'
    }

    if (formData.weight_baht <= 0) {
      newErrors.weight_baht = 'กรุณาระบุน้ำหนัก'
    }

    if (formData.gold_percentage <= 0 || formData.gold_percentage > 100) {
      newErrors.gold_percentage = 'เปอร์เซ็นต์ทองไม่ถูกต้อง'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (!goldPrice) {
      toast.error('ไม่พบราคาทองวันนี้')
      return
    }

    // Calculate buy price based on gold percentage
    const buyPricePerBaht = goldPrice.gold_jewelry_buy * (formData.gold_percentage / 96.5)
    const totalBuyPrice = buyPricePerBaht * formData.weight_baht

    onSave({
      description: formData.description.trim(),
      weight_baht: formData.weight_baht,
      weight_grams: formData.weight_grams,
      gold_percentage: formData.gold_percentage,
      gold_buy_price_per_baht: buyPricePerBaht,
      trade_in_value: totalBuyPrice,
    })

    onClose()
  }

  // Calculate preview
  const buyPricePerBaht = goldPrice ? goldPrice.gold_jewelry_buy * (formData.gold_percentage / 96.5) : 0
  const totalBuyPrice = buyPricePerBaht * formData.weight_baht

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รับซื้อทองเก่า (Trade-in)"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Gold Price Info */}
          {goldPrice && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm font-medium text-primary-900 mb-2">
                ราคารับซื้อทองรูปพรรณ 96.5% วันนี้
              </p>
              <p className="text-2xl font-bold text-primary-700">
                {formatCurrency(goldPrice.gold_jewelry_buy)} / บาท
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="label">รายละเอียดทองเก่า *</label>
            <input
              type="text"
              className={`input ${errors.description ? 'border-red-500' : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="เช่น สร้อยคอทองเก่า, แหวนทองเก่า"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">น้ำหนัก (บาท) *</label>
              <input
                type="number"
                step="0.0001"
                className={`input ${errors.weight_baht ? 'border-red-500' : ''}`}
                value={formData.weight_baht || ''}
                onChange={(e) => handleChange('weight_baht', e.target.value)}
                placeholder="0.0000"
              />
              {errors.weight_baht && (
                <p className="text-xs text-red-600 mt-1">{errors.weight_baht}</p>
              )}
            </div>
            <div>
              <label className="label">น้ำหนัก (กรัม)</label>
              <input
                type="number"
                step="0.001"
                className="input bg-neutral-50"
                value={formData.weight_grams > 0 ? formData.weight_grams.toFixed(3) : ''}
                onChange={(e) => handleChange('weight_grams', e.target.value)}
                placeholder="0.000"
              />
            </div>
          </div>

          {/* Gold Percentage */}
          <div>
            <label className="label">เปอร์เซ็นต์ทอง (%) *</label>
            <select
              className={`input ${errors.gold_percentage ? 'border-red-500' : ''}`}
              value={formData.gold_percentage}
              onChange={(e) => handleChange('gold_percentage', parseFloat(e.target.value))}
            >
              <option value="96.5">96.5% (ทองคำแท้)</option>
              <option value="90">90% (ทอง 90)</option>
              <option value="75">75% (ทอง 75)</option>
              <option value="50">50% (ทอง 50)</option>
            </select>
            {errors.gold_percentage && (
              <p className="text-xs text-red-600 mt-1">{errors.gold_percentage}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              💡 ราคารับซื้อจะคำนวณตามเปอร์เซ็นต์ทอง
            </p>
          </div>

          {/* Price Preview */}
          {formData.weight_baht > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">ราคารับซื้อต่อบาท:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(buyPricePerBaht)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-700">น้ำหนัก:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatNumber(formData.weight_baht, 4)} บาท
                  </span>
                </div>
                <div className="pt-2 border-t border-green-300">
                  <div className="flex justify-between">
                    <span className="font-semibold text-green-900">ราคารับซื้อทั้งหมด:</span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(totalBuyPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="btn btn-success"
          >
            บันทึกรับซื้อทอง
          </button>
        </div>
      </form>
    </Modal>
  )
}


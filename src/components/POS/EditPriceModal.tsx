'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { CartItem } from '@/hooks/usePOS'
import { Calculator, Lightbulb } from 'lucide-react'

interface EditPriceModalProps {
  isOpen: boolean
  onClose: () => void
  item: CartItem | null
  onSave: (laborCost: number, gemCost: number, customPrice?: number) => void
}

export default function EditPriceModal({ isOpen, onClose, item, onSave }: EditPriceModalProps) {
  const [laborCost, setLaborCost] = useState(0)
  const [gemCost, setGemCost] = useState(0)
  const [customPrice, setCustomPrice] = useState<number | undefined>(undefined)
  const [useCustomPrice, setUseCustomPrice] = useState(false)

  useEffect(() => {
    if (item) {
      setLaborCost(item.laborCost)
      setGemCost(item.gemCost)
      setCustomPrice(item.isCustomPrice ? item.unitPrice : undefined)
      setUseCustomPrice(item.isCustomPrice)
    }
  }, [item])

  if (!item) return null

  const product = item.product
  const goldSellPrice = item.goldPricePerBaht
  const goldBuyPrice = item.goldBuyPricePerBaht

  // คำนวณกำไรจากทอง
  const goldProfitPerBaht = goldSellPrice - goldBuyPrice
  const goldProfit = goldProfitPerBaht * product.weight_baht

  // คำนวณราคาอัตโนมัติ
  const autoPrice = product.weight_baht * goldSellPrice + laborCost + gemCost
  
  // ราคาที่จะใช้จริง
  const finalPrice = useCustomPrice && customPrice !== undefined ? customPrice : autoPrice

  // ฐาน VAT
  const vatBase = goldProfit + laborCost + gemCost

  const handleSave = () => {
    onSave(laborCost, gemCost, useCustomPrice ? customPrice : undefined)
    onClose()
  }

  const handleReset = () => {
    setLaborCost(product.labor_cost || 0)
    setGemCost(product.gem_cost || 0)
    setUseCustomPrice(false)
    setCustomPrice(undefined)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขราคาสินค้า">
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-lg text-gray-800">{product.product_name}</h3>
          <p className="text-sm text-gray-600">รหัส: {product.product_code}</p>
          <p className="text-sm text-gray-600">น้ำหนัก: {formatNumber(product.weight_baht, 4)} บาท</p>
        </div>

        {/* Gold Price Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calculator size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-700">ราคาทองวันนี้</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">ราคาขายออก:</p>
              <p className="font-semibold text-blue-700">{formatCurrency(goldSellPrice)}/บาท</p>
            </div>
            <div>
              <p className="text-gray-600">ราคารับซื้อ:</p>
              <p className="font-semibold text-blue-700">{formatCurrency(goldBuyPrice)}/บาท</p>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-300">
            <p className="text-xs text-gray-600">กำไรทอง: {formatCurrency(goldProfit)}</p>
          </div>
        </div>

        {/* Labor Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ค่ากำเหน็จ (บาท)
          </label>
          <input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
            className="input"
            min="0"
            step="0.01"
          />
        </div>

        {/* Gem Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ค่าพลอย (บาท)
          </label>
          <input
            type="number"
            value={gemCost}
            onChange={(e) => setGemCost(parseFloat(e.target.value) || 0)}
            className="input"
            min="0"
            step="0.01"
          />
        </div>

        {/* Auto Calculated Price */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">ราคาคำนวณอัตโนมัติ:</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(autoPrice)}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            = ({formatNumber(product.weight_baht, 4)} × {formatCurrency(goldSellPrice)})
            + {formatCurrency(laborCost)}
            + {formatCurrency(gemCost)}
          </p>
        </div>

        {/* Custom Price Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomPrice}
              onChange={(e) => {
                setUseCustomPrice(e.target.checked)
                if (e.target.checked && customPrice === undefined) {
                  setCustomPrice(autoPrice)
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">ตั้งราคาเอง</span>
          </label>

          {useCustomPrice && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาที่ต้องการ (บาท)
              </label>
              <input
                type="number"
                value={customPrice || ''}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="input"
                min="0"
                step="0.01"
                placeholder="กรอกราคาที่ต้องการ"
              />
            </div>
          )}
        </div>

        {/* VAT Base Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-gray-700">ฐาน VAT</span>
          </div>
          <p className="text-lg font-bold text-amber-700">{formatCurrency(vatBase)}</p>
          <p className="text-xs text-gray-500 mt-1">
            = กำไรทอง + ค่ากำเหน็จ + ค่าพลอย
          </p>
        </div>

        {/* Final Price Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
          <p className="text-sm opacity-90 mb-1">ราคาขายสุทธิ:</p>
          <p className="text-3xl font-bold">{formatCurrency(finalPrice)}</p>
          {useCustomPrice && (
            <p className="text-xs opacity-75 mt-2">🎯 ใช้ราคาที่ตั้งเอง</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleReset}
            className="btn-secondary flex-1"
          >
            รีเซ็ต
          </button>
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
          >
            บันทึก
          </button>
        </div>
      </div>
    </Modal>
  )
}


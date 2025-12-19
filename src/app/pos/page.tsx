'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { ShoppingCart, Plus, Minus, X, User } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useState } from 'react'

interface CartItem {
  id: string
  code: string
  name: string
  weight: number
  goldPrice: number
  laborCost: number
  price: number
  quantity: number
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  // Mock products
  const products = [
    { id: '1', code: 'RING-001', name: 'แหวนทองคำ ลายฉลุ', weight: 0.5, goldPrice: 19400, laborCost: 2500 },
    { id: '2', code: 'NECK-001', name: 'สร้อยคอทอง 2 สลึง', weight: 2.0, goldPrice: 77600, laborCost: 8000 },
    { id: '3', code: 'BRAC-001', name: 'กำไลทอง 1 บาท', weight: 1.0, goldPrice: 38800, laborCost: 5000 },
  ]

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const vatAmount = subtotal * 0.07
  const total = subtotal + vatAmount

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            ขายสินค้า (POS)
          </h1>
          <p className="text-neutral-600">ระบบขายหน้าร้าน Point of Sale</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="card">
              <input
                type="text"
                placeholder="ค้นหาสินค้า (รหัสสินค้า, ชื่อสินค้า, สแกน Barcode...)"
                className="input text-lg"
              />
            </div>

            {/* Products Grid */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                เลือกสินค้า
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 
                             hover:shadow-md transition-all text-left"
                  >
                    <p className="text-xs text-neutral-500 mb-1">{product.code}</p>
                    <p className="font-medium text-neutral-900 mb-2">{product.name}</p>
                    <p className="text-sm text-neutral-600 mb-1">
                      {formatNumber(product.weight, 2)} บาท
                    </p>
                    <p className="text-lg font-bold text-primary-700">
                      {formatCurrency(product.goldPrice + product.laborCost)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                รายการสินค้า ({cart.length})
              </h3>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>ยังไม่มีสินค้าในตะกร้า</p>
                  <p className="text-sm mt-1">เลือกสินค้าเพื่อเริ่มการขาย</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-neutral-600">
                          {item.code} • {formatNumber(item.weight, 2)} บาท
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center">
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center">
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="font-bold text-primary-700">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <button className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                ข้อมูลลูกค้า
              </h3>
              <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                <User size={18} />
                เลือกลูกค้า
              </button>
            </div>

            {/* Summary */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                สรุปยอด
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">ยอดรวม</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">ส่วนลด</span>
                  <span className="font-medium text-red-600">-{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">เทิร์นทอง</span>
                  <span className="font-medium text-red-600">-{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">VAT 7%</span>
                  <span className="font-medium text-green-600">+{formatCurrency(vatAmount)}</span>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold text-neutral-800">ยอดชำระทั้งหมด</span>
                    <span className="text-2xl font-bold text-primary-700 font-display">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                วิธีชำระเงิน
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['เงินสด', 'โอนเงิน', 'บัตรเครดิต', 'ผสม'].map((method) => (
                  <button
                    key={method}
                    className="btn btn-outline"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                disabled={cart.length === 0}
                className="w-full btn btn-primary btn-lg text-lg font-semibold"
              >
                ชำระเงิน
              </button>
              <button className="w-full btn btn-outline">
                ล้างรายการ
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


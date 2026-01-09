'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface GoldPriceCardProps {
  type: 'bar' | 'jewelry'
  buyPrice: number
  sellPrice: number
  change?: number
}

export default function GoldPriceCard({ type, buyPrice, sellPrice, change }: GoldPriceCardProps) {
  const isBar = type === 'bar'
  const title = isBar ? 'ทองคำแท่ง 96.5%' : 'ทองรูปพรรณ 96.5%'
  const isPositive = change ? change >= 0 : null

  return (
    <div className="card bg-gradient-to-br from-white to-primary-50 border-primary-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">{title}</h3>
          <p className="text-xs text-neutral-600 mt-1">ราคาต่อบาท (15.244 กรัม)</p>
        </div>
        {change !== undefined && isPositive !== null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-xs font-medium">{Math.abs(change).toFixed(0)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-primary-100">
          <p className="text-xs text-neutral-600 mb-1">ราคารับซื้อ</p>
          <p className="text-xl font-bold text-green-700 font-display">
            {formatCurrency(buyPrice)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-primary-100">
          <p className="text-xs text-neutral-600 mb-1">ราคาขายออก</p>
          <p className="text-xl font-bold text-primary-700 font-display">
            {formatCurrency(sellPrice)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-primary-100">
        <p className="text-xs text-neutral-500 text-center">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            อัพเดทล่าสุด: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </span>
        </p>
        <p className="text-xs text-neutral-400 text-center mt-1">
          ข้อมูลจากสมาคมค้าทองคำไทย
        </p>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import GoldPriceCard from '@/components/Dashboard/GoldPriceCard'
import { useGoldPrice } from '@/hooks/useGoldPrice'
import { TrendingUp, RefreshCw, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatThaiDate } from '@/lib/utils'

export default function GoldPricesPage() {
  const { currentPrice, priceHistory, loading, refreshPrice } = useGoldPrice()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [calcWeight, setCalcWeight] = useState('')
  const [calcType, setCalcType] = useState('bar')
  const [calcPriceType, setCalcPriceType] = useState('buy')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshPrice()
    } catch (error) {
      console.error('Error refreshing price:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const calculatePrice = () => {
    if (!currentPrice || !calcWeight) return 0
    const weight = parseFloat(calcWeight)
    if (isNaN(weight)) return 0

    let pricePerBaht = 0
    if (calcType === 'bar' && calcPriceType === 'buy') {
      pricePerBaht = currentPrice.gold_bar_buy
    } else if (calcType === 'bar' && calcPriceType === 'sell') {
      pricePerBaht = currentPrice.gold_bar_sell
    } else if (calcType === 'jewelry' && calcPriceType === 'buy') {
      pricePerBaht = currentPrice.gold_jewelry_buy
    } else {
      pricePerBaht = currentPrice.gold_jewelry_sell
    }

    return weight * pricePerBaht
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              ราคาทองคำวันนี้
            </h1>
            <p className="text-neutral-600">
              อ้างอิงจากสมาคมค้าทองคำ ณ วันที่ {currentPrice ? formatThaiDate(currentPrice.price_date) : 'กำลังโหลด...'}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-outline flex items-center gap-2"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              อัพเดทราคา
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Download size={18} />
              ดาวน์โหลดประวัติ
            </button>
          </div>
        </div>

        {/* Current Prices */}
        <div>
          <h2 className="text-xl font-display font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={24} />
            ราคาปัจจุบัน
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">กำลังโหลดราคาทอง...</p>
            </div>
          ) : currentPrice ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoldPriceCard
                type="bar"
                buyPrice={currentPrice.gold_bar_buy}
                sellPrice={currentPrice.gold_bar_sell}
              />
              <GoldPriceCard
                type="jewelry"
                buyPrice={currentPrice.gold_jewelry_buy}
                sellPrice={currentPrice.gold_jewelry_sell}
              />
            </div>
          ) : (
            <div className="text-center py-12 card">
              <p className="text-neutral-600 mb-4">ยังไม่มีข้อมูลราคาทอง</p>
              <button onClick={handleRefresh} className="btn btn-primary">
                อัพเดทราคาเลย
              </button>
            </div>
          )}
        </div>

        {/* Price Difference Calculator */}
        <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
            คำนวณราคาทอง
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">น้ำหนัก (บาท)</label>
              <input 
                type="number" 
                className="input" 
                placeholder="0.00" 
                step="0.01"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="label">ประเภททอง</label>
              <select 
                className="input"
                value={calcType}
                onChange={(e) => setCalcType(e.target.value)}
              >
                <option value="bar">ทองคำแท่ง</option>
                <option value="jewelry">ทองรูปพรรณ</option>
              </select>
            </div>
            <div>
              <label className="label">ประเภทราคา</label>
              <select 
                className="input"
                value={calcPriceType}
                onChange={(e) => setCalcPriceType(e.target.value)}
              >
                <option value="buy">ราคารับซื้อ</option>
                <option value="sell">ราคาขายออก</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="w-full p-4 bg-white rounded-lg border border-primary-200">
                <p className="text-xs text-neutral-600 mb-1">ราคารวม</p>
                <p className="text-xl font-bold text-primary-700 font-display">
                  {formatCurrency(calculatePrice())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-semibold text-neutral-800 flex items-center gap-2">
              <Calendar size={20} />
              ประวัติราคา 7 วันย้อนหลัง
            </h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th className="text-center" colSpan={2}>ทองคำแท่ง</th>
                  <th className="text-center" colSpan={2}>ทองรูปพรรณ</th>
                  <th className="text-center">ส่วนต่าง</th>
                </tr>
                <tr className="border-t">
                  <th></th>
                  <th className="text-right">รับซื้อ</th>
                  <th className="text-right">ขายออก</th>
                  <th className="text-right">รับซื้อ</th>
                  <th className="text-right">ขายออก</th>
                  <th className="text-center">แท่ง/รูปพรรณ</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-500">
                      ไม่มีประวัติราคา
                    </td>
                  </tr>
                ) : (
                  priceHistory.map((price, index) => {
                    const isToday = index === 0
                    const diff = price.gold_jewelry_sell - price.gold_bar_sell
                    return (
                      <tr key={price.price_date} className={isToday ? 'bg-primary-50' : ''}>
                        <td className="font-medium">
                          {formatThaiDate(price.price_date)}
                          {isToday && <span className="ml-2 badge badge-success">วันนี้</span>}
                        </td>
                        <td className="text-right font-medium text-green-700">
                          {formatCurrency(price.gold_bar_buy)}
                        </td>
                        <td className="text-right font-medium text-primary-700">
                          {formatCurrency(price.gold_bar_sell)}
                        </td>
                        <td className="text-right font-medium text-green-700">
                          {formatCurrency(price.gold_jewelry_buy)}
                        </td>
                        <td className="text-right font-medium text-primary-700">
                          {formatCurrency(price.gold_jewelry_sell)}
                        </td>
                        <td className="text-center">
                          <span className="badge badge-info">
                            +{formatCurrency(diff)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-neutral-800 mb-3">ℹ️ หมายเหตุ</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• ราคาทองคำ 96.5% ต่อ 1 บาท (น้ำหนัก 15.244 กรัม)</li>
            <li>• ราคาอ้างอิงจากสมาคมค้าทองคำไทย (Mock API)</li>
            <li>• ราคาอาจมีการเปลี่ยนแปลงตลอดเวลา</li>
            <li>• กดปุ่ม "อัพเดทราคา" เพื่อดึงราคาล่าสุด</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}


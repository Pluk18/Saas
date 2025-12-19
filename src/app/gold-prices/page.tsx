'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import GoldPriceCard from '@/components/Dashboard/GoldPriceCard'
import { TrendingUp, RefreshCw, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatThaiDate } from '@/lib/utils'

export default function GoldPricesPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - จะเชื่อมต่อกับ API จริงในภายหลัง
  const currentPrices = {
    bar: {
      buy: 38800,
      sell: 39000,
      change: 150,
    },
    jewelry: {
      buy: 38300,
      sell: 39500,
      change: 200,
    },
    lastUpdate: new Date(),
  }

  const priceHistory = [
    { date: '2024-12-19', barBuy: 38800, barSell: 39000, jewelryBuy: 38300, jewelrySell: 39500 },
    { date: '2024-12-18', barBuy: 38650, barSell: 38850, jewelryBuy: 38100, jewelrySell: 39300 },
    { date: '2024-12-17', barBuy: 38500, barSell: 38700, jewelryBuy: 37950, jewelrySell: 39150 },
    { date: '2024-12-16', barBuy: 38450, barSell: 38650, jewelryBuy: 37900, jewelrySell: 39100 },
    { date: '2024-12-15', barBuy: 38300, barSell: 38500, jewelryBuy: 37750, jewelrySell: 38950 },
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
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
              อ้างอิงจากสมาคมค้าทองคำ ณ วันที่ {formatThaiDate(currentPrices.lastUpdate)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoldPriceCard
              type="bar"
              buyPrice={currentPrices.bar.buy}
              sellPrice={currentPrices.bar.sell}
              change={currentPrices.bar.change}
            />
            <GoldPriceCard
              type="jewelry"
              buyPrice={currentPrices.jewelry.buy}
              sellPrice={currentPrices.jewelry.sell}
              change={currentPrices.jewelry.change}
            />
          </div>
        </div>

        {/* Price Difference Calculator */}
        <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
            คำนวณราคาทอง
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">น้ำหนัก (บาท)</label>
              <input type="number" className="input" placeholder="0.00" step="0.01" />
            </div>
            <div>
              <label className="label">ประเภททอง</label>
              <select className="input">
                <option>ทองคำแท่ง</option>
                <option>ทองรูปพรรณ</option>
              </select>
            </div>
            <div>
              <label className="label">ประเภทราคา</label>
              <select className="input">
                <option>ราคารับซื้อ</option>
                <option>ราคาขายออก</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">
                คำนวณ
              </button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg border border-primary-200">
            <p className="text-sm text-neutral-600 mb-1">ราคารวม</p>
            <p className="text-3xl font-bold text-primary-700 font-display">
              {formatCurrency(0)}
            </p>
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
                {priceHistory.map((price, index) => {
                  const isToday = index === 0
                  const diff = price.jewelrySell - price.barSell
                  return (
                    <tr key={price.date} className={isToday ? 'bg-primary-50' : ''}>
                      <td className="font-medium">
                        {formatThaiDate(price.date)}
                        {isToday && <span className="ml-2 badge badge-success">วันนี้</span>}
                      </td>
                      <td className="text-right font-medium text-green-700">
                        {formatCurrency(price.barBuy)}
                      </td>
                      <td className="text-right font-medium text-primary-700">
                        {formatCurrency(price.barSell)}
                      </td>
                      <td className="text-right font-medium text-green-700">
                        {formatCurrency(price.jewelryBuy)}
                      </td>
                      <td className="text-right font-medium text-primary-700">
                        {formatCurrency(price.jewelrySell)}
                      </td>
                      <td className="text-center">
                        <span className="badge badge-info">
                          +{formatCurrency(diff)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
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


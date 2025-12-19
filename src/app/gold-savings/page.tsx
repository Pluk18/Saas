'use client'

import MainLayout from '@/components/Layout/MainLayout'
import { PiggyBank, Plus, Search, TrendingUp } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function GoldSavingsPage() {
  // Mock data
  const accounts = [
    {
      id: '1',
      code: 'SAVE-001',
      customerName: 'คุณสมชาย ใจดี',
      customerPhone: '0812345678',
      targetWeight: 5.0,
      currentWeight: 2.5,
      totalDeposited: 97500,
      averagePrice: 39000,
      startDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      code: 'SAVE-002',
      customerName: 'คุณสมหญิง ศรีสุข',
      customerPhone: '0898765432',
      targetWeight: 2.0,
      currentWeight: 1.8,
      totalDeposited: 70200,
      averagePrice: 39000,
      startDate: '2024-03-10',
      status: 'active',
    },
    {
      id: '3',
      code: 'SAVE-003',
      customerName: 'คุณประสิทธิ์ มั่งคั่ง',
      customerPhone: '0856781234',
      targetWeight: 10.0,
      currentWeight: 8.5,
      totalDeposited: 331500,
      averagePrice: 39000,
      startDate: '2023-12-01',
      status: 'active',
    },
  ]

  const currentGoldPrice = 39000 // ราคาทองปัจจุบัน

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              ออมทอง
            </h1>
            <p className="text-neutral-600">
              บริการออมทองสำหรับลูกค้า - ล็อคน้ำหนักทองตามราคาวันทำรายการ
            </p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            เปิดบัญชีใหม่
          </button>
        </div>

        {/* Current Gold Price */}
        <div className="card bg-gradient-to-br from-accent-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">ราคาทองคำแท่งวันนี้</p>
              <p className="text-3xl font-bold text-primary-700 font-display">
                {formatCurrency(currentGoldPrice)}/บาท
              </p>
              <p className="text-xs text-neutral-600 mt-2">
                ฝาก 1,000 บาท = ได้ทอง {formatNumber(1000 / currentGoldPrice, 4)} บาท
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <TrendingUp size={20} className="text-green-700" />
              <span className="font-semibold text-green-700">+150 บาท</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <PiggyBank size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">บัญชีทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">245</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-neutral-600 mb-1">เงินฝากรวม</p>
              <p className="text-xl font-bold text-green-700 font-display">
                {formatCurrency(15750000)}
              </p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-neutral-600 mb-1">น้ำหนักทองรวม</p>
              <p className="text-xl font-bold text-accent-700 font-display">
                {formatNumber(405.5, 2)} บาท
              </p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-neutral-600 mb-1">มูลค่าปัจจุบัน</p>
              <p className="text-xl font-bold text-primary-700 font-display">
                {formatCurrency(405.5 * currentGoldPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหารหัสบัญชี, ชื่อลูกค้า..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>รหัสบัญชี</th>
                  <th>ลูกค้า</th>
                  <th className="text-right">เป้าหมาย (บาท)</th>
                  <th className="text-right">สะสมแล้ว (บาท)</th>
                  <th className="text-right">เงินฝากรวม</th>
                  <th className="text-right">ราคาเฉลี่ย</th>
                  <th className="text-center">ความคืบหน้า</th>
                  <th>เปิดบัญชีเมื่อ</th>
                  <th className="text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const progress = (account.currentWeight / account.targetWeight) * 100
                  const currentValue = account.currentWeight * currentGoldPrice
                  const profitLoss = currentValue - account.totalDeposited
                  const profitLossPercent = (profitLoss / account.totalDeposited) * 100

                  return (
                    <tr key={account.id}>
                      <td className="font-mono font-medium text-primary-700">
                        {account.code}
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">{account.customerName}</p>
                          <p className="text-xs text-neutral-500">{account.customerPhone}</p>
                        </div>
                      </td>
                      <td className="text-right font-medium">
                        {formatNumber(account.targetWeight, 2)} บาท
                      </td>
                      <td className="text-right">
                        <p className="font-semibold text-accent-700">
                          {formatNumber(account.currentWeight, 2)} บาท
                        </p>
                        <p className="text-xs text-neutral-500">
                          ({formatNumber(account.currentWeight * 15.244, 2)}g)
                        </p>
                      </td>
                      <td className="text-right">
                        <p className="font-medium">{formatCurrency(account.totalDeposited)}</p>
                        <p className={`text-xs ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                          ({profitLossPercent >= 0 ? '+' : ''}{formatNumber(profitLossPercent, 1)}%)
                        </p>
                      </td>
                      <td className="text-right font-medium text-neutral-700">
                        {formatCurrency(account.averagePrice)}
                      </td>
                      <td>
                        <div className="px-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-neutral-700">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                progress >= 100
                                  ? 'bg-green-600'
                                  : progress >= 75
                                  ? 'bg-accent-600'
                                  : 'bg-primary-600'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-neutral-700">
                        {new Date(account.startDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="text-center space-x-2">
                        <button className="btn btn-primary btn-sm">
                          ฝากเงิน
                        </button>
                        <button className="btn btn-outline btn-sm">
                          ดูรายละเอียด
                        </button>
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
          <h4 className="font-semibold text-neutral-800 mb-3">ℹ️ วิธีการออมทอง</h4>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• ลูกค้าฝากเงินเพื่อ "ล็อค" น้ำหนักทองตามราคาวันที่ทำรายการ</li>
            <li>• น้ำหนักทอง = จำนวนเงินฝาก ÷ ราคาทองวันนั้น</li>
            <li>• เมื่อครบเป้าหมายสามารถแลกเป็นทองได้เลย หรือถอนเป็นเงินตามราคาวันถอน</li>
            <li>• มูลค่าปัจจุบันคำนวณจากน้ำหนักทอง × ราคาทองวันนี้</li>
            <li>• <strong className="text-green-700">กำไร/ขาดทุน</strong> = มูลค่าปัจจุบัน - เงินฝากรวม</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}


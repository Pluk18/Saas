'use client'

import MainLayout from '@/components/Layout/MainLayout'
import StatsCard from '@/components/Dashboard/StatsCard'
import GoldPriceCard from '@/components/Dashboard/GoldPriceCard'
import { useDashboard } from '@/hooks/useDashboard'
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp,
  ShoppingCart,
  Coins,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { stats, goldPrice, loading } = useDashboard()

  const recentTransactions = [
    { id: '1', code: 'INV-20241219-001', customer: 'คุณสมชาย ใจดี', amount: 125000, time: '10:30', type: 'ขาย' },
    { id: '2', code: 'INV-20241219-002', customer: 'คุณสมหญิง ศรีสุข', amount: 89000, time: '11:15', type: 'ขาย' },
    { id: '3', code: 'CON-20241219-001', customer: 'คุณประสิทธิ์ มั่งคั่ง', amount: 150000, time: '12:00', type: 'ขายฝาก' },
  ]

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            แดชบอร์ด
          </h1>
          <p className="text-neutral-600">ภาพรวมระบบจัดการร้านทองคำ</p>
        </div>

        {/* Gold Prices Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={24} />
            ราคาทองคำวันนี้
          </h2>
          {loading || !goldPrice ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">กำลังโหลดราคาทอง...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoldPriceCard
                type="bar"
                buyPrice={goldPrice.gold_bar_buy}
                sellPrice={goldPrice.gold_bar_sell}
              />
              <GoldPriceCard
                type="jewelry"
                buyPrice={goldPrice.gold_jewelry_buy}
                sellPrice={goldPrice.gold_jewelry_sell}
              />
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-neutral-800 mb-4">
            สถิติวันนี้
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="h-20 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="ยอดขายวันนี้"
                value={formatCurrency(stats.todaySales)}
                icon={DollarSign}
                color="success"
              />
              <StatsCard
                title="จำนวนรายการ"
                value={stats.transactionCount}
                icon={ShoppingCart}
                color="primary"
              />
              <StatsCard
                title="สินค้าในสต๊อก"
                value={stats.inventoryCount}
                icon={Package}
                color="info"
              />
              <StatsCard
                title="มูลค่าคงคลัง"
                value={formatCurrency(stats.inventoryValue)}
                icon={TrendingUp}
                color="warning"
              />
            </div>
          )}
        </div>

        {/* Recent Transactions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  รายการล่าสุด
                </h3>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  ดูทั้งหมด →
                </button>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'ขาย' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'ขาย' ? (
                          <ShoppingCart size={18} className="text-green-700" />
                        ) : (
                          <Coins size={18} className="text-blue-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{transaction.customer}</p>
                        <p className="text-sm text-neutral-600">{transaction.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock size={14} />
                        {transaction.time} น.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
              เมนูด่วน
            </h3>
            <div className="space-y-3">
              <Link href="/pos" className="btn btn-primary w-full justify-center">
                <ShoppingCart size={18} />
                ขายสินค้า (POS)
              </Link>
              <Link href="/inventory" className="btn btn-outline w-full justify-center">
                <Package size={18} />
                เพิ่มสินค้าใหม่
              </Link>
              <Link href="/consignments" className="btn btn-outline w-full justify-center">
                <Coins size={18} />
                ขายฝาก/จำนำ
              </Link>
              <Link href="/customers" className="btn btn-outline w-full justify-center">
                <Users size={18} />
                เพิ่มลูกค้าใหม่
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                คลังสินค้า
              </h4>
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">สินค้าทั้งหมด</span>
                    <span className="font-semibold text-neutral-900">{stats.inventoryCount} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">มูลค่าคงคลัง</span>
                    <span className="font-semibold text-primary-700">
                      {formatCurrency(stats.inventoryValue)}
                    </span>
                  </div>
                  <Link 
                    href="/inventory" 
                    className="block text-sm text-primary-600 hover:text-primary-700 mt-3"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


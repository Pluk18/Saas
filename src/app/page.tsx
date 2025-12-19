'use client'

import MainLayout from '@/components/Layout/MainLayout'
import StatsCard from '@/components/Dashboard/StatsCard'
import GoldPriceCard from '@/components/Dashboard/GoldPriceCard'
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp,
  ShoppingCart,
  Handshake,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  // Mock data - จะเชื่อมต่อกับ Supabase จริงในภายหลัง
  const todayStats = {
    sales: 1250000,
    transactions: 8,
    customers: 12,
    profit: 180000,
  }

  const goldPrices = {
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
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoldPriceCard
              type="bar"
              buyPrice={goldPrices.bar.buy}
              sellPrice={goldPrices.bar.sell}
              change={goldPrices.bar.change}
            />
            <GoldPriceCard
              type="jewelry"
              buyPrice={goldPrices.jewelry.buy}
              sellPrice={goldPrices.jewelry.sell}
              change={goldPrices.jewelry.change}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div>
          <h2 className="text-xl font-display font-semibold text-neutral-800 mb-4">
            สถิติวันนี้
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="ยอดขายวันนี้"
              value={formatCurrency(todayStats.sales)}
              icon={DollarSign}
              color="success"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard
              title="จำนวนรายการ"
              value={todayStats.transactions}
              icon={ShoppingCart}
              color="primary"
            />
            <StatsCard
              title="ลูกค้าวันนี้"
              value={todayStats.customers}
              icon={Users}
              color="info"
            />
            <StatsCard
              title="กำไรสุทธิ"
              value={formatCurrency(todayStats.profit)}
              icon={TrendingUp}
              color="warning"
              trend={{ value: 8.3, isPositive: true }}
            />
          </div>
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
                          <Handshake size={18} className="text-blue-700" />
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
              <button className="btn btn-primary w-full justify-center">
                <ShoppingCart size={18} />
                ขายสินค้า (POS)
              </button>
              <button className="btn btn-outline w-full justify-center">
                <Package size={18} />
                เพิ่มสินค้าใหม่
              </button>
              <button className="btn btn-outline w-full justify-center">
                <Handshake size={18} />
                ขายฝาก/จำนำ
              </button>
              <button className="btn btn-outline w-full justify-center">
                <Users size={18} />
                เพิ่มลูกค้าใหม่
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                คลังสินค้า
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">สินค้าทั้งหมด</span>
                  <span className="font-semibold text-neutral-900">245 ชิ้น</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">น้ำหนักรวม</span>
                  <span className="font-semibold text-neutral-900">85.5 บาท</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">มูลค่าคงคลัง</span>
                  <span className="font-semibold text-primary-700">
                    {formatCurrency(3250000)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


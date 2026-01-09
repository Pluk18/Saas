'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { PiggyBank, Plus, Search, TrendingUp, TrendingDown, Eye, Edit, Trash2, Loader } from 'lucide-react'
import { formatCurrency, formatWeight } from '@/lib/utils'
import { useGoldSavings } from '@/hooks/useGoldSavings'
import { useCustomers } from '@/hooks/useCustomers'
import GoldSavingModal from '@/components/GoldSavings/GoldSavingModal'
import DepositModal from '@/components/GoldSavings/DepositModal'
import WithdrawModal from '@/components/GoldSavings/WithdrawModal'
import DetailModal from '@/components/GoldSavings/DetailModal'

export default function GoldSavingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'withdrawn'>('all')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSaving, setSelectedSaving] = useState<any>(null)

  const filters = {
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
  }

  const { savings, loading, addSaving, deposit, withdraw, refreshSavings } = useGoldSavings(filters)
  const { customers } = useCustomers()

  const handleDeposit = async (depositData: any) => {
    await deposit(depositData)
    refreshSavings()
  }

  const handleWithdraw = async (withdrawalData: any) => {
    await withdraw(withdrawalData)
    refreshSavings()
  }

  // Calculate stats
  const stats = {
    totalAccounts: savings.length,
    totalBalance: savings.reduce((sum, s) => sum + (s.balance || 0), 0),
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  }

  const statusLabels = {
    active: 'กำลังดำเนินการ',
    completed: 'สำเร็จ',
    withdrawn: 'ถอนแล้ว',
  }

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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            เปิดบัญชีใหม่
          </button>
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
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {stats.totalAccounts}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-neutral-600 mb-1">ยอดเงินรวม</p>
              <p className="text-xl font-bold text-green-700 font-display">
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="ค้นหารหัสบัญชี, ชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-lg border border-neutral-300 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">กำลังดำเนินการ</option>
              <option value="completed">สำเร็จ</option>
              <option value="withdrawn">ถอนแล้ว</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-2" size={24} />
              <span className="text-neutral-600">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        ) : savings.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <PiggyBank size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600 mb-2">ยังไม่มีบัญชีออมทอง</p>
              <p className="text-sm text-neutral-500">
                คลิก "เปิดบัญชีใหม่" เพื่อสร้างบัญชีออมทองสำหรับลูกค้า
              </p>
            </div>
          </div>
        ) : (
          /* Accounts Table */
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>รหัสบัญชี</th>
                    <th>ลูกค้า</th>
                    <th className="text-right">ยอดเงินคงเหลือ</th>
                    <th className="text-center">สถานะ</th>
                    <th className="text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.map((saving) => {
                    return (
                      <tr key={saving.id}>
                        <td className="font-mono font-medium text-primary-700">
                          {saving.account_code}
                        </td>
                        <td>
                          <div>
                            <p className="font-medium">
                              {saving.customer?.first_name} {saving.customer?.last_name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {saving.customer?.phone}
                            </p>
                          </div>
                        </td>
                        <td className="text-right font-semibold text-green-700">
                          {formatCurrency(saving.balance || 0)}
                        </td>
                        <td className="text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[saving.status]
                            }`}
                          >
                            {statusLabels[saving.status]}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {saving.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedSaving(saving)
                                    setIsDepositModalOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                  title="ฝากเงิน"
                                >
                                  <TrendingUp size={18} />
                                </button>
                                {(saving.balance || 0) > 0 && (
                                  <button
                                    onClick={() => {
                                      setSelectedSaving(saving)
                                      setIsWithdrawModalOpen(true)
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                    title="ถอนทอง"
                                  >
                                    <TrendingDown size={18} />
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedSaving(saving)
                                setIsDetailModalOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="ดูรายละเอียด"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

      {/* Modals */}
      <GoldSavingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addSaving}
        customers={customers}
        mode="create"
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false)
          setSelectedSaving(null)
        }}
        saving={selectedSaving}
        onSuccess={handleDeposit}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false)
          setSelectedSaving(null)
        }}
        saving={selectedSaving}
        onSuccess={handleWithdraw}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedSaving(null)
        }}
        savingId={selectedSaving?.id || null}
        onDepositClick={() => {
          setIsDetailModalOpen(false)
          setIsDepositModalOpen(true)
        }}
        onWithdrawClick={() => {
          setIsDetailModalOpen(false)
          setIsWithdrawModalOpen(true)
        }}
      />
    </MainLayout>
  )
}

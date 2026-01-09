'use client'

import Modal from '@/components/Common/Modal'
import { formatCurrency, formatWeight, formatThaiDate } from '@/lib/utils'
import { User, Calendar, Weight, DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { useGoldSavingDetail } from '@/hooks/useGoldSavings'

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  savingId: string | null
  onDepositClick?: () => void
  onWithdrawClick?: () => void
}

export default function DetailModal({
  isOpen,
  onClose,
  savingId,
  onDepositClick,
  onWithdrawClick,
}: DetailModalProps) {
  const { saving, summary, loading } = useGoldSavingDetail(savingId)

  if (!saving || loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดบัญชีออมทอง">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </Modal>
    )
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
    <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดบัญชีออมทอง">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-2xl font-bold">{saving.account_code}</h3>
              <p className="text-amber-100 text-sm">บัญชีออมทอง</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[saving.status]}`}>
              {statusLabels[saving.status]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-50">
            <User size={16} />
            <span>
              {saving.customer?.first_name} {saving.customer?.last_name}
            </span>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <DollarSign size={18} />
            ยอดคงเหลือปัจจุบัน
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">ยอดเงินคงเหลือ:</span>
              <span className="text-3xl font-bold text-green-700">
                {formatCurrency(saving.balance || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">สรุปภาพรวม</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนรายการ:</span>
                <span className="font-medium">{summary.transactionCount} รายการ</span>
              </div>
              {summary.targetAmount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เป้าหมาย:</span>
                    <span className="font-bold text-blue-700">
                      {formatCurrency(summary.targetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ความคืบหน้า:</span>
                    <span className="font-medium">{summary.progressPercentage.toFixed(1)}%</span>
                  </div>
                  {summary.targetReached && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-center">
                      <span className="text-green-700 font-bold">🎉 ถึงเป้าหมายแล้ว!</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Target Progress */}
        {saving.target_amount && summary && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Target size={18} />
              ความคืบหน้าเป้าหมาย
            </h3>
            <div className="space-y-2">
              {saving.target_amount && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>เป้าหมาย:</span>
                    <span className="font-medium">
                      {formatCurrency(saving.balance || 0)} / {formatCurrency(saving.target_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(summary.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-1 font-semibold text-purple-700">
                    {summary.progressPercentage.toFixed(1)}%
                  </p>
                </div>
              )}
              {summary.targetReached && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-2 mt-2">
                  <p className="text-sm text-green-800 text-center font-semibold">
                    🎉 ถึงเป้าหมายแล้ว!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction History */}
        {saving.transactions && saving.transactions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} />
              ประวัติรายการ ({saving.transactions.length} รายการ)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {saving.transactions
                .sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                .map((trans: any) => (
                  <div
                    key={trans.id}
                    className="flex justify-between items-center text-sm border-b border-gray-200 pb-2"
                  >
                    <div className="flex items-center gap-2">
                      {trans.transaction_type === 'deposit' ? (
                        <TrendingUp className="text-green-600" size={16} />
                      ) : (
                        <TrendingDown className="text-red-600" size={16} />
                      )}
                      <div>
                        <p className="font-medium">
                          {trans.transaction_type === 'deposit' ? 'ฝาก' : 'ถอน'}
                        </p>
                        <p className="text-xs text-gray-500">{formatThaiDate(trans.transaction_date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${trans.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {trans.transaction_type === 'deposit' ? '+' : '-'}
                        {formatWeight(trans.weight_baht)}
                      </p>
                      <p className="text-xs text-gray-600">{formatCurrency(trans.amount)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {saving.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">หมายเหตุ</h3>
            <p className="text-sm text-gray-700">{saving.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          {saving.status === 'active' && (
            <>
              <button
                onClick={() => {
                  onDepositClick?.()
                  onClose()
                }}
                className="w-full btn-success flex items-center justify-center gap-2"
              >
                <TrendingUp size={18} />
                ฝากเงิน
              </button>
              {saving.total_weight_baht > 0 && (
                <button
                  onClick={() => {
                    onWithdrawClick?.()
                    onClose()
                  }}
                  className="w-full btn-danger flex items-center justify-center gap-2"
                >
                  <TrendingDown size={18} />
                  ถอนทอง
                </button>
              )}
            </>
          )}
          <button onClick={onClose} className="w-full btn-secondary">
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  )
}

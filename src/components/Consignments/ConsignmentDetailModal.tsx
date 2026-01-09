'use client'

import Modal from '@/components/Common/Modal'
import { useConsignmentDetail } from '@/hooks/useConsignments'
import { formatCurrency, formatNumber, formatThaiDate } from '@/lib/utils'
import { 
  User, 
  Calendar, 
  Weight, 
  DollarSign, 
  Percent, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ConsignmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  consignmentId: string | null
  onPaymentClick?: (consignment: any, interest: any) => void
}

export default function ConsignmentDetailModal({
  isOpen,
  onClose,
  consignmentId,
  onPaymentClick,
}: ConsignmentDetailModalProps) {
  const { consignment, interest, loading, refreshInterest } = useConsignmentDetail(consignmentId)

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดการขายฝาก">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    )
  }

  if (!consignment) {
    return null
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    extended: 'bg-yellow-100 text-yellow-800',
    redeemed: 'bg-blue-100 text-blue-800',
    foreclosed: 'bg-red-100 text-red-800',
  }

  const statusLabels = {
    active: 'กำลังดำเนินการ',
    extended: 'ต่ออายุแล้ว',
    redeemed: 'ไถ่ถอนแล้ว',
    foreclosed: 'ยึดทรัพย์แล้ว',
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`รายละเอียดการขายฝาก - ${consignment.consignment_code}`}
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[consignment.status]}`}>
            {statusLabels[consignment.status]}
          </span>
          {interest?.isOverdue && (
            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
              <AlertCircle size={16} />
              เกินกำหนด {interest.daysOverdue} วัน
            </span>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <User size={18} />
            ข้อมูลลูกค้า
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ชื่อ-นามสกุล:</span>
              <span className="font-medium">
                {consignment.customer.first_name} {consignment.customer.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เบอร์โทร:</span>
              <span className="font-medium">{consignment.customer.phone}</span>
            </div>
            {consignment.customer.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">ที่อยู่:</span>
                <span className="font-medium text-right max-w-xs">
                  {consignment.customer.address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Weight size={18} />
            ข้อมูลสินค้า
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">รายละเอียด:</span>
              <p className="font-medium mt-1">{consignment.product_description}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">น้ำหนัก:</span>
              <span className="font-medium">
                {formatNumber(consignment.weight_baht, 4)} บาท ({formatNumber(consignment.weight_grams, 3)} กรัม)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เปอร์เซ็นต์ทอง:</span>
              <span className="font-medium">{consignment.gold_percentage}%</span>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign size={18} />
            ข้อมูลการเงิน
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">เงินต้น:</span>
              <span className="font-bold text-blue-700">{formatCurrency(consignment.principal_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">อัตราดอกเบี้ย:</span>
              <span className="font-medium">
                {consignment.interest_rate}% 
                {consignment.interest_type === 'monthly' ? ' ต่อเดือน' : ' ต่อวัน'}
              </span>
            </div>
          </div>
        </div>

        {/* Interest Calculation */}
        {interest && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Percent size={18} />
                คำนวณดอกเบี้ย
              </h3>
              <button
                onClick={refreshInterest}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                คำนวณใหม่
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ดอกเบี้ยทั้งหมด:</span>
                <span className="font-medium">{formatCurrency(interest.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ดอกเบี้ยที่ชำระแล้ว:</span>
                <span className="font-medium text-green-600">{formatCurrency(interest.paidInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ดอกเบี้ยค้างชำระ:</span>
                <span className="font-medium text-orange-600">{formatCurrency(interest.remainingInterest)}</span>
              </div>
              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-800">ยอดรวมที่ต้องชำระ:</span>
                  <span className="font-bold text-green-700">{formatCurrency(interest.totalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>จำนวนวันที่ผ่าน:</span>
                <span>{interest.daysPassed} วัน</span>
              </div>
            </div>
          </div>
        )}

        {/* Date Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={18} />
            ข้อมูลวันที่
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">วันที่เริ่ม:</span>
              <span className="font-medium">{formatThaiDate(consignment.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">วันครบกำหนด:</span>
              <span className={`font-medium ${interest?.isOverdue ? 'text-red-600' : ''}`}>
                {formatThaiDate(consignment.due_date)}
              </span>
            </div>
            {consignment.total_months && (
              <div className="flex justify-between">
                <span className="text-gray-600">ระยะเวลา:</span>
                <span className="font-medium">{consignment.total_months} เดือน</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        {consignment.payments && consignment.payments.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={18} />
              ประวัติการชำระเงิน
            </h3>
            <div className="space-y-2">
              {consignment.payments.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                  <div>
                    <span className="font-medium">{formatThaiDate(payment.payment_date)}</span>
                    <span className="text-gray-600 text-xs ml-2">
                      ({payment.payment_type === 'interest' ? 'ดอกเบี้ย' : payment.payment_type === 'principal' ? 'เงินต้น' : 'ชำระเต็มจำนวน'})
                    </span>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {consignment.notes && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">หมายเหตุ</h3>
            <p className="text-sm text-gray-700">{consignment.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          {/* ปุ่มรับชำระเงิน - แสดงเฉพาะสัญญา active/extended */}
          {(consignment.status === 'active' || consignment.status === 'extended') && onPaymentClick && interest && (
            <button 
              onClick={() => {
                onPaymentClick(consignment, interest)
                onClose()
              }}
              className="w-full btn-success flex items-center justify-center gap-2"
            >
              <DollarSign size={18} />
              รับชำระเงิน
            </button>
          )}
          <button onClick={onClose} className="w-full btn-secondary">
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  )
}


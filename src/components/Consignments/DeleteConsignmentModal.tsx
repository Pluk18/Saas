'use client'

import Modal from '@/components/Common/Modal'
import { AlertTriangle } from 'lucide-react'

interface DeleteConsignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  consignment: any
}

export default function DeleteConsignmentModal({
  isOpen,
  onClose,
  onConfirm,
  consignment,
}: DeleteConsignmentModalProps) {
  if (!consignment) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ยืนยันการลบ">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900 mb-1">
              คุณแน่ใจหรือไม่ที่จะลบการขายฝากนี้?
            </p>
            <p className="text-sm text-red-700">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">รายละเอียดการขายฝาก:</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">รหัส:</span>{' '}
              <span className="font-medium">{consignment.consignment_code}</span>
            </p>
            <p>
              <span className="text-gray-600">ลูกค้า:</span>{' '}
              <span className="font-medium">
                {consignment.customer?.first_name} {consignment.customer?.last_name}
              </span>
            </p>
            <p>
              <span className="text-gray-600">สินค้า:</span>{' '}
              <span className="font-medium">{consignment.product_description}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 btn-secondary">
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            ลบการขายฝาก
          </button>
        </div>
      </div>
    </Modal>
  )
}


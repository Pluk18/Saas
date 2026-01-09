'use client'

import { AlertCircle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  loading?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  loading = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-neutral-900">
                  ยืนยันการลบสินค้า
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>สินค้า:</strong> {productName}
              </p>
              <p className="text-xs text-red-700 mt-2">
                การลบจะเป็นแบบ Soft Delete (ข้อมูลจะยังอยู่ในระบบ แต่ไม่แสดงผล)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


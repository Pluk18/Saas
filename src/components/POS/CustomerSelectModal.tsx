'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Common/Modal'
import { useCustomers } from '@/hooks/useCustomers'
import { Search, User, Phone, Mail } from 'lucide-react'
import type { Customer } from '@/lib/supabase'
import { formatThaiPhone } from '@/lib/utils'

interface CustomerSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (customer: Customer | null) => void
  selectedCustomer: Customer | null
}

export default function CustomerSelectModal({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedCustomer 
}: CustomerSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { customers, loading } = useCustomers({ search: searchQuery })

  const handleSelect = (customer: Customer) => {
    onSelect(customer)
    onClose()
  }

  const handleWalkIn = () => {
    onSelect(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="เลือกลูกค้า"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Walk-in Customer */}
        <button
          onClick={handleWalkIn}
          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
            !selectedCustomer
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-primary-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
              <User size={24} className="text-neutral-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">ลูกค้าทั่วไป (Walk-in)</p>
              <p className="text-sm text-neutral-600">ไม่ระบุข้อมูลลูกค้า</p>
            </div>
          </div>
        </button>

        {/* Customer List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-neutral-600">กำลังโหลด...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <User size={48} className="mx-auto mb-3 opacity-50" />
              <p>ไม่พบลูกค้า</p>
            </div>
          ) : (
            customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelect(customer)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedCustomer?.id === customer.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-semibold text-primary-700 text-lg">
                      {customer.first_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      {customer.phone && (
                        <span className="text-sm text-neutral-600 flex items-center gap-1">
                          <Phone size={12} />
                          {formatThaiPhone(customer.phone)}
                        </span>
                      )}
                      {customer.email && (
                        <span className="text-sm text-neutral-600 flex items-center gap-1">
                          <Mail size={12} />
                          {customer.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      customer.customer_type === 'vip' ? 'badge-warning' :
                      customer.customer_type === 'wholesale' ? 'badge-info' :
                      'badge-neutral'
                    }`}>
                      {customer.customer_type === 'vip' ? 'VIP' :
                       customer.customer_type === 'wholesale' ? 'ขายส่ง' :
                       'ทั่วไป'}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </Modal>
  )
}


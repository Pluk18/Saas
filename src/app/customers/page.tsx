'use client'

import { useState } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import CustomerModal from '@/components/Customers/CustomerModal'
import DeleteConfirmModal from '@/components/Inventory/DeleteConfirmModal'
import { useCustomers } from '@/hooks/useCustomers'
import { Users, Plus, Search, Phone, Mail, Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatThaiPhone } from '@/lib/utils'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<any>(null)

  const { customers, loading, addCustomer, editCustomer, removeCustomer } = useCustomers({
    type: selectedType,
    search: searchQuery
  })

  const customerTypes = {
    regular: { label: 'ทั่วไป', color: 'badge-neutral' },
    vip: { label: 'VIP', color: 'badge-warning' },
    wholesale: { label: 'ขายส่ง', color: 'badge-info' },
  }

  // Stats
  const totalCustomers = customers.length
  const vipCustomers = customers.filter(c => c.customer_type === 'vip').length
  const wholesaleCustomers = customers.filter(c => c.customer_type === 'wholesale').length
  const newThisMonth = customers.filter(c => {
    const createdDate = new Date(c.created_at)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear()
  }).length

  const handleAddCustomer = () => {
    setModalMode('create')
    setSelectedCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: any) => {
    setModalMode('edit')
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (customer: any) => {
    setCustomerToDelete(customer)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await removeCustomer(customerToDelete.id)
      setIsDeleteModalOpen(false)
      setCustomerToDelete(null)
    }
  }

  const handleSaveCustomer = async (customerData: any) => {
    if (modalMode === 'create') {
      await addCustomer(customerData)
    } else if (selectedCustomer) {
      await editCustomer(selectedCustomer.id, customerData)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              จัดการลูกค้า
            </h1>
            <p className="text-neutral-600">ข้อมูลลูกค้าและประวัติการซื้อ</p>
          </div>
          <button 
            onClick={handleAddCustomer}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            เพิ่มลูกค้าใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Users size={20} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้า VIP</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : vipCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ขายส่ง</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : wholesaleCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">ลูกค้าใหม่ (เดือนนี้)</p>
                <p className="text-2xl font-bold text-neutral-900 font-display">
                  {loading ? '...' : newThisMonth}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select 
              className="input max-w-xs"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">ประเภทลูกค้า: ทั้งหมด</option>
              <option value="regular">ทั่วไป</option>
              <option value="vip">VIP</option>
              <option value="wholesale">ขายส่ง</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-600 mb-2">ไม่พบข้อมูลลูกค้า</p>
              <button onClick={handleAddCustomer} className="btn btn-primary btn-sm">
                เพิ่มลูกค้าใหม่
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>รหัสลูกค้า</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th>เบอร์โทรศัพท์</th>
                      <th>อีเมล</th>
                      <th>ประเภท</th>
                      <th className="text-right">ยอดซื้อสะสม</th>
                      <th>สมัครเมื่อ</th>
                      <th className="text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="font-mono font-medium text-primary-700">
                          {customer.customer_code}
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="font-semibold text-primary-700">
                                {customer.first_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {customer.phone ? (
                            <div className="flex items-center gap-2 text-neutral-700">
                              <Phone size={14} />
                              {formatThaiPhone(customer.phone)}
                            </div>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td>
                          {customer.email ? (
                            <div className="flex items-center gap-2 text-neutral-700">
                              <Mail size={14} />
                              {customer.email}
                            </div>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${customerTypes[customer.customer_type as keyof typeof customerTypes]?.color || 'badge-neutral'}`}>
                            {customerTypes[customer.customer_type as keyof typeof customerTypes]?.label || customer.customer_type}
                          </span>
                        </td>
                        <td className="text-right font-semibold text-primary-700">
                          {formatCurrency(customer.total_purchases || 0)}
                        </td>
                        <td className="text-neutral-700">
                          {new Date(customer.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(customer)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
                <p className="text-sm text-neutral-600">
                  แสดง {customers.length} รายการ
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        mode={modalMode}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={customerToDelete ? `${customerToDelete.first_name} ${customerToDelete.last_name}` : ''}
      />
    </MainLayout>
  )
}

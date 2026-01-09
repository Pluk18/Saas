'use client'

import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/supabaseAPI'
import type { Customer } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useCustomers(filters?: {
  type?: string
  search?: string
}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers(filters)
      setCustomers(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [filters?.type, filters?.search])

  const addCustomer = async (customerData: any) => {
    try {
      console.log('Adding customer with data:', customerData)
      const newCustomer = await createCustomer(customerData)
      console.log('Customer added successfully:', newCustomer)
      toast.success('เพิ่มลูกค้าสำเร็จ')
      fetchCustomers()
      return newCustomer
    } catch (err: any) {
      console.error('Error adding customer:', err)
      console.error('Error message:', err.message)
      console.error('Error details:', err)
      
      // Show more detailed error message
      const errorMessage = err.message || 'ไม่สามารถเพิ่มลูกค้าได้'
      toast.error(`ไม่สามารถเพิ่มลูกค้าได้: ${errorMessage}`)
      throw err
    }
  }

  const editCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updated = await updateCustomer(id, updates)
      toast.success('แก้ไขข้อมูลลูกค้าสำเร็จ')
      fetchCustomers()
      return updated
    } catch (err) {
      toast.error('ไม่สามารถแก้ไขข้อมูลลูกค้าได้')
      throw err
    }
  }

  const removeCustomer = async (id: string) => {
    try {
      await deleteCustomer(id)
      toast.success('ลบลูกค้าสำเร็จ')
      fetchCustomers()
    } catch (err) {
      toast.error('ไม่สามารถลบลูกค้าได้')
      throw err
    }
  }

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
  }
}


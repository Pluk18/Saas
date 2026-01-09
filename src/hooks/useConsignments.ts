'use client'

import { useState, useEffect } from 'react'
import {
  getConsignments,
  getConsignment,
  createConsignment,
  updateConsignment,
  deleteConsignment,
  calculateConsignmentInterest,
  getOverdueConsignments
} from '@/lib/supabaseAPI'
import type { Consignment } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useConsignments(filters?: {
  status?: string
  customer_id?: string
  search?: string
}) {
  const [consignments, setConsignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchConsignments = async () => {
    try {
      setLoading(true)
      const data = await getConsignments(filters)
      setConsignments(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('ไม่สามารถโหลดข้อมูลการขายฝากได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsignments()
  }, [filters?.status, filters?.customer_id, filters?.search])

  const addConsignment = async (consignmentData: {
    customer_id: string
    product_description: string
    weight_baht: number
    weight_grams: number
    gold_percentage: number
    principal_amount: number
    interest_rate: number
    interest_type: 'monthly' | 'daily'
    start_date: string
    due_date: string
    total_months?: number
    image_urls?: string[]
    notes?: string
  }) => {
    try {
      const newConsignment = await createConsignment(consignmentData)
      setConsignments([newConsignment, ...consignments])
      toast.success('เพิ่มการขายฝากสำเร็จ')
      return newConsignment
    } catch (err) {
      toast.error('ไม่สามารถเพิ่มการขายฝากได้')
      throw err
    }
  }

  const editConsignment = async (
    id: string,
    updates: Partial<{
      product_description: string
      weight_baht: number
      weight_grams: number
      gold_percentage: number
      principal_amount: number
      interest_rate: number
      interest_type: 'monthly' | 'daily'
      due_date: string
      total_months: number
      status: 'active' | 'extended' | 'redeemed' | 'foreclosed'
      image_urls: string[]
      notes: string
    }>
  ) => {
    try {
      const updated = await updateConsignment(id, updates)
      setConsignments(
        consignments.map((c) => (c.id === id ? updated : c))
      )
      toast.success('แก้ไขการขายฝากสำเร็จ')
      return updated
    } catch (err) {
      toast.error('ไม่สามารถแก้ไขการขายฝากได้')
      throw err
    }
  }

  const removeConsignment = async (id: string) => {
    try {
      await deleteConsignment(id)
      setConsignments(consignments.filter((c) => c.id !== id))
      toast.success('ลบการขายฝากสำเร็จ')
    } catch (err) {
      toast.error('ไม่สามารถลบการขายฝากได้')
      throw err
    }
  }

  const redeemConsignment = async (id: string) => {
    return editConsignment(id, { status: 'redeemed' })
  }

  const foreclose = async (id: string) => {
    return editConsignment(id, { status: 'foreclosed' })
  }

  const extendConsignment = async (id: string, newDueDate: string) => {
    return editConsignment(id, { 
      status: 'extended',
      due_date: newDueDate 
    })
  }

  return {
    consignments,
    loading,
    error,
    addConsignment,
    editConsignment,
    removeConsignment,
    redeemConsignment,
    foreclose,
    extendConsignment,
    refetch: fetchConsignments,
  }
}

// Hook สำหรับดูรายละเอียดและคำนวณดอกเบี้ย
export function useConsignmentDetail(consignmentId: string | null) {
  const [consignment, setConsignment] = useState<any>(null)
  const [interest, setInterest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!consignmentId) {
      setConsignment(null)
      setInterest(null)
      return
    }

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const [consignmentData, interestData] = await Promise.all([
          getConsignment(consignmentId),
          calculateConsignmentInterest(consignmentId)
        ])
        setConsignment(consignmentData)
        setInterest(interestData)
        setError(null)
      } catch (err) {
        setError(err as Error)
        toast.error('ไม่สามารถโหลดรายละเอียดได้')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [consignmentId])

  const refreshInterest = async () => {
    if (!consignmentId) return
    
    try {
      const interestData = await calculateConsignmentInterest(consignmentId)
      setInterest(interestData)
    } catch (err) {
      toast.error('ไม่สามารถคำนวณดอกเบี้ยได้')
    }
  }

  return {
    consignment,
    interest,
    loading,
    error,
    refreshInterest
  }
}

// Hook สำหรับดูรายการที่เกินกำหนด
export function useOverdueConsignments() {
  const [overdueConsignments, setOverdueConsignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOverdue = async () => {
    try {
      setLoading(true)
      const data = await getOverdueConsignments()
      setOverdueConsignments(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverdue()
  }, [])

  return {
    overdueConsignments,
    loading,
    error,
    refetch: fetchOverdue
  }
}


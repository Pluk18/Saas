'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getGoldSavings,
  getGoldSaving,
  createGoldSaving,
  updateGoldSaving,
  deleteGoldSaving,
  createGoldSavingDeposit,
  createGoldSavingWithdrawal,
  calculateGoldSavingSummary,
} from '@/lib/supabaseAPI'
import toast from 'react-hot-toast'

export function useGoldSavings(filters?: {
  customer_id?: string
  status?: 'active' | 'completed' | 'withdrawn'
  search?: string
}) {
  const [savings, setSavings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGoldSavings(filters)
      setSavings(data || [])
    } catch (err: any) {
      console.error('Error fetching gold savings:', err)
      setError(err.message)
      toast.error('ไม่สามารถโหลดข้อมูลออมทองได้')
    } finally {
      setLoading(false)
    }
  }, [filters?.customer_id, filters?.status, filters?.search])

  useEffect(() => {
    fetchSavings()
  }, [fetchSavings])

  const addSaving = async (savingData: {
    customer_id: string
    account_code: string
    target_amount?: number
    notes?: string
  }) => {
    try {
      const newSaving = await createGoldSaving(savingData)
      setSavings((prev) => [newSaving, ...prev])
      toast.success('สร้างบัญชีออมทองสำเร็จ')
      return newSaving
    } catch (err: any) {
      console.error('Error creating gold saving:', err)
      toast.error(`ไม่สามารถสร้างบัญชีออมทองได้: ${err.message}`)
      throw err
    }
  }

  const editSaving = async (id: string, updates: any) => {
    try {
      const updatedSaving = await updateGoldSaving(id, updates)
      setSavings((prev) =>
        prev.map((s) => (s.id === id ? updatedSaving : s))
      )
      toast.success('แก้ไขบัญชีออมทองสำเร็จ')
      return updatedSaving
    } catch (err: any) {
      console.error('Error updating gold saving:', err)
      toast.error(`ไม่สามารถแก้ไขบัญชีออมทองได้: ${err.message}`)
      throw err
    }
  }

  const removeSaving = async (id: string) => {
    try {
      await deleteGoldSaving(id)
      setSavings((prev) => prev.filter((s) => s.id !== id))
      toast.success('ลบบัญชีออมทองสำเร็จ')
    } catch (err: any) {
      console.error('Error deleting gold saving:', err)
      toast.error(`ไม่สามารถลบบัญชีออมทองได้: ${err.message}`)
      throw err
    }
  }

  const deposit = async (depositData: {
    gold_saving_id: string
    transaction_date: string
    amount: number
    payment_method: 'cash' | 'transfer' | 'card'
    reference_number?: string
    notes?: string
  }) => {
    try {
      await createGoldSavingDeposit(depositData)
      await fetchSavings() // Refresh to get updated totals
      toast.success('ฝากเงินสำเร็จ')
    } catch (err: any) {
      console.error('Error creating deposit:', err)
      toast.error(`ไม่สามารถฝากเงินได้: ${err.message}`)
      throw err
    }
  }

  const withdraw = async (withdrawalData: {
    gold_saving_id: string
    transaction_date: string
    amount: number
    withdrawal_type: 'gold' | 'cash'
    product_description?: string
    notes?: string
  }) => {
    try {
      await createGoldSavingWithdrawal(withdrawalData)
      await fetchSavings() // Refresh to get updated totals
      toast.success('ถอนสำเร็จ')
    } catch (err: any) {
      console.error('Error creating withdrawal:', err)
      toast.error(`ไม่สามารถถอนได้: ${err.message}`)
      throw err
    }
  }

  return {
    savings,
    loading,
    error,
    addSaving,
    editSaving,
    removeSaving,
    deposit,
    withdraw,
    refreshSavings: fetchSavings,
  }
}

// Hook for single gold saving account details
export function useGoldSavingDetail(savingId: string | null) {
  const [saving, setSaving] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDetail = useCallback(async () => {
    if (!savingId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [savingData, summaryData] = await Promise.all([
        getGoldSaving(savingId),
        calculateGoldSavingSummary(savingId),
      ])
      setSaving(savingData)
      setSummary(summaryData)
    } catch (err: any) {
      console.error('Error fetching gold saving detail:', err)
      toast.error('ไม่สามารถโหลดรายละเอียดได้')
    } finally {
      setLoading(false)
    }
  }, [savingId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return {
    saving,
    summary,
    loading,
    refreshDetail: fetchDetail,
  }
}

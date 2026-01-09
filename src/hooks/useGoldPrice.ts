'use client'

import { useState, useEffect } from 'react'
import { getCurrentGoldPrice, getGoldPriceHistory, updateGoldPrice } from '@/lib/supabaseAPI'
import { fetchCurrentGoldPrice } from '@/lib/mockGoldPriceAPI'
import toast from 'react-hot-toast'

export function useGoldPrice() {
  const [currentPrice, setCurrentPrice] = useState<any>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPrice = async () => {
    try {
      setLoading(true)
      const data = await getCurrentGoldPrice()
      setCurrentPrice(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      // ถ้าไม่มีข้อมูลใน database ใช้ mock data
      console.log('Using mock data for gold price')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (days: number = 7) => {
    try {
      const data = await getGoldPriceHistory(days)
      setPriceHistory(data || [])
    } catch (err) {
      console.error('Error fetching price history:', err)
    }
  }

  useEffect(() => {
    fetchPrice()
    fetchHistory()
  }, [])

  const refreshPrice = async () => {
    try {
      setLoading(true)
      // ดึงราคาจาก Mock API
      const mockData = await fetchCurrentGoldPrice()
      
      // บันทึกลง database
      const saved = await updateGoldPrice({
        price_date: new Date().toISOString().split('T')[0],
        gold_bar_buy: mockData.goldBarBuy,
        gold_bar_sell: mockData.goldBarSell,
        gold_jewelry_buy: mockData.goldJewelryBuy,
        gold_jewelry_sell: mockData.goldJewelrySell,
        source: mockData.source
      })

      setCurrentPrice(saved)
      toast.success('อัพเดทราคาทองสำเร็จ')
      
      // Refresh history
      await fetchHistory()
      
      return saved
    } catch (err) {
      toast.error('ไม่สามารถอัพเดทราคาทองได้')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    currentPrice,
    priceHistory,
    loading,
    error,
    refreshPrice,
    refetch: fetchPrice,
  }
}


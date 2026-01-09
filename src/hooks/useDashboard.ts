'use client'

import { useState, useEffect } from 'react'
import { getDashboardStats } from '@/lib/supabaseAPI'
import { useGoldPrice } from './useGoldPrice'

export function useDashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    transactionCount: 0,
    inventoryValue: 0,
    inventoryCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const { currentPrice, loading: priceLoading } = useGoldPrice()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    goldPrice: currentPrice,
    loading: loading || priceLoading,
    refetch: fetchStats,
  }
}


'use client'

import { useState, useEffect } from 'react'
import {
  getSalesSummary,
  getDailySales,
  getTopSellingProducts,
  getPaymentMethodBreakdown,
  getInventoryReport,
  getCustomerReport,
  getTopCustomers,
  getNewCustomers,
  getConsignmentReport,
  getExpiringConsignments,
  getGoldSavingsReport,
  getNearGoalAccounts
} from '@/lib/supabaseAPI'

export function useReports() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Sales data
  const [salesSummary, setSalesSummary] = useState<any>(null)
  const [dailySales, setDailySales] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([])

  // Initialize date range (default: last 30 days)
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  // Load sales data
  const loadSalesData = async () => {
    if (!startDate || !endDate) return
    
    setLoading(true)
    try {
      const [summary, daily, products, payment] = await Promise.all([
        getSalesSummary(startDate, endDate),
        getDailySales(startDate, endDate),
        getTopSellingProducts(startDate, endDate, 10),
        getPaymentMethodBreakdown(startDate, endDate)
      ])

      setSalesSummary(summary)
      setDailySales(daily)
      setTopProducts(products)
      setPaymentBreakdown(payment)
    } catch (error) {
      console.error('Error loading sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reload when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      loadSalesData()
    }
  }, [startDate, endDate])

  // Inventory functions
  const loadInventoryReport = async () => {
    try {
      const data = await getInventoryReport()
      return data
    } catch (error) {
      console.error('Error loading inventory report:', error)
      return null
    }
  }

  // Customer functions
  const loadCustomerReport = async () => {
    try {
      const data = await getCustomerReport()
      return data
    } catch (error) {
      console.error('Error loading customer report:', error)
      return null
    }
  }

  const loadTopCustomers = async (limit: number = 10) => {
    if (!startDate || !endDate) return []
    
    try {
      const data = await getTopCustomers(startDate, endDate, limit)
      return data
    } catch (error) {
      console.error('Error loading top customers:', error)
      return []
    }
  }

  const loadNewCustomers = async () => {
    if (!startDate || !endDate) return []
    
    try {
      const data = await getNewCustomers(startDate, endDate)
      return data
    } catch (error) {
      console.error('Error loading new customers:', error)
      return []
    }
  }

  // Consignment functions
  const loadConsignmentReport = async (filters?: any) => {
    try {
      const data = await getConsignmentReport(filters)
      return data
    } catch (error) {
      console.error('Error loading consignment report:', error)
      return null
    }
  }

  const loadExpiringConsignments = async (days: number = 7) => {
    try {
      const data = await getExpiringConsignments(days)
      return data
    } catch (error) {
      console.error('Error loading expiring consignments:', error)
      return []
    }
  }

  // Gold Savings functions
  const loadGoldSavingsReport = async (filters?: any) => {
    try {
      const data = await getGoldSavingsReport(filters)
      return data
    } catch (error) {
      console.error('Error loading gold savings report:', error)
      return null
    }
  }

  const loadNearGoalAccounts = async (threshold: number = 90) => {
    try {
      const data = await getNearGoalAccounts(threshold)
      return data
    } catch (error) {
      console.error('Error loading near goal accounts:', error)
      return []
    }
  }

  const updateDateRange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return {
    loading,
    startDate,
    endDate,
    updateDateRange,
    
    // Sales data
    salesSummary,
    dailySales,
    topProducts,
    paymentBreakdown,
    loadSalesData,
    
    // Other reports
    loadInventoryReport,
    loadCustomerReport,
    loadTopCustomers,
    loadNewCustomers,
    loadConsignmentReport,
    loadExpiringConsignments,
    loadGoldSavingsReport,
    loadNearGoalAccounts
  }
}

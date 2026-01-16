'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange
}: DateRangePickerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('custom')

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const today = new Date()
    let newStartDate = ''
    let newEndDate = today.toISOString().split('T')[0]

    switch (period) {
      case 'today':
        newStartDate = newEndDate
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        newStartDate = weekAgo.toISOString().split('T')[0]
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        newStartDate = monthAgo.toISOString().split('T')[0]
        break
      case 'year':
        const yearAgo = new Date(today)
        yearAgo.setFullYear(today.getFullYear() - 1)
        newStartDate = yearAgo.toISOString().split('T')[0]
        break
      default:
        return
    }

    onDateChange(newStartDate, newEndDate)
  }

  return (
    <div className="card">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Quick Period Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange('today')}
            className={`btn ${selectedPeriod === 'today' ? 'btn-primary' : 'btn-outline'}`}
          >
            วันนี้
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline'}`}
          >
            7 วัน
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline'}`}
          >
            30 วัน
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`btn ${selectedPeriod === 'year' ? 'btn-primary' : 'btn-outline'}`}
          >
            1 ปี
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="flex-1 flex gap-4 items-end min-w-[400px]">
          <div className="flex-1">
            <label className="label">วันที่เริ่มต้น</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setSelectedPeriod('custom')
                  onDateChange(e.target.value, endDate)
                }}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="label">วันที่สิ้นสุด</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setSelectedPeriod('custom')
                  onDateChange(startDate, e.target.value)
                }}
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

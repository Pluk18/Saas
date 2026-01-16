'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { getThailandDate } from '@/lib/utils'

export type DateRangePreset = 'today' | 'week' | 'month' | 'custom'

interface DateRangePickerProps {
  onRangeChange: (startDate: string, endDate: string) => void
  defaultPreset?: DateRangePreset
}

export default function DateRangePicker({ 
  onRangeChange,
  defaultPreset = 'month'
}: DateRangePickerProps) {
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (preset) {
      case 'today':
        start = today
        end = today
        break
      case 'week':
        start.setDate(today.getDate() - 7)
        end = today
        break
      case 'month':
        start.setDate(today.getDate() - 30)
        end = today
        break
      case 'custom':
        // Keep current dates
        return
    }

    // Convert to Thailand timezone date string
    const startStr = getThailandDate(start)
    const endStr = getThailandDate(end)
    
    setStartDate(startStr)
    setEndDate(endStr)
    onRangeChange(startStr, endStr)
  }, [preset])

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onRangeChange(startDate, endDate)
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Preset Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setPreset('today')}
            className={`btn ${preset === 'today' ? 'btn-primary' : 'btn-outline'}`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setPreset('week')}
            className={`btn ${preset === 'week' ? 'btn-primary' : 'btn-outline'}`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setPreset('month')}
            className={`btn ${preset === 'month' ? 'btn-primary' : 'btn-outline'}`}
          >
            30 วันล่าสุด
          </button>
          <button
            onClick={() => setPreset('custom')}
            className={`btn ${preset === 'custom' ? 'btn-primary' : 'btn-outline'}`}
          >
            กำหนดเอง
          </button>
        </div>

        {/* Custom Date Inputs */}
        {preset === 'custom' && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="label">วันที่เริ่มต้น</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label">วันที่สิ้นสุด</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleCustomDateChange}
              className="btn btn-primary flex items-center gap-2"
            >
              <Calendar size={18} />
              แสดงข้อมูล
            </button>
          </>
        )}
      </div>
    </div>
  )
}

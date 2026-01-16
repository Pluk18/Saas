'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesChartProps {
  data: Array<{
    date: string
    totalNet: number
    count: number
  }>
  title?: string
}

export default function SalesChart({ data, title = 'ยอดขายรายวัน' }: SalesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric'
    }),
    ยอดขาย: item.totalNet,
    จำนวนบิล: item.count
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-medium text-neutral-900 mb-1">{payload[0].payload.date}</p>
          <p className="text-sm text-primary-600">
            ยอดขาย: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-sm text-accent-600">
              จำนวนบิล: {payload[1].value}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-neutral-800">
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
          >
            <TrendingUp size={16} />
            กราฟเส้น
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline'} flex items-center gap-2`}
          >
            <BarChart3 size={16} />
            กราฟแท่ง
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value.toString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ยอดขาย"
              stroke="#D4AF37"
              strokeWidth={2}
              dot={{ fill: '#D4AF37', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                return value.toString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ยอดขาย" fill="#D4AF37" />
          </BarChart>
        )}
      </ResponsiveContainer>

      {data.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          ไม่มีข้อมูลในช่วงเวลานี้
        </div>
      )}
    </div>
  )
}

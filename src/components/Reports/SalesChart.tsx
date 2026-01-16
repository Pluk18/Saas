'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SalesChartProps {
  data: Array<{
    date: string
    totalSales?: number
    net?: number
    count?: number
  }>
  title?: string
}

export default function SalesChart({ data, title = 'กราฟยอดขาย' }: SalesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric'
    })
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
            className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline'}`}
          >
            <TrendingUp size={16} />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-outline'}`}
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="net"
                name="ยอดสุทธิ"
                stroke="#d4af37"
                strokeWidth={2}
                dot={{ fill: '#d4af37', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="net" name="ยอดสุทธิ" fill="#d4af37" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

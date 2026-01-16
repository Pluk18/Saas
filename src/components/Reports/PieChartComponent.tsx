'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface PieChartComponentProps {
  data: Array<{
    name: string
    value: number
  }>
  title?: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#d4af37', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function PieChartComponent({
  data,
  title = 'กราฟสัดส่วน',
  colors = DEFAULT_COLORS
}: PieChartComponentProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = payload[0].payload.percent
      return (
        <div className="bg-white p-4 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-medium text-neutral-900 mb-1">{data.name}</p>
          <p className="text-sm text-neutral-600">
            {formatCurrency(data.value)} ({(total * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`
  }

  return (
    <div className="card">
      <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
        {title}
      </h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

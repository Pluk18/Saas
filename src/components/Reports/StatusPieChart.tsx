'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface StatusPieChartProps {
  data: Array<{
    status: string
    count: number
  }>
}

const COLORS = {
  available: '#10b981',
  sold: '#6b7280',
  reserved: '#f59e0b',
  damaged: '#ef4444'
}

const STATUS_LABELS = {
  available: 'พร้อมขาย',
  sold: 'ขายแล้ว',
  reserved: 'จอง',
  damaged: 'ชำรุด'
}

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    color: COLORS[item.status as keyof typeof COLORS] || '#6b7280'
  }))

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-medium text-neutral-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-primary-600">
            {payload[0].value} ชิ้น ({percent}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
        สถานะสินค้า
      </h3>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          ไม่มีข้อมูลสินค้า
        </div>
      )}
    </div>
  )
}

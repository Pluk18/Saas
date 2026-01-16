'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface PaymentPieChartProps {
  data: Array<{
    method: string
    total: number
    count: number
  }>
}

const COLORS = {
  cash: '#10b981',
  transfer: '#3b82f6',
  card: '#f59e0b',
  mixed: '#8b5cf6',
  gold_credit: '#D4AF37'
}

const METHOD_LABELS = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  card: 'บัตรเครดิต',
  mixed: 'ผสม',
  gold_credit: 'เครดิตออมทอง'
}

export default function PaymentPieChart({ data }: PaymentPieChartProps) {
  const chartData = data.map(item => ({
    name: METHOD_LABELS[item.method as keyof typeof METHOD_LABELS] || item.method,
    value: item.total,
    count: item.count,
    color: COLORS[item.method as keyof typeof COLORS] || '#6b7280'
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="font-medium text-neutral-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-primary-600">
            ยอดรวม: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-neutral-600">
            จำนวน: {payload[0].payload.count} รายการ
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-display font-semibold text-neutral-800 mb-6">
        สัดส่วนการชำระเงิน
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
          ไม่มีข้อมูลในช่วงเวลานี้
        </div>
      )}
    </div>
  )
}

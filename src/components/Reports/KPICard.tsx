import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  colorClass?: string
  format?: 'currency' | 'number' | 'text'
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = 'from-primary-50 to-primary-100 border-primary-200',
  format = 'currency'
}: KPICardProps) {
  const iconBgClass = colorClass.includes('green')
    ? 'bg-green-600'
    : colorClass.includes('blue')
    ? 'bg-blue-600'
    : colorClass.includes('accent')
    ? 'bg-accent-600'
    : colorClass.includes('amber')
    ? 'bg-amber-600'
    : 'bg-primary-600'

  const formatValue = () => {
    if (format === 'currency' && typeof value === 'number') {
      return formatCurrency(value)
    }
    if (format === 'number' && typeof value === 'number') {
      return value.toLocaleString('th-TH')
    }
    return value
  }

  return (
    <div className={`card bg-gradient-to-br ${colorClass}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg ${iconBgClass} flex items-center justify-center flex-shrink-0`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 font-display truncate">
            {formatValue()}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

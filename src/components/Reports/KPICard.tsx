import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  iconBg: string
  subtitle?: string
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  gradient,
  iconBg,
  subtitle
}: KPICardProps) {
  return (
    <div className={`card ${gradient} border-opacity-50`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 font-display">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

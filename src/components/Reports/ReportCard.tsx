import Link from 'next/link'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface ReportCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  iconColor?: string
}

export default function ReportCard({
  title,
  description,
  icon: Icon,
  href,
  iconColor = 'bg-primary-600'
}: ReportCardProps) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-neutral-600">{description}</p>
          </div>
          <ChevronRight size={20} className="text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  )
}

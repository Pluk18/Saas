import Link from 'next/link'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface ReportCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  iconColor: string
  iconBg: string
}

export default function ReportCard({
  title,
  description,
  icon: Icon,
  href,
  iconColor,
  iconBg
}: ReportCardProps) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon size={24} className={iconColor} />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-neutral-600">
                {description}
              </p>
            </div>
          </div>
          <ChevronRight size={20} className="text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Coins,
  PiggyBank,
  TrendingUp,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'แดชบอร์ด', href: '/' },
  { icon: <TrendingUp size={20} />, label: 'ราคาทองวันนี้', href: '/gold-prices' },
  { icon: <Package size={20} />, label: 'คลังสินค้า', href: '/inventory' },
  { icon: <ShoppingCart size={20} />, label: 'ขายสินค้า (POS)', href: '/pos' },
  { icon: <Users size={20} />, label: 'ลูกค้า', href: '/customers' },
  { icon: <Coins size={20} />, label: 'ขายฝาก/จำนำ', href: '/consignments' },
  { icon: <PiggyBank size={20} />, label: 'ออมทอง', href: '/gold-savings' },
  { icon: <FileText size={20} />, label: 'รายงาน', href: '/reports' },
  { icon: <Settings size={20} />, label: 'ตั้งค่า', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white shadow-xl z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-primary-700">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-gradient-gold">
            ระบบจัดการร้านทอง
          </h1>
          <p className="text-xs text-primary-200 mt-1">Gold Jewelry POS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg 
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-700 text-white shadow-md' 
                      : 'text-primary-100 hover:bg-primary-700/50 hover:text-white'
                    }
                  `}
                >
                  <span className={`
                    transition-transform group-hover:scale-110
                    ${isActive ? 'text-accent-400' : ''}
                  `}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-lg font-semibold">ผ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">ผู้จัดการร้าน</p>
            <p className="text-xs text-primary-300 truncate">manager@example.com</p>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 transition-colors">
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  )
}


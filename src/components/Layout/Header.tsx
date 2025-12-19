'use client'

import { Bell, Search } from 'lucide-react'

export default function Header() {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white border-b border-neutral-200 z-30 shadow-sm">
      <div className="flex items-center justify-between h-full px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหาสินค้า, รหัสสินค้า, ลูกค้า..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-neutral-300 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6 ml-6">
          {/* Date */}
          <div className="text-right hidden lg:block">
            <p className="text-sm text-neutral-600">{currentDate}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              เวลา {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
            </p>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Bell size={22} className="text-neutral-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}


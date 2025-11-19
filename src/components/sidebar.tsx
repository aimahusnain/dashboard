'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, FileText, Users, Package, ShoppingCart, Eye, CheckCircle2, BarChart3, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'tracker', label: 'Tracker', icon: FileText, href: '/tracker' },
  { id: 'sold', label: 'Sold', icon: ShoppingCart, href: '/sold' },
  { id: 'inventory', label: 'Inventory', icon: Package, href: '/inventory' },
  // { id: 'summary', label: 'Summary', icon: BarChart3, href: '/summary' },
  { id: 'validation', label: 'Validation', icon: CheckCircle2, href: '/validation' },
  { id: 'salesman-data', label: 'Salesman Data', icon: Users, href: '/salesman-data' },
  { id: 'payroll', label: 'Payroll Entries', icon: Users, href: '/payroll' },
  // { id: 'sales', label: 'Sales', icon: Eye, href: '/sales' },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside
      className={cn(
        'bg-sidebar border-r h-full border-sidebar-border transition-all duration-300 ease-in-out flex flex-col',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {isOpen && (
          <h1 className="text-lg font-bold text-sidebar-foreground">Dashboard</h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronDown
            size={20}
            className={cn(
              'text-sidebar-foreground transition-transform',
              !isOpen && '-rotate-90'
            )}
          />
        </button>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
              title={!isOpen ? tab.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{tab.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <LanguageSwitcher />
      </div>
    </aside>
  )
}

'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/ThemeProvider'
import { useState } from 'react'
import { IconDashboard, IconInvoice, IconInvoices, IconCustomers, IconInventory, IconReports, IconSun, IconMoon, IconLogout, IconLock } from '@/components/Icons'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/', icon: <IconDashboard />, label: 'Dashboard' },
  { href: '/billing', icon: <IconInvoice />, label: 'New Invoice' },
  { href: '/invoices', icon: <IconInvoices />, label: 'Invoices' },
  { href: '/customers', icon: <IconCustomers />, label: 'Customers' },
  { href: '/products', icon: <IconInventory />, label: 'Inventory' },
  { href: '/reports', icon: <IconReports />, label: 'Reports' },
]

interface SidebarProps {
  user: { name: string; role: string } | null
  lowStockCount?: number
}

export default function Sidebar({ user, lowStockCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/" style={{ display: 'block' }}>
          <Image
            src="/logo.png"
            alt="Ever Loop Carpets"
            width={200}
            height={70}
            style={{ width: '100%', maxWidth: '200px', height: 'auto', objectFit: 'contain', filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none' }}
            priority
          />
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Inventory' && lowStockCount > 0 && (
                <span className="nav-badge">{lowStockCount}</span>
              )}
            </Link>
          )
        })}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', opacity: 0.6, fontSize: '11px', fontWeight: 600, paddingLeft: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          User Controls
        </div>
        <Link
          href="/settings"
          className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="nav-item-icon"><IconLock /></span>
          <span>{user?.role === 'ADMIN' ? 'Admin' : 'Staff'}</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={toggleTheme}
          className="nav-item"
          style={{ marginBottom: '8px' }}
        >
          <span className="nav-item-icon">{theme === 'dark' ? <IconSun /> : <IconMoon />}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="nav-item"
          style={{ marginTop: '8px', color: '#ef4444' }}
        >
          <span className="nav-item-icon"><IconLogout /></span>
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  )
}

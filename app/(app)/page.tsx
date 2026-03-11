'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { IconDashboard, IconInvoices, IconInventory, IconWarning, IconReports, IconCheck, IconClock, IconCurrency } from '@/components/Icons'

interface DashboardData {
  todaySales: number
  todayProfit: number
  todayCount: number
  totalInvoices: number
  totalRevenue: number
  totalProfit: number
  totalProducts: number
  lowStockProducts: { id: string; name: string; stock: number; productId: string }[]
  daily: { label: string; revenue: number; profit: number; count: number }[]
  monthly: { label: string; revenue: number; profit: number; count: number }[]
  yearly: { label: string; revenue: number; profit: number; count: number }[]
  recentInvoices: { id: string; invoiceNumber: string; total: number; paymentStatus: string; date: string; customer: { name: string } }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState<'daily' | 'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const [showLowStockDetails, setShowLowStockDetails] = useState(false)

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const chartData = data ? (viewType === 'daily' ? data.daily : viewType === 'monthly' ? data.monthly : data.yearly) : []
  const chartLabel = viewType === 'daily' ? 'Daily Performance' : viewType === 'monthly' ? 'Monthly Performance' : 'Yearly Performance'

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            {new Date().toLocaleDateString('en-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div
          className="stat-card"
          style={{ '--stat-color': '#c9973a', '--stat-bg': 'rgba(201,151,58,0.12)', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => router.push('/invoices?date=today')}
        >
          <div className="stat-icon"><IconCurrency size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(data?.todaySales || 0)}</div>
            <div className="stat-label">Today's Sales</div>
            <div className="stat-sub" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
              <span>{data?.todayCount || 0} invoices</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>+{formatCurrency(data?.todayProfit || 0)} profit</span>
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,0.1)', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => router.push('/invoices')}
        >
          <div className="stat-icon"><IconInvoices size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(data?.totalRevenue || 0)}</div>
            <div className="stat-label">Total Sales</div>
            <div className="stat-sub" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
              <span>All time</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(data?.totalProfit || 0)} profit</span>
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ '--stat-color': '#10b981', '--stat-bg': 'rgba(16,185,129,0.1)', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => router.push('/products')}
        >
          <div className="stat-icon"><IconInventory size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{data?.totalProducts || 0}</div>
            <div className="stat-label">Products in Stock</div>
            <div className="stat-sub">Carpet varieties</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ '--stat-color': '#ef4444', '--stat-bg': 'rgba(239,68,68,0.1)', cursor: 'pointer' } as React.CSSProperties}
          onClick={() => setShowLowStockDetails(!showLowStockDetails)}
        >
          <div className="stat-icon"><IconWarning size={28} /></div>
          <div className="stat-info">
            <div className="stat-value">{data?.lowStockProducts?.length || 0}</div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-sub">{showLowStockDetails ? 'Click to hide details' : 'Click to view details'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconReports /> {chartLabel}
            </h2>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              {(['daily', 'monthly', 'yearly'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: viewType === type ? 'var(--brand-primary)' : 'transparent',
                    color: viewType === type ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-secondary)', opacity: 0.4 }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'Sales' ? 'Sales' : 'Profit']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }} />
                  <Bar dataKey="revenue" name="Sales" fill="#eab308" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><IconWarning /> Low Stock</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowLowStockDetails(!showLowStockDetails)}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {showLowStockDetails ? 'Hide' : 'Show'}
              </button>
              <a href="/products" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
            </div>
          </div>
          <div className="card-body" style={{ padding: '12px' }}>
            {showLowStockDetails ? (
              data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.lowStockProducts.map(p => (
                    <div key={p.id} style={{ padding: '10px 12px', background: 'var(--bg-badge-danger)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.productId}</div>
                      </div>
                      <span className="badge badge-danger">{p.stock} left</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '30px 10px' }}>
                  <div className="empty-state-icon"><IconCheck size={32} /></div>
                  <div className="empty-state-title">All stocked up!</div>
                  <div className="empty-state-desc">No low stock items</div>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <IconWarning size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <div>Details hidden. Click 'Show' or the alert card to view.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><IconInvoices /> Recent Invoices</h2>
          <a href="/invoices" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentInvoices && data.recentInvoices.length > 0 ? (
                data.recentInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td><a href={`/invoices/${inv.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>{inv.invoiceNumber}</a></td>
                    <td>{inv.customer.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(inv.total)}</td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {inv.paymentStatus === 'Paid' ? <IconCheck size={12} style={{ marginRight: '4px' }} /> : <IconClock size={12} style={{ marginRight: '4px' }} />} {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><IconInvoices size={48} /></div>
                      <div className="empty-state-title">No invoices yet</div>
                      <div className="empty-state-desc"><a href="/billing" style={{ color: 'var(--brand-primary)' }}>Create your first invoice</a></div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

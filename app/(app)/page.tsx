'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  todaySales: number
  todayCount: number
  totalInvoices: number
  totalProducts: number
  lowStockProducts: { id: string; name: string; stock: number; productId: string }[]
  monthly: { month: string; revenue: number; count: number }[]
  recentInvoices: { id: string; invoiceNumber: string; total: number; paymentStatus: string; date: string; customer: { name: string } }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
        <div className="stat-card" style={{ '--stat-color': '#c9973a', '--stat-bg': 'rgba(201,151,58,0.12)' } as React.CSSProperties}>
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(data?.todaySales || 0)}</div>
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-sub">{data?.todayCount || 0} invoices today</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,0.1)' } as React.CSSProperties}>
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{data?.totalInvoices || 0}</div>
            <div className="stat-label">Total Invoices</div>
            <div className="stat-sub">All time</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#10b981', '--stat-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <div className="stat-value">{data?.totalProducts || 0}</div>
            <div className="stat-label">Products in Stock</div>
            <div className="stat-sub">Carpet varieties</div>
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#ef4444', '--stat-bg': 'rgba(239,68,68,0.1)' } as React.CSSProperties}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{data?.lowStockProducts?.length || 0}</div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-sub">Need restocking</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Monthly Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📈 Monthly Revenue</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 6 months</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="revenue" fill="#c9973a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🚨 Low Stock</h2>
            <a href="/products" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <div className="card-body" style={{ padding: '12px' }}>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
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
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-title">All stocked up!</div>
                <div className="empty-state-desc">No low stock items</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🧾 Recent Invoices</h2>
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
                        {inv.paymentStatus === 'Paid' ? '✓' : '⏳'} {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
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

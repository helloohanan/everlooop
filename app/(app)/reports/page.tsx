'use client'
import { useEffect, useState, useCallback } from 'react'
import { IconCurrency, IconInvoices, IconInvoice, IconReports, IconAward, IconMedal } from '@/components/Icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface ReportData {
  period: string
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  topProducts: { name: string; type: string; quantity: number; revenue: number }[]
  paymentMethods: Record<string, number>
  invoices: any[]
}

const PIE_COLORS = ['#c9973a', '#1a2744', '#3b82f6', '#10b981', '#f59e0b']

const formatQAR = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
const formatQARFull = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?period=${period}`)
    const d = await res.json()
    setData(d)
    setLoading(false)
  }, [period])

  useEffect(() => { load() }, [load])

  const periodLabel = period === 'day' ? 'Today' : period === 'year' ? 'This Year' : 'This Month'

  const pieData = data ? Object.entries(data.paymentMethods).map(([name, value]) => ({ name, value })) : []

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Reports & Analytics</h1>
          <p className="section-subtitle">Sales and inventory performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['day', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              id={`period-${p}`}
              className={`btn ${period === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'day' ? 'Today' : p === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="stats-grid">
            <div className="stat-card" style={{ '--stat-color': '#c9973a', '--stat-bg': 'rgba(201,151,58,0.12)' } as React.CSSProperties}>
              <div className="stat-icon"><IconCurrency /></div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '18px' }}>{formatQAR(data.totalRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
                <div className="stat-sub">{periodLabel}</div>
              </div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,0.1)' } as React.CSSProperties}>
              <div className="stat-icon"><IconInvoices /></div>
              <div className="stat-info">
                <div className="stat-value">{data.totalInvoices}</div>
                <div className="stat-label">Total Invoices</div>
                <div className="stat-sub">{data.paidInvoices} paid · {data.pendingInvoices} pending</div>
              </div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#f59e0b', '--stat-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
              <div className="stat-icon"><IconReports /></div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '18px' }}>
                  {data.totalInvoices > 0 ? formatQAR(data.totalRevenue / data.totalInvoices) : 'QAR 0'}
                </div>
                <div className="stat-label">Avg Invoice Value</div>
                <div className="stat-sub">{periodLabel}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Top Products */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title"><IconAward /> Best-Selling Carpets</h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{periodLabel}</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {data.topProducts.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon"><IconReports size={48} /></div><div className="empty-state-title">No sales data</div></div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Qty Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <span style={{ fontWeight: 800, color: i === 0 ? '#c9973a' : i === 1 ? '#9ca3af' : i === 2 ? '#a78b6c' : 'var(--text-muted)' }}>
                              {i === 0 ? <IconMedal style={{ color: '#c9973a' }} /> : i === 1 ? <IconMedal style={{ color: '#9ca3af' }} /> : i === 2 ? <IconMedal style={{ color: '#a78b6c' }} /> : `#${i + 1}`}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{p.type}</td>
                          <td><span className="badge badge-info">{p.quantity} pcs</span></td>
                          <td style={{ fontWeight: 700 }}>{formatQARFull(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Payment Method Chart */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title"><IconInvoice /> Payment Methods</h2>
              </div>
              <div className="card-body">
                {pieData.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon"><IconReports size={48} /></div><div className="empty-state-title">No data</div></div>
                ) : (
                  <>
                    <div style={{ height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '11px' }}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatQARFull(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      {pieData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[i], display: 'inline-block' }} />
                            {d.name}
                          </span>
                          <span style={{ fontWeight: 600 }}>{formatQARFull(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><IconInvoices /> Recent Invoices — {periodLabel}</h2>
            </div>
            <div className="table-wrapper">
              {data.invoices.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><IconInvoices size={48} /></div><div className="empty-state-title">No invoices in this period</div></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((inv: any) => (
                      <tr key={inv.id}>
                        <td><a href={`/invoices/${inv.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>{inv.invoiceNumber}</a></td>
                        <td>{inv.customer.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(inv.date).toLocaleDateString('en-QA')}</td>
                        <td>{inv.paymentMethod}</td>
                        <td style={{ fontWeight: 700 }}>{formatQARFull(inv.total)}</td>
                        <td><span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>{inv.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-danger">Failed to load reports</div>
      )}
    </div>
  )
}

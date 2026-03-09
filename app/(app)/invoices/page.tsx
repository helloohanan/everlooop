'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { IconPlus, IconSearch, IconInvoice, IconCurrency, IconDashboard, IconCheck, IconClock, IconView, IconPrint, IconDelete } from '@/components/Icons'

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  total: number
  paymentStatus: string
  paymentMethod: string
  customer: { name: string; phone?: string }
  items: { id: string }[]
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, status: statusFilter })
    const res = await fetch(`/api/invoices?${params}`)
    const data = await res.json()
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, statusFilter])

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${num}?`)) return

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        load()
      } else {
        alert('Failed to delete invoice')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting invoice')
    }
  }

  useEffect(() => { load() }, [load])

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Invoices</h1>
          <p className="section-subtitle">{invoices.length} invoices found</p>
        </div>
        <a href="/billing" className="btn btn-primary" id="new-invoice-btn"><IconPlus style={{ marginRight: '8px' }} /> New Invoice</a>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon"><IconSearch /></span>
          <input
            id="invoice-search"
            className="form-input search-input"
            placeholder="Search by invoice # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          id="status-filter"
          className="form-select"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconInvoice size={48} /></div>
              <div className="empty-state-title">No invoices found</div>
              <div className="empty-state-desc"><a href="/billing" style={{ color: 'var(--brand-primary)' }}>Create a new invoice</a></div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Method</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <a href={`/invoices/${inv.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 700 }}>
                        {inv.invoiceNumber}
                      </a>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.customer.name}</div>
                      {inv.customer.phone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.customer.phone}</div>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {inv.paymentMethod === 'Cash' ? <IconCurrency size={14} style={{ marginRight: '4px' }} /> : inv.paymentMethod === 'Card' ? <IconInvoice size={14} style={{ marginRight: '4px' }} /> : <IconDashboard size={14} style={{ marginRight: '4px' }} />} {inv.paymentMethod}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(inv.total)}</td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                        {inv.paymentStatus === 'Paid' ? <IconCheck size={12} style={{ marginRight: '4px' }} /> : <IconClock size={12} style={{ marginRight: '4px' }} />} {inv.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <a href={`/invoices/${inv.id}`} className="btn btn-sm btn-secondary" title="View invoice"><IconView /></a>
                        <a href={`/invoices/${inv.id}?print=true`} className="btn btn-sm btn-secondary" title="Print"><IconPrint /></a>
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="btn btn-sm btn-secondary"
                          title="Delete"
                          style={{ color: 'var(--brand-danger)' }}
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

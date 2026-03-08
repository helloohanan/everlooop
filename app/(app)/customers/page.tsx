'use client'
import { useEffect, useState, useCallback } from 'react'

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
  _count?: { invoices: number }
}

function CustomerModal({ customer, onClose, onSave }: {
  customer: Customer | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers'
      const method = customer ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { onSave(); onClose() }
      else { const d = await res.json(); setError(d.error || 'Error saving') }
    } catch { setError('Connection error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{customer ? '✏️ Edit Customer' : '➕ Add Customer'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="alert alert-danger">⚠️ {error}</div>}
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input id="cust-name" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Full name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input id="cust-phone" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+974 XXXX XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="cust-email" className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea id="cust-address" className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City, Country" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-customer">
              {saving ? '⏳ Saving...' : '💾 Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)
  const [historyData, setHistoryData] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setCustomers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    load()
  }

  const openHistory = async (c: Customer) => {
    setHistoryCustomer(c)
    const res = await fetch(`/api/customers/${c.id}`)
    const data = await res.json()
    setHistoryData(data)
  }

  const formatCurr = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Customers</h1>
          <p className="section-subtitle">{customers.length} total customers</p>
        </div>
        <button id="add-customer-btn" className="btn btn-primary" onClick={() => { setEditCustomer(null); setModalOpen(true) }}>
          ➕ Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="customer-search"
            className="form-input search-input"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No customers found</div>
              <div className="empty-state-desc">Add your first customer to get started</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Invoices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td>
                      <span className="badge badge-info">{c._count?.invoices || 0} invoices</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openHistory(c)} title="View purchase history">📄</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setEditCustomer(c); setModalOpen(true) }} title="Edit customer">✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.name)} title="Delete customer">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <CustomerModal customer={editCustomer} onClose={() => setModalOpen(false)} onSave={load} />
      )}

      {historyCustomer && historyData && (
        <div className="modal-overlay" onClick={() => setHistoryCustomer(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📄 Purchase History — {historyCustomer.name}</h2>
              <button className="modal-close" onClick={() => setHistoryCustomer(null)}>×</button>
            </div>
            <div className="modal-body">
              {historyData.invoices && historyData.invoices.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td><a href={`/invoices/${inv.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>{inv.invoiceNumber}</a></td>
                          <td>{new Date(inv.date).toLocaleDateString('en-QA')}</td>
                          <td>{inv.items.length} item(s)</td>
                          <td style={{ fontWeight: 700 }}>{formatCurr(inv.total)}</td>
                          <td><span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>{inv.paymentStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">No invoices yet</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconWarning, IconCustomers, IconPhone, IconEmail, IconLocation, IconSearch, IconInventory, IconDashboard, IconInvoice, IconCurrency, IconCheck, IconClock, IconX } from '@/components/Icons'

interface Customer { id: string; name: string; phone?: string; email?: string; address?: string }
interface Product { id: string; productId: string; name: string; type: string; size: string; material: string; price: number; stock: number }
interface LineItem { productId: string; product: Product; quantity: number; price: number; size: string; total: number }

export default function BillingPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [discount, setDiscount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const [showProductDrop, setShowProductDrop] = useState(false)

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []))
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []))
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || '').includes(customerSearch)
  )

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.productId.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addProduct = (p: Product) => {
    setShowProductDrop(false)
    setProductSearch('')
    const existing = items.find(i => i.productId === p.id)
    if (existing) {
      setItems(items.map(i => i.productId === p.id
        ? { ...i, quantity: i.quantity + 1, total: p.price * (i.quantity + 1) }
        : i
      ))
    } else {
      setItems([...items, { productId: p.id, product: p, quantity: 1, price: p.price, size: p.size, total: p.price }])
    }
  }

  const parseSize = (s: string) => {
    const match = s.match(/^(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)$/i)
    if (match) return { w: parseFloat(match[1]), l: parseFloat(match[2]) }
    return null
  }

  const updateSize = (productId: string, newSize: string) => {
    setItems(items.map(item => {
      if (item.productId !== productId) return item

      let newPrice = item.price
      const newS = parseSize(newSize)
      const origS = parseSize(item.product.size)

      if (newS && origS) {
        const newArea = newS.w * newS.l
        const origArea = origS.w * origS.l
        newPrice = (newArea / origArea) * item.product.price
      }

      return { ...item, size: newSize, price: newPrice, total: newPrice * item.quantity }
    }))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter(i => i.productId !== productId))
    } else {
      setItems(items.map(i => i.productId === productId
        ? { ...i, quantity: qty, total: i.price * qty }
        : i
      ))
    }
  }

  const updatePrice = (productId: string, price: number) => {
    setItems(items.map(i => i.productId === productId
      ? { ...i, price, total: price * i.quantity }
      : i
    ))
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const discountAmount = parseFloat(discount) || 0
  const afterDiscount = subtotal - discountAmount
  const total = afterDiscount

  const formatQAR = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleSubmit = async () => {
    if (!selectedCustomer) { setError('Please select a customer'); return }
    if (items.length === 0) { setError('Please add at least one product'); return }
    setError(''); setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, size: i.size })),
          discount: parseFloat(discount) || 0,
          paymentMethod,
          paymentStatus,
          notes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/invoices/${data.id}`)
      } else {
        setError(data.error || 'Failed to create invoice')
      }
    } catch { setError('Connection error. Please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">New Invoice</h1>
          <p className="section-subtitle">Create a new billing invoice for a customer</p>
        </div>
      </div>

      {error && <div className="alert alert-danger"><IconWarning /> {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        {/* LEFT: Customer + Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Customer selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><IconCustomers /> Customer</h2>
            </div>
            <div className="card-body">
              {selectedCustomer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{selectedCustomer.name}</div>
                    {selectedCustomer.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><IconPhone /> {selectedCustomer.phone}</div>}
                    {selectedCustomer.email && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><IconEmail /> {selectedCustomer.email}</div>}
                    {selectedCustomer.address && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><IconLocation /> {selectedCustomer.address}</div>}
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => setSelectedCustomer(null)}>Change</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><IconSearch /></div>
                  <input
                    id="customer-search-billing"
                    className="form-input"
                    placeholder="Search customer by name or phone..."
                    value={customerSearch}
                    style={{ paddingLeft: '44px' }}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true) }}
                    onFocus={() => setShowCustomerDrop(true)}
                  />
                  {showCustomerDrop && filteredCustomers.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredCustomers.slice(0, 8).map(c => (
                        <div
                          key={c.id}
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                          onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(''); setShowCustomerDrop(false) }}
                          onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-table-hover)')}
                          onMouseOut={e => (e.currentTarget.style.background = '')}
                        >
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          {c.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.phone}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Or <a href="/customers" style={{ color: 'var(--brand-primary)' }}>add a new customer</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><IconInventory /> Carpet Items</h2>
            </div>
            <div className="card-body">
              {/* Product search */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><IconSearch /></div>
                <input
                  id="product-search-billing"
                  className="form-input"
                  placeholder="Search and add carpet products..."
                  value={productSearch}
                  style={{ paddingLeft: '44px' }}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDrop(true) }}
                  onFocus={() => setShowProductDrop(true)}
                />
                {showProductDrop && productSearch && filteredProducts.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredProducts.slice(0, 8).map(p => (
                      <div
                        key={p.id}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseDown={() => addProduct(p)}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-table-hover)')}
                        onMouseOut={e => (e.currentTarget.style.background = '')}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.productId} · {p.type} · {p.size} · {p.material}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>QAR {p.price.toLocaleString()}</div>
                          <div style={{ fontSize: '11px', color: p.stock <= 3 ? '#ef4444' : 'var(--text-muted)' }}>Stock: {p.stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items table */}
              {items.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-state-icon"><IconInventory size={48} /></div>
                  <div className="empty-state-title">No items added</div>
                  <div className="empty-state-desc">Search and select carpet products above</div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style={{ width: '100px' }}>Size</th>
                        <th style={{ width: '90px' }}>Price (QAR)</th>
                        <th style={{ width: '80px' }}>Qty</th>
                        <th style={{ width: '120px' }}>Total</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.productId}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.product.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.product.productId} · {item.product.type}</div>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.size}
                              onChange={e => updateSize(item.productId, e.target.value)}
                              className="form-input"
                              placeholder="e.g. 5x7"
                              style={{ width: '100px', padding: '4px 8px', fontSize: '13px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={e => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                              className="form-input"
                              style={{ width: '90px', padding: '4px 8px', fontSize: '13px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={e => updateQty(item.productId, parseInt(e.target.value) || 0)}
                              className="form-input"
                              style={{ width: '60px', padding: '4px 8px', fontSize: '13px' }}
                            />
                          </td>
                          <td style={{ fontWeight: 700 }}>QAR {item.total.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger btn-icon"
                              onClick={() => setItems(items.filter(i => i.productId !== item.productId))}
                            ><IconX /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Summary + Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Order Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><IconDashboard /> Order Summary</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatQAR(subtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <style jsx>{`
                  input::-webkit-outer-spin-button,
                  input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  input[type=number] {
                    -moz-appearance: textfield;
                  }
                `}</style>
                <span style={{ color: 'var(--text-secondary)' }}>Discount (QAR)</span>
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  className="form-input"
                  style={{ width: '80px', padding: '4px 8px', fontSize: '13px', textAlign: 'right' }}
                />
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Discount Amount</span>
                  <span>- {formatQAR(discountAmount)}</span>
                </div>
              )}

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--brand-primary)' }}>
                <span>Grand Total</span>
                <span>{formatQAR(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><IconInvoice /> Payment</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select id="payment-method" className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select id="payment-status" className="form-select" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea id="invoice-notes" className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." style={{ minHeight: '60px' }} />
              </div>
            </div>
          </div>

          {/* Create Invoice Button */}
          <button
            id="create-invoice-btn"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || items.length === 0 || !selectedCustomer}
            style={{ padding: '14px', fontSize: '15px', justifyContent: 'center' }}
          >
            {saving ? <><IconClock style={{ marginRight: '8px' }} /> Creating Invoice...</> : <><IconInvoice style={{ marginRight: '8px' }} /> Create Invoice</>}
          </button>
        </div>
      </div>
    </div>
  )
}

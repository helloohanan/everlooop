'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconWarning, IconCustomers, IconPhone, IconEmail, IconLocation, IconSearch, IconInventory, IconDashboard, IconInvoice, IconCurrency, IconCheck, IconClock, IconX, IconCash, IconCreditCard, IconBankTransfer, IconUPI, IconPlus, IconSave, IconCart } from '@/components/Icons'

interface Customer { id: string; name: string; phone?: string; email?: string; address?: string; createdAt?: string }
interface Product { id: string; productId: string; name: string; type: string; size: string; material: string; price: number; stock: number }
interface LineItem { productId: string; product: Product; quantity: number; price: number; size: string; total: number; unitPriceStr?: string; qtyStr?: string }

function CustomerModal({ onClose, onSave }: {
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const res = await fetch('/api/customers', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      })
      if (res.ok) { onSave(); onClose() }
      else { const d = await res.json(); setError(d.error || 'Error saving') }
    } catch { setError('Connection error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title"><IconPlus /> Add New Customer</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="alert alert-danger"><IconWarning /> {error}</div>}
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+974 XXXX XXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><IconClock style={{ marginRight: '8px' }} /> Saving...</> : <><IconSave style={{ marginRight: '8px' }} /> Save Customer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [discount, setDiscount] = useState<string>('')
  const [discountType, setDiscountType] = useState<'%' | 'QAR'>('%')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [showProductDrop, setShowProductDrop] = useState(false)
  
  // POS Payment State
  const [cashAmount, setCashAmount] = useState<string>('')
  const [cardAmount, setCardAmount] = useState<string>('')
  const [upiAmount, setUpiAmount] = useState<string>('')
  const [bankAmount, setBankAmount] = useState<string>('')
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []))
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []))
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || '').includes(customerSearch)
  ).sort((a, b) => {
    const q = customerSearch.toLowerCase()
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aPhone = (a.phone || '')
    const bPhone = (b.phone || '')

    // Priority 1: Exact name match
    if (aName === q && bName !== q) return -1
    if (bName === q && aName !== q) return 1

    // Priority 2: Name starts with query
    const aNameStarts = aName.startsWith(q)
    const bNameStarts = bName.startsWith(q)
    if (aNameStarts && !bNameStarts) return -1
    if (bNameStarts && !aNameStarts) return 1

    // Priority 3: Phone starts with query
    const aPhoneStarts = aPhone.startsWith(q)
    const bPhoneStarts = bPhone.startsWith(q)
    if (aPhoneStarts && !bPhoneStarts) return -1
    if (bPhoneStarts && !aPhoneStarts) return 1

    return aName.localeCompare(bName)
  })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.productId.toLowerCase().includes(productSearch.toLowerCase())
  ).sort((a, b) => {
    const q = productSearch.toLowerCase()
    const aId = a.productId.toLowerCase()
    const bId = b.productId.toLowerCase()
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()

    // Priority 1: Product ID starts with query
    const aIdStarts = aId.startsWith(q)
    const bIdStarts = bId.startsWith(q)
    if (aIdStarts && !bIdStarts) return -1
    if (bIdStarts && !aIdStarts) return 1

    // Priority 2: Name starts with query
    const aNameStarts = aName.startsWith(q)
    const bNameStarts = bName.startsWith(q)
    if (aNameStarts && !bNameStarts) return -1
    if (bNameStarts && !aNameStarts) return 1

    // Priority 3: Product ID exact match (already covered by startsWith but for clarity)
    if (aId === q && bId !== q) return -1
    if (bId === q && aId !== q) return 1

    return aName.localeCompare(bName)
  })

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
    if (match) {
      const w = parseFloat(match[1])
      const l = parseFloat(match[2])
      return { w, l, area: w * l }
    }
    return null
  }

  const getUnitPrice = (item: LineItem) => {
    if (item.unitPriceStr !== undefined) return item.unitPriceStr
    const s = parseSize(item.size)
    if (s && s.area > 0) {
      const val = item.price / s.area
      return val > 0 ? Number(val.toFixed(4)).toString() : ''
    }
    return ''
  }

  const updateSize = (productId: string, newSize: string) => {
    setManualTotal('')
    setDiscount('')
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

      return { ...item, size: newSize, price: newPrice, total: newPrice * item.quantity, unitPriceStr: undefined }
    }))
  }

  const updateQty = (productId: string, qty: number) => {
    setManualTotal('')
    setDiscount('')
    setItems(items.map(i => i.productId === productId
      ? { ...i, quantity: qty, total: i.price * qty, qtyStr: undefined }
      : i
    ))
  }

  const updateQtyStr = (productId: string, qtyStr: string) => {
    setManualTotal('')
    setDiscount('')
    setItems(items.map(i => {
      if (i.productId !== productId) return i
      if (qtyStr === '') return { ...i, qtyStr: '' }
      const qty = parseInt(qtyStr) || 0
      return { ...i, quantity: qty, total: i.price * qty, qtyStr: undefined }
    }))
  }

  const updatePrice = (productId: string, price: number) => {
    setManualTotal('')
    setDiscount('')
    setItems(items.map(i => {
      if (i.productId !== productId) return i
      // Constraint: Unit price cannot be above of cost (product.price)
      const cappedPrice = Math.min(price, i.product.price)
      return { ...i, price: cappedPrice, total: cappedPrice * i.quantity, unitPriceStr: undefined }
    }))
  }

  const updateUnitPrice = (productId: string, unitPriceStr: string) => {
    setManualTotal('')
    setDiscount('')
    setItems(items.map(i => {
      if (i.productId !== productId) return i
      if (unitPriceStr === '') return { ...i, unitPriceStr: '' }

      const unitPrice = parseFloat(unitPriceStr) || 0
      const s = parseSize(i.size)
      const newPrice = s ? unitPrice * s.area : i.price
      return { ...i, price: newPrice, total: newPrice * i.quantity, unitPriceStr: undefined }
    }))
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const [manualTotal, setManualTotal] = useState<string>('')

  const discountAmount = discountType === '%' 
    ? (subtotal * (parseFloat(discount) || 0) / 100)
    : (parseFloat(discount) || 0)

  const total = manualTotal ? (parseFloat(manualTotal) || 0) : Math.max(0, subtotal - discountAmount)

  // Payment Calculations
  const pCash = parseFloat(cashAmount) || 0
  const pCard = parseFloat(cardAmount) || 0
  const pUPI = parseFloat(upiAmount) || 0
  const pBank = parseFloat(bankAmount) || 0
  const totalPaid = paymentMethod === 'Split Payment' ? (pCash + pCard + pUPI + pBank) : (paymentStatus === 'Paid' ? total : 0)
  const remainingBalance = total - totalPaid

  useEffect(() => {
    if (paymentMethod !== 'Split Payment') {
      if (paymentStatus === 'Paid') {
        const tStr = total.toFixed(2)
        if (paymentMethod === 'Cash') { setCashAmount(tStr); setCardAmount(''); setUpiAmount(''); setBankAmount('') }
        else if (paymentMethod === 'Card') { setCashAmount(''); setCardAmount(tStr); setUpiAmount(''); setBankAmount('') }
        else if (paymentMethod === 'UPI') { setCashAmount(''); setCardAmount(''); setUpiAmount(tStr); setBankAmount('') }
        else if (paymentMethod === 'Bank Transfer') { setCashAmount(''); setCardAmount(''); setUpiAmount(''); setBankAmount(tStr) }
      } else {
        setCashAmount(''); setCardAmount(''); setUpiAmount(''); setBankAmount('')
      }
    }
  }, [paymentMethod, paymentStatus, total])

  useEffect(() => {
    if (totalPaid > total + 0.01) {
      setPaymentError('Payment exceeds invoice total.')
    } else {
      setPaymentError('')
    }

    if (paymentMethod === 'Split Payment') {
      if (Math.abs(totalPaid - total) < 0.01) setPaymentStatus('Paid')
      else setPaymentStatus('Pending')
    }
  }, [totalPaid, total, paymentMethod])

  const formatQAR = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleSubmit = async () => {
    if (!selectedCustomer) { setError('Please select a customer'); return }
    if (items.length === 0) { setError('Please add at least one product'); return }
    if (paymentError) { setError(paymentError); return }
    
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
          cashAmount: pCash,
          cardAmount: pCard,
          upiAmount: pUPI,
          bankAmount: pBank,
          totalPaid,
          remainingBalance
        }),
      })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
        router.push(`/invoices/${data.id}`)

      } else {
        setError(data.error || 'Failed to create invoice')
      }
    } catch { setError('Connection error. Please try again.') }
    finally { setSaving(false) }
  }

  const handleCustomerSaved = async () => {
    // Refresh customers list
    const res = await fetch('/api/customers')
    const data = await res.json()
    if (Array.isArray(data)) {
      setCustomers(data)
      // Select the most recent customer (the one just added)
      // Note: This relies on the API returning sorted by newest or finding by name/phone
      // For simplicity, we'll just let the user search for them or we could find the max ID/createdAt
      if (data.length > 0) {
        // Find latest by createdAt if available, or just the last one in array if it was pushed
        const latest = [...data].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        setSelectedCustomer(latest)
      }
    }
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', overflow: 'hidden', padding: '16px' }}>
      <div className="section-header" style={{ marginBottom: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '20px', marginBottom: '2px' }}>New Invoice</h1>
          </div>
          {error && <div className="alert alert-danger" style={{ margin: 0, padding: '6px 12px', fontSize: '13px' }}><IconWarning /> {error}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '24px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT: Customer + Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Customer selection */}
          <div className="card" style={{ flexShrink: 0, position: 'relative', zIndex: 10 }}>
            <div className="card-header" style={{ padding: '12px 16px' }}>
              <h2 className="card-title" style={{ fontSize: '18px' }}><IconCustomers /> Customer</h2>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {selectedCustomer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconCustomers size={16} style={{ color: 'var(--brand-primary)' }} />
                      {selectedCustomer.name}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {selectedCustomer.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconPhone size={14} /> {selectedCustomer.phone}</div>}
                      {selectedCustomer.email && <div style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconEmail size={14} /> {selectedCustomer.email}</div>}
                    </div>
                    {selectedCustomer.address && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <IconLocation size={14} /> {selectedCustomer.address}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-sm btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', borderRadius: '8px' }} onClick={() => setSelectedCustomer(null)}>Change Customer</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><IconSearch size={16} /></div>
                    <input
                      id="customer-search-billing"
                      className="form-input"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      style={{ paddingLeft: '38px', height: '36px', fontSize: '13px' }}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true) }}
                      onFocus={() => setShowCustomerDrop(true)}
                    />
                    {showCustomerDrop && filteredCustomers.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: '180px', overflowY: 'auto' }}>
                        {filteredCustomers.slice(0, 8).map(c => (
                          <div
                            key={c.id}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                            onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(''); setShowCustomerDrop(false) }}
                            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-table-hover)')}
                            onMouseOut={e => (e.currentTarget.style.background = '')}
                          >
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                            {c.phone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.phone}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={() => setModalOpen(true)}
                    style={{ height: '36px', padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconPlus size={14} /> New Customer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '12px 16px', flexShrink: 0 }}>
              <h2 className="card-title" style={{ fontSize: '18px' }}><IconInventory /> Carpet Items</h2>
            </div>
            <div className="card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Product search */}
              <div style={{ position: 'relative', marginBottom: '12px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><IconSearch size={16} /></div>
                <input
                  id="product-search-billing"
                  className="form-input"
                  placeholder="Search and add carpet products..."
                  value={productSearch}
                  style={{ paddingLeft: '38px', height: '36px', fontSize: '13px' }}
                  onChange={e => { setProductSearch(e.target.value); setShowProductDrop(true) }}
                  onFocus={() => setShowProductDrop(true)}
                />
                {showProductDrop && productSearch && filteredProducts.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredProducts.slice(0, 8).map(p => (
                      <div
                        key={p.id}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseDown={() => addProduct(p)}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-table-hover)')}
                        onMouseOut={e => (e.currentTarget.style.background = '')}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.productId} · {p.type}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '12px' }}>QAR {p.price.toLocaleString()}</div>
                          <div style={{ fontSize: '10px', color: p.stock <= 3 ? '#ef4444' : 'var(--text-muted)' }}>Stock: {p.stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items table */}
              <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {items.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 20px' }}>
                    <div className="empty-state-icon" style={{ marginBottom: '8px', color: 'var(--brand-primary)' }}><IconCart size={32} /></div>
                    <div className="empty-state-title" style={{ fontSize: '13px', fontWeight: 600 }}>No items added</div>
                    <div className="empty-state-desc" style={{ fontSize: '11px' }}>Search and select carpet products above</div>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table style={{ fontSize: '11px' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg-table-header)' }}>
                        <tr>
                          <th style={{ padding: '8px 10px' }}>Product</th>
                          <th style={{ width: '80px', padding: '8px 10px' }}>Cost</th>
                          <th style={{ width: '90px', padding: '8px 10px' }}>Unit Price</th>
                          <th style={{ width: '70px', padding: '8px 10px' }}>Qty</th>
                          <th style={{ width: '90px', padding: '8px 10px' }}>Total</th>
                          <th style={{ width: '32px', padding: '8px 10px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.productId}>
                            <td style={{ padding: '6px 10px' }}>
                              <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{item.product.productId}</div>
                            </td>
                            <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                              QAR {item.product.price.toLocaleString()}
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price || ''}
                                onChange={e => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                                className="form-input no-spin"
                                placeholder="0.00"
                                style={{ width: '100%', padding: '4px 6px', fontSize: '11px', height: '28px' }}
                              />
                            </td>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="number"
                                min="0"
                                max={item.product.stock}
                                value={item.qtyStr !== undefined ? item.qtyStr : item.quantity}
                                onChange={e => updateQtyStr(item.productId, e.target.value)}
                                className="form-input no-spin"
                                placeholder="0"
                                style={{ width: '100%', padding: '4px 6px', fontSize: '11px', height: '28px' }}
                              />
                            </td>
                            <td style={{ padding: '6px 10px', fontWeight: 700 }}>QAR {item.total.toLocaleString('en-QA', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '6px 10px' }}>
                              <button
                                className="btn btn-sm btn-danger btn-icon"
                                style={{ width: '24px', height: '24px', minWidth: '24px', borderRadius: '4px' }}
                                onClick={() => setItems(items.filter(i => i.productId !== item.productId))}
                              ><IconX size={12} /></button>
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
        </div>

        {/* RIGHT: Summary + Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '12px 16px', flexShrink: 0 }}>
              <h2 className="card-title" style={{ fontSize: '18px' }}><IconInvoice /> Order Summary</h2>
            </div>
            
            <div className="card-body" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
              {/* Totals Section */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Subtotal</span>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{formatQAR(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Discount</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-body)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-color)' }}>
                      <button 
                        type="button" 
                        onClick={() => setDiscountType('%')}
                        style={{ 
                          padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '12px',
                          background: discountType === '%' ? 'var(--brand-primary)' : 'transparent',
                          color: discountType === '%' ? '#000' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>%</button>
                      <button 
                        type="button" 
                        onClick={() => setDiscountType('QAR')}
                        style={{ 
                          padding: '4px 10px', borderRadius: '6px', border: 'none', fontSize: '12px',
                          background: discountType === 'QAR' ? 'var(--brand-primary)' : 'transparent',
                          color: discountType === 'QAR' ? '#000' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>QAR</button>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="number"
                        value={discount}
                        placeholder="0"
                        onChange={e => setDiscount(e.target.value)}
                        className="form-input no-spin"
                        style={{ 
                          width: '100%', padding: '6px 12px', paddingRight: '30px', height: '34px', fontSize: '13px',
                          background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                        {discountType === '%' ? '%' : 'QAR'}
                      </span>
                    </div>
                  </div>
                  {parseFloat(discount) > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-4px' }}>
                      Discount Amount: {formatQAR(discountAmount)}
                    </div>
                  )}
                </div>

                <div style={{ 
                  background: 'rgba(var(--brand-primary-rgb, 196, 154, 55), 0.05)', 
                  border: '1px solid var(--brand-primary)', 
                  borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 0 10px rgba(var(--brand-primary-rgb, 196, 154, 55), 0.1)'
                }}>
                  <span style={{ color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>GRAND TOTAL</span>
                  <span style={{ color: 'var(--brand-primary)', fontSize: '20px', fontWeight: 800 }}>{formatQAR(total)}</span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }}></div>

              {/* Payment Method Section */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>PAYMENT METHOD</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'Cash', icon: <IconCash size={14} /> },
                    { id: 'Card', icon: <IconCreditCard size={14} /> },
                    { id: 'UPI', icon: <IconUPI size={14} /> },
                    { id: 'Bank Transfer', icon: <IconBankTransfer size={14} />, label: 'Bank' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        padding: '8px 4px', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '54px', cursor: 'pointer',
                        border: paymentMethod === method.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        background: paymentMethod === method.id ? 'var(--brand-primary)' : 'var(--bg-body)',
                        color: paymentMethod === method.id ? '#000' : 'var(--text-primary)',
                        borderRadius: '10px', transition: 'all 0.2s'
                      }}
                    >
                      {method.icon}
                      <span style={{ fontWeight: 600 }}>{method.label || method.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0' }}></div>

              {/* Payment Status Section */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>PAYMENT STATUS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'Paid', icon: <IconCheck size={14} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                    { id: 'Pending', icon: <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid currentColor' }} />, color: 'var(--text-muted)', bg: 'transparent' }
                  ].map(status => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setPaymentStatus(status.id)}
                      style={{
                        padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', cursor: 'pointer',
                        border: paymentStatus === status.id ? `1px solid ${status.color}` : '1px solid var(--border-color)',
                        background: paymentStatus === status.id ? (status.id === 'Paid' ? '#c7fce5' : status.bg) : 'var(--bg-body)',
                        color: paymentStatus === status.id ? (status.id === 'Paid' ? '#064e3b' : status.color) : 'var(--text-primary)',
                        borderRadius: '10px', transition: 'all 0.2s', fontWeight: 600
                      }}
                    >
                      {status.icon}
                      {status.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            {items.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>?</div>
                Add at least one item
              </div>
            )}
            <button
              id="create-invoice-btn"
              onClick={handleSubmit}
              disabled={saving || items.length === 0 || !selectedCustomer || !!paymentError}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: items.length > 0 ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: items.length > 0 ? '#000' : 'var(--text-muted)',
                border: items.length > 0 ? 'none' : '1px solid var(--border-color)',
                cursor: items.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <IconCheck size={18} />
              {saving ? 'Creating Invoice...' : `Create Invoice • ${formatQAR(total)}`}
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CustomerModal onClose={() => setModalOpen(false)} onSave={handleCustomerSaved} />
      )}
    </div>
  )
}

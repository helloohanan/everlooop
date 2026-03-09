'use client'
import { useEffect, useState, useCallback } from 'react'
import { IconEdit, IconPlus, IconWarning, IconImage, IconDelete, IconClock, IconSave, IconSearch, IconInventory, IconSize, IconX, IconCheck } from '@/components/Icons'

interface Product {
  id: string
  productId: string
  name: string
  type: string
  size: string
  material: string
  purchasedPrice: number
  price: number
  stock: number
  lowStock: number
  description?: string
  image?: string
  createdAt: string
}

const TYPES = ['Persian', 'Turkish', 'Handmade', 'Machine-made', 'Berber', 'Kilim', 'Shaggy', 'Other']
const MATERIALS = ['Wool', 'Silk', 'Synthetic', 'Cotton', 'Jute', 'Other']

function ProductModal({ product, onClose, onSave }: {
  product: Product | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    productId: product?.productId || `EL-${Date.now().toString().slice(-4)}`,
    name: product?.name || '',
    type: product?.type || 'Persian',
    size: product?.size || '',
    material: product?.material || 'Wool',
    purchasedPrice: product?.purchasedPrice?.toString() || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    lowStock: product?.lowStock?.toString() || '5',
    description: product?.description || '',
    image: product?.image || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImagePreview(dataUrl)
      setForm(f => ({ ...f, image: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { onSave(); onClose() }
      else { const d = await res.json(); setError(d.error || 'Error saving') }
    } catch { setError('Connection error') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{product ? <><IconEdit /> Edit Product</> : <><IconPlus /> Add Carpet Product</>}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="alert alert-danger"><IconWarning /> {error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product ID *</label>
                <input id="prod-id" className="form-input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required placeholder="EL-1001" disabled={!!product} />
              </div>
              <div className="form-group">
                <label className="form-label">Carpet Name *</label>
                <input id="prod-name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Royal Persian Medallion" />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Carpet Type</label>
                <select id="prod-type" className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Size</label>
                <input id="prod-size" className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="e.g. 5x7, 8x10" />
              </div>
              <div className="form-group">
                <label className="form-label">Material</label>
                <select id="prod-material" className="form-select" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                  {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Purchased Price (QAR) *</label>
                <input id="prod-purchased-price" className="form-input" type="number" min="0" step="0.01" value={form.purchasedPrice} onChange={e => setForm({ ...form, purchasedPrice: e.target.value })} required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (QAR) *</label>
                <input id="prod-price" className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input id="prod-stock" className="form-input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert</label>
                <input id="prod-lowstock" className="form-input" type="number" min="0" value={form.lowStock} onChange={e => setForm({ ...form, lowStock: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="prod-desc" className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Carpet details, origin, craftsmanship..." />
            </div>
            <div className="form-group">
              <label className="form-label">Product Image (optional)</label>
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  background: 'var(--bg-table-header)',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => document.getElementById('prod-image-file')?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '6px' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '4px' }}><IconImage size={48} /></div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Click to select an image</div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>JPG, PNG, WEBP supported</div>
                  </div>
                )}
                {imagePreview && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ alignSelf: 'center' }}
                    onClick={e => { e.stopPropagation(); setImagePreview(''); setForm(f => ({ ...f, image: '' })) }}
                  >
                    <IconDelete /> Remove Image
                  </button>
                )}
              </div>
              <input
                id="prod-image-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-product">
              {saving ? <><IconClock style={{ marginRight: '8px' }} /> Saving...</> : <><IconSave style={{ marginRight: '8px' }} /> Save Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, type: typeFilter })
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, typeFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    load()
  }

  const formatCurr = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2 })}`

  const getStockLevel = (stock: number, low: number) => {
    if (stock === 0) return 'badge-danger'
    if (stock <= low) return 'badge-low'
    return 'badge-paid'
  }

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">Carpet Inventory</h1>
          <p className="section-subtitle">{products.length} products</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={() => { setEditProduct(null); setModalOpen(true) }}>
          <IconPlus style={{ marginRight: '8px' }} /> Add Product
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon"><IconSearch /></span>
          <input
            id="product-search"
            className="form-input search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          id="type-filter"
          className="form-select"
          style={{ width: 'auto' }}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconInventory size={48} /></div>
            <div className="empty-state-title">No products found</div>
            <div className="empty-state-desc">Add your first carpet product</div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {products.map(p => {
            const isSelected = selectedProductId === p.id
            return (
              <div
                key={p.id}
                className={`card flip-card ${isSelected ? 'flipped' : ''}`}
                onClick={() => setSelectedProductId(isSelected ? null : p.id)}
                style={{
                  padding: 0,
                  overflow: 'visible', // Must be visible for 3D flip
                  cursor: 'pointer',
                  perspective: '1000px', // 3D perspective
                  backgroundColor: 'transparent', // Let inner faces handle bg
                  border: 'none',
                  boxShadow: 'none',
                  height: '380px' // Fixed height to maintain grid
                }}
              >
                <div
                  className="flip-card-inner"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: isSelected ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(139, 92, 246, 0.4)' : 'var(--shadow-sm)',
                    borderRadius: '12px'
                  }}
                >
                  {/* Front Face */}
                  <div
                    className="flip-card-front"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    {/* Image */}
                    <div style={{ width: '100%', height: '160px', background: 'var(--bg-table-header)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <IconInventory size={64} />
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{p.name}</div>
                        <code style={{ fontSize: '11px', background: 'var(--bg-table-header)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-muted)' }}>{p.productId}</code>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconSize /> {p.size || '—'}</span>
                        <span>•</span>
                        <span>{p.type}</span>
                        <span>•</span>
                        <span>{p.material}</span>
                      </div>

                      {p.description && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cost:</span>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)' }}>{formatCurr(p.purchasedPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurr(p.price)}</span>
                          <span className={`badge ${getStockLevel(p.stock, p.lowStock)}`} style={{ fontSize: '11px' }}>
                            {p.stock === 0 ? <><IconX size={12} /> Out of Stock</> : p.stock <= p.lowStock ? <><IconWarning size={12} /> Low ({p.stock})</> : <><IconCheck size={12} /> {p.stock}</>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div> {/* End of flip-card-front */}

                  {/* Back Face */}
                  <div
                    className="flip-card-back"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      padding: '24px',
                      border: '1px solid var(--primary-color)',
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
                      borderRadius: '12px'
                    }}
                  >
                    <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '18px' }}>{p.name}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{p.productId}</div>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                      onClick={(e) => { e.stopPropagation(); setEditProduct(p); setModalOpen(true); }}
                    >
                      <IconEdit /> Edit Product
                    </button>

                    <button
                      className="btn btn-danger"
                      style={{ width: '100%', padding: '12px' }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                    >
                      <IconDelete /> Delete Product
                    </button>

                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: 'auto', padding: '10px' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedProductId(null); }}
                    >
                      Cancel
                    </button>
                  </div> {/* End of flip-card-back */}
                </div> {/* End of flip-card-inner */}
              </div> // End of flip-card
            )
          })}
        </div>
      )}

      {modalOpen && (
        <ProductModal product={editProduct} onClose={() => setModalOpen(false)} onSave={load} />
      )}
    </div>
  )
}

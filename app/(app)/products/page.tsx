'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  IconEdit, IconPlus, IconWarning, IconImage, IconDelete, IconClock, IconSave, IconSearch, IconInventory, IconSize, IconX, IconCheck,
  IconFilter, IconRefresh
} from '@/components/Icons'

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
  images: string[]
  createdAt: string
}

const TYPES = ['Persian', 'Turkish', 'Handmade', 'Machine-made', 'Berber', 'Kilim', 'Shaggy', 'Other']
const MATERIALS = ['Wool', 'Silk', 'Synthetic', 'Cotton', 'Jute', 'Other']

function ProductCard({
  p,
  isSelected,
  onSelect,
  openAdminAction,
  formatCurr,
  getStockLevel
}: {
  p: Product,
  isSelected: boolean,
  onSelect: (id: string | null) => void,
  openAdminAction: (action: any, data?: Product) => void,
  formatCurr: (n: number) => string,
  getStockLevel: (stock: number, low: number) => string
}) {
  const [showThumbnail, setShowThumbnail] = useState(true);

  const thumbImage = p.images?.find(img => img.toLowerCase().includes('-thumb')) || p.images?.[0];
  const mainImage = p.images?.find(img => !img.toLowerCase().includes('-thumb')) || p.images?.[0];

  const currentImage = showThumbnail ? thumbImage : mainImage;

  return (
    <div
      className={`card flip-card ${isSelected ? 'flipped' : ''}`}
      onClick={() => onSelect(isSelected ? null : p.id)}
      style={{
        padding: 0,
        overflow: 'visible',
        cursor: 'pointer',
        perspective: '1000px',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        height: '400px'
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
          <div style={{ position: 'relative', width: '100%', height: '180px', background: 'var(--bg-table-header)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {currentImage ? (
              <img src={currentImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconInventory size={64} style={{ opacity: 0.3 }} />
            )}

            {p.images && p.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThumbnail(!showThumbnail);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 10,
                  transition: 'all 0.2s',
                  color: 'var(--primary-color)'
                }}
                title="Swap Image"
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IconRefresh size={18} />
              </button>
            )}

            {p.images && p.images.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}>
                {showThumbnail ? 'Thumbnail View' : 'Original Design'}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, textAlign: 'left' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', color: 'var(--text-color)' }}>{p.name}</div>
              <span style={{ fontSize: '12px', background: 'var(--bg-table-header)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 500 }}>{p.productId}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IconSize size={14} /> {p.size || '—'}</span>
              <span>•</span>
              <span>{p.type}</span>
              <span>•</span>
              <span>{p.material}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary-color)' }}>{formatCurr(p.price)}</span>
                <span className={`badge ${getStockLevel(p.stock, p.lowStock)}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {p.stock === 0 ? <><IconX size={12} /> Out</> : p.stock <= p.lowStock ? <><IconWarning size={12} /> Low ({p.stock})</> : <><IconCheck size={12} /> {p.stock} in stock</>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="flip-card-back"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '24px',
            border: '2px solid var(--primary-color)',
            transform: 'rotateY(180deg)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-color)', fontSize: '18px', fontWeight: 700 }}>{p.name}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.productId}</div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={(e) => { e.stopPropagation(); openAdminAction('view', p); }}
          >
            <IconSearch size={18} /> View Detailed Info
          </button>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={(e) => { e.stopPropagation(); openAdminAction('edit', p); }}
          >
            <IconEdit size={18} /> Edit Product
          </button>

          <button
            className="btn btn-danger"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={(e) => { e.stopPropagation(); openAdminAction('delete', p); }}
          >
            <IconDelete size={18} /> Delete Product
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 'auto', padding: '10px', fontSize: '13px' }}
            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
          >
            Close Actions
          </button>
        </div>
      </div>
    </div>
  );
}

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
    images: product?.images || [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImagePreviews(prev => [...prev, dataUrl].slice(0, 5))
        setForm(f => ({ ...f, images: [...f.images, dataUrl].slice(0, 5) }))
      }
      reader.readAsDataURL(file)
    })
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
              <label className="form-label">Product Images (up to 5)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {imagePreviews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', height: '100px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={p} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                      onClick={() => {
                        setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
                        setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '10px',
                      height: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-table-header)',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => document.getElementById('prod-image-file')?.click()}
                  >
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                      <IconImage size={24} />
                      <div style={{ fontSize: '10px', fontWeight: 600 }}>Add Image</div>
                    </div>
                  </div>
                )}
              </div>
              <input
                id="prod-image-file"
                type="file"
                accept="image/*"
                multiple
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

function ProductDetailsModal({ product, onClose }: {
  product: Product
  onClose: () => void
}) {
  const formatCurr = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2 })}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title"><IconInventory /> Product Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'var(--bg-table-header)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconInventory size={64} />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {product.images?.slice(1).map((img, i) => (
                    <img key={i} src={img} alt={`${product.name} ${i + 2}`} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ flex: '2', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{product.name}</h1>
                <code style={{ fontSize: '14px', background: 'var(--bg-table-header)', padding: '4px 8px', borderRadius: '4px' }}>{product.productId}</code>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ opacity: 0.6, fontSize: '12px', marginBottom: '2px', display: 'block' }}>Type</label>
                  <div style={{ fontWeight: 600 }}>{product.type}</div>
                </div>
                <div>
                  <label className="form-label" style={{ opacity: 0.6, fontSize: '12px', marginBottom: '2px', display: 'block' }}>Material</label>
                  <div style={{ fontWeight: 600 }}>{product.material}</div>
                </div>
                <div>
                  <label className="form-label" style={{ opacity: 0.6, fontSize: '12px', marginBottom: '2px', display: 'block' }}>Size</label>
                  <div style={{ fontWeight: 600 }}>{product.size || 'N/A'}</div>
                </div>
                <div>
                  <label className="form-label" style={{ opacity: 0.6, fontSize: '12px', marginBottom: '2px', display: 'block' }}>Stock Status</label>
                  <div style={{ fontWeight: 600 }}>{product.stock} items</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ opacity: 0.6, fontSize: '13px' }}>Purchased Price (Cost)</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{formatCurr(product.purchasedPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ opacity: 0.6, fontSize: '13px' }}>Selling Price</span>
                  <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--primary-color)' }}>{formatCurr(product.price)}</span>
                </div>
              </div>
            </div>
          </div>
          {product.description && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label className="form-label" style={{ opacity: 0.6, fontSize: '12px', marginBottom: '4px', display: 'block' }}>Description</label>
              <p style={{ lineHeight: 1.6, fontSize: '14px' }}>{product.description}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose} style={{ width: '120px' }}>Close</button>
        </div>
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
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([])
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [pendingAction, setPendingAction] = useState<{ type: 'add' | 'edit' | 'deleted' | 'delete' | 'view', data?: Product } | null>(null)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name-asc')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, type: typeFilter })
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, typeFilter])

  const loadDeleted = async () => {
    setLoading(true)
    const res = await fetch(`/api/products?deleted=true`)
    const data = await res.json()
    setDeletedProducts(Array.isArray(data) ? data : [])
    setLoading(false)
    setShowDeleted(true)
  }

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Move "${name}" to recently deleted?`)) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    load()
  }

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore' })
    })
    if (res.ok) {
      loadDeleted()
      load()
    }
  }

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword === 'admin123') {
      setPasswordModalOpen(false)
      setAdminPassword('')
      if (pendingAction?.type === 'deleted') {
        loadDeleted()
      } else if (pendingAction?.type === 'add') {
        setEditProduct(null)
        setModalOpen(true)
      } else if (pendingAction?.type === 'edit' && pendingAction.data) {
        setEditProduct(pendingAction.data)
        setModalOpen(true)
      } else if (pendingAction?.type === 'delete' && pendingAction.data) {
        handleDelete(pendingAction.data.id, pendingAction.data.name)
      } else if (pendingAction?.type === 'view' && pendingAction.data) {
        setViewProduct(pendingAction.data)
      }
      setPendingAction(null)
    } else {
      setPasswordError('Incorrect password')
    }
  }

  const openAdminAction = (action: 'add' | 'edit' | 'deleted' | 'delete' | 'view', data?: Product) => {
    setPendingAction({ type: action, data })
    setPasswordModalOpen(true)
    setPasswordError('')
  }

  const formatCurr = (n: number) => `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2 })}`

  const getStockLevel = (stock: number, low: number) => {
    if (stock === 0) return 'badge-danger'
    if (stock <= low) return 'badge-low'
    return 'badge-paid'
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.productId.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name)
      case 'name-desc': return b.name.localeCompare(a.name)
      case 'price-asc': return a.price - b.price
      case 'price-desc': return b.price - a.price
      case 'stock-asc': return a.stock - b.stock
      case 'stock-desc': return b.stock - a.stock
      default: return 0
    }
  })

  return (
    <div className="page-content">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {showDeleted ? 'Recently Deleted' : selectedCategory ? `Inventory: ${selectedCategory}` : 'Carpet Inventory'}
          </h1>
          <p className="section-subtitle">
            {showDeleted ? deletedProducts.length : selectedCategory ? filteredProducts.filter(p => p.name.split(' ')[0] === selectedCategory).length : Object.keys(filteredProducts.reduce((acc, p) => {
              const cat = p.name.split(' ')[0]
              acc[cat] = (acc[cat] || 0) + 1
              return acc
            }, {} as Record<string, number>)).length} {showDeleted || selectedCategory ? 'products' : 'categories'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {selectedCategory && !showDeleted && (
            <button className="btn btn-secondary" onClick={() => setSelectedCategory(null)}>
              Back to Categories
            </button>
          )}
          {!showDeleted && (
            <button className="btn btn-secondary" onClick={() => openAdminAction('deleted')}>
              <IconClock style={{ marginRight: '8px' }} /> Recently Deleted
            </button>
          )}
          {showDeleted && (
            <button className="btn btn-secondary" onClick={() => setShowDeleted(false)}>
              Back to Inventory
            </button>
          )}
          <button id="add-product-btn" className="btn btn-primary" onClick={() => openAdminAction('add')}>
            <IconPlus style={{ marginRight: '8px' }} /> Add Product
          </button>
        </div>
      </div>

      {!showDeleted && (
        <>
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '180px' }}>
                <select
                  id="type-filter"
                  className="form-input"
                  style={{ appearance: 'none', paddingLeft: '36px', paddingRight: '32px' }}
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--brand-primary)' }}>
                  <IconFilter size={16} />
                </span>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>

              <div style={{ position: 'relative', width: '200px' }}>
                <select
                  className="form-input"
                  style={{ appearance: 'none', paddingRight: '32px' }}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="name-asc">Name (Ascending)</option>
                  <option value="name-desc">Name (Descending)</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                  <option value="stock-asc">Stock (Low-High)</option>
                  <option value="stock-desc">Stock (High-Low)</option>
                </select>
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>
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
          ) : !selectedCategory ? (
            /* Category Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
            }}>
              {Object.entries(filteredProducts.reduce((acc, p) => {
                const cat = p.name.split(' ')[0]
                if (!acc[cat]) {
                  const thumb = p.images?.find(img => img.toLowerCase().includes('-thumb'))
                  acc[cat] = { count: 0, image: thumb || p.images?.[0] }
                }
                acc[cat].count++
                if (!acc[cat].image && p.images) {
                  const thumb = p.images.find(img => img.toLowerCase().includes('-thumb'))
                  acc[cat].image = thumb || p.images[0]
                }
                return acc
              }, {} as Record<string, { count: number, image?: string }>))
                .sort(([a], [b]) => sortBy.includes('desc') ? b.localeCompare(a) : a.localeCompare(b))
                .map(([cat, info]) => (
                  <div
                    key={cat}
                    className="card"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div style={{ width: '100%', height: '180px', background: 'var(--bg-table-header)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {info.image ? (
                        <img src={info.image} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <IconInventory size={64} style={{ opacity: 0.3 }} />
                      )}
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700 }}>{cat}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{info.count} Products</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            /* Product Grid for Selected Category */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}>
              {filteredProducts.filter(p => p.name.split(' ')[0] === selectedCategory).map(p => (
                <ProductCard
                  key={p.id}
                  p={p}
                  isSelected={selectedProductId === p.id}
                  onSelect={setSelectedProductId}
                  openAdminAction={openAdminAction}
                  formatCurr={formatCurr}
                  getStockLevel={getStockLevel}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showDeleted && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>ID</th>
                  <th>Deleted At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                      No recently deleted products
                    </td>
                  </tr>
                ) : (
                  deletedProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.type} • {p.size}</div>
                      </td>
                      <td><code>{p.productId}</code></td>
                      <td style={{ fontSize: '13px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleRestore(p.id)}>
                          <IconCheck /> Put Back
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="modal-overlay" onClick={() => setPasswordModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Admin Access Required</h2>
              <button className="modal-close" onClick={() => setPasswordModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAdminAuth}>
              <div className="modal-body">
                <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  Enter admin password to view recently deleted items.
                </p>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={adminPassword}
                    onChange={e => { setAdminPassword(e.target.value); setPasswordError('') }}
                    autoFocus
                    required
                  />
                  {passwordError && <div style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '4px' }}>{passwordError}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductModal product={editProduct} onClose={() => setModalOpen(false)} onSave={load} />
      )}

      {viewProduct && (
        <ProductDetailsModal product={viewProduct} onClose={() => setViewProduct(null)} />
      )}
    </div>
  )
}

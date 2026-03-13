'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { IconCheck, IconPrint, IconDownload, IconDelete, IconClock, IconPhone, IconEmail, IconLocation } from '@/components/Icons'
import { numberToWords, formatDate, formatTime } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  subtotal: number
  discount: number
  vat: number
  total: number
  paymentMethod: string
  paymentStatus: string
  notes?: string
  customer: {
    name: string; phone?: string; email?: string; address?: string
  }
  items: {
    id: string; quantity: number; price: number; size: string; total: number;
    product: { name: string; productId: string; type: string; size: string; material: string }
  }[]
}

function formatQAR(n: number) {
  return `QAR ${n.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}


function InvoiceDetailContent({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(r => r.json())
      .then(d => { setInvoice(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (invoice && searchParams.get('print') === 'true') {
      setTimeout(() => window.print(), 500)
    }
  }, [invoice, searchParams])

  const handlePrint = () => window.print()

  const handleStatusUpdate = async (status: string) => {
    if (!invoice) return
    setUpdating(true)
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: status, paymentMethod: invoice.paymentMethod }),
    })
    const data = await res.json()
    if (res.ok) setInvoice({ ...invoice, paymentStatus: status })
    setUpdating(false)
  }

  const handleDelete = async () => {
    if (!invoice || !confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/invoices')
        router.refresh()
      } else {
        alert('Failed to delete invoice')
        setUpdating(false)
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting invoice')
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!invoice) {
    return <div className="page-content"><div className="alert alert-danger">Invoice not found</div></div>
  }

  return (
    <div className="page-content">
      {/* Actions Bar - hidden in print */}
      <div className="section-header no-print">
        <div>
          <a href="/invoices" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Back to Invoices</a>
          <h1 className="section-title" style={{ marginTop: '4px' }}>{invoice.invoiceNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-success"
            onClick={() => handleStatusUpdate('Paid')}
            disabled={updating}
            id="mark-paid-btn"
          >
            <IconCheck style={{ marginRight: '8px' }} /> Mark as Paid
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} id="print-btn"><IconPrint style={{ marginRight: '8px' }} /> Print</button>
          <button className="btn btn-primary" onClick={handlePrint} id="download-pdf-btn"><IconDownload style={{ marginRight: '8px' }} /> Download PDF</button>
          <button
            className="btn btn-secondary"
            onClick={handleDelete}
            disabled={updating}
            style={{ color: '#ef4444', borderColor: '#ef4444' }}
            id="delete-invoice-btn"
          >
            <IconDelete style={{ marginRight: '8px' }} /> Delete
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div ref={printRef} className="invoice-preview" id="invoice-document">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <Image
              src="/logo.png"
              alt="Ever Loop Carpets"
              width={200}
              height={70}
              style={{ width: '200px', height: 'auto', objectFit: 'contain', marginBottom: '8px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
              Al Waab Street, Doha, Qatar<br />
              Tel: +974 4444 5555<br />
              Email: info@everloop.qa
            </div>
          </div>
          <div className="invoice-meta">
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Invoice Number</div>
            <div className="invoice-num" style={{ fontSize: '16px', fontWeight: 600 }}>#{invoice.invoiceNumber}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
              <div><strong>Date:</strong> {formatDate(invoice.date)}</div>
              <div><strong>Time:</strong> {formatTime(invoice.date)}</div>
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: invoice.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7',
                  color: invoice.paymentStatus === 'Paid' ? '#065f46' : '#92400e',
                }}>
                  {invoice.paymentStatus === 'Paid' ? <><IconCheck size={10} style={{ marginRight: '4px' }} /> PAID</> : <><IconClock size={10} style={{ marginRight: '4px' }} /> PENDING</>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bill To</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a2744' }}>{invoice.customer.name}</div>
            {invoice.customer.phone && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}><IconPhone size={12} /> {invoice.customer.phone}</div>}
            {invoice.customer.email && <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><IconEmail size={12} /> {invoice.customer.email}</div>}
            {invoice.customer.address && <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><IconLocation size={12} /> {invoice.customer.address}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Payment</div>
            <div style={{ fontSize: '13px', color: '#1a2744' }}>
              <div><strong>Method:</strong> {invoice.paymentMethod}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Details</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id}>
                <td style={{ color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#1a2744' }}>{item.product.name}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.product.productId}</div>
                </td>
                <td style={{ fontSize: '12px', color: '#6b7280' }}>
                  {item.product.type} · {item.size || item.product.size} · {item.product.material}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatQAR(item.price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatQAR(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Line divider after products */}
        <div style={{ margin: '12px 0', height: '1px', background: '#e5e7eb' }}></div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div className="invoice-totals" style={{ padding: '0', background: 'transparent', border: 'none', width: 'auto', textAlign: 'right' }}>
            <div className="invoice-total-row grand" style={{ borderBottom: 'none' }}>
              <span style={{ marginRight: '40px' }}>Grand Total</span>
              <span style={{ color: 'var(--brand-primary)' }}>{formatQAR(invoice.total)}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '-4px' }}>
              {numberToWords(invoice.total)} Only
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ marginTop: '24px', padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', borderLeft: '3px solid #c9973a' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Notes</div>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>{invoice.notes}</div>
          </div>
        )}

        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          Thank you for choosing Ever Loop Carpets — Doha, Qatar
        </div>
      </div>

      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .sidebar, .main-content > *:not(.page-content) { display: none !important; }
          body { background: white !important; }
          .main-content { margin-left: 0 !important; }
          .invoice-preview { 
            box-shadow: none !important; 
            max-width: 100% !important; 
            border-radius: 0 !important; 
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .invoice-header { margin-bottom: 12px; padding-bottom: 8px; }
          .invoice-table { margin: 10px 0; }
          .invoice-table th { padding: 6px 12px; font-size: 11px; }
          .invoice-table td { padding: 6px 12px; font-size: 11px; }
          .invoice-num { font-size: 14px; }
          .invoice-logo { font-size: 22px; }
          .page-content { padding: 0 !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  )
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="page-content"><div className="spinner" /></div>}>
      <InvoiceDetailContent id={params.id} />
    </Suspense>
  )
}

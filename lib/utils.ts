export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `EL-${year}${month}-${random}`
}

export function formatCurrency(amount: number): string {
  return `QAR ${amount.toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-QA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function calculateVAT(subtotal: number, discount: number = 0): {
  discountAmount: number
  afterDiscount: number
  vat: number
  total: number
} {
  const discountAmount = (subtotal * discount) / 100
  const afterDiscount = subtotal - discountAmount
  const vat = afterDiscount * 0.05
  const total = afterDiscount + vat
  return { discountAmount, afterDiscount, vat, total }
}

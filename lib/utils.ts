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

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-QA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
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

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero QAR'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const thousands = ['', 'Thousand', 'Million', 'Billion']

  function convertGroup(n: number): string {
    let s = ''
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 10 && n <= 19) {
      s += teens[n - 10] + ' '
    } else {
      if (n >= 20) {
        s += tens[Math.floor(n / 10)] + ' '
        n %= 10
      }
      if (n >= 1) {
        s += ones[n] + ' '
      }
    }
    return s
  }

  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)

  let result = ''
  let groupIdx = 0
  let tempInteger = integerPart

  if (tempInteger === 0) {
    result = ''
  } else {
    while (tempInteger > 0) {
      const group = tempInteger % 1000
      if (group !== 0) {
        result = convertGroup(group) + thousands[groupIdx] + ' ' + result
      }
      tempInteger = Math.floor(tempInteger / 1000)
      groupIdx++
    }
  }

  result = result.trim() + ' QAR'

  if (decimalPart > 0) {
    result += ' and ' + convertGroup(decimalPart).trim() + ' Dirhams'
  }

  return result.trim()
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'
import { revalidatePath } from 'next/cache'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const date = searchParams.get('date') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          status ? { paymentStatus: status } : {},
          date === 'today' ? { date: { gte: startOfDay } } : {},
          search ? {
            OR: [
              { invoiceNumber: { contains: search } },
              { customer: { name: { contains: search } } },
            ]
          } : {},
        ]
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true, productId: true } } } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json(invoices)
  } catch (err) {
    console.error('GET invoices error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, items, discount, paymentMethod, paymentStatus, notes } = body

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Customer and items are required' }, { status: 400 })
    }

    // Validate products and calculate totals
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const productMap = new Map(products.map(p => [p.id, p]))
    let subtotal = 0
    const validatedItems: { productId: string; quantity: number; price: number; size?: string; total: number }[] = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 })
      }

      const itemPrice = typeof item.price === 'number' ? item.price : product.price
      const total = itemPrice * item.quantity
      subtotal += total
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        size: item.size || product.size,
        total
      })
    }

    const discountAmount = discount || 0
    const total = subtotal - discountAmount

    // Create invoice and reduce stock in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          customerId,
          subtotal,
          discount: discountAmount,
          vat: 0,
          total,
          paymentMethod: paymentMethod || 'Cash',
          paymentStatus: paymentStatus || 'Paid',
          notes,
          items: {
            create: validatedItems,
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      })

      // 2. Bulk Update Stock (Still sequential but inside transaction is safer)
      // For PostgreSQL, we could do a single query but Prisma's update is fine if we're careful.
      await Promise.all(validatedItems.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ))

      return inv
    }, {
      timeout: 10000 // Increase timeout to 10s for large invoices
    })

    // Revalidate dashboard data
    revalidatePath('/')
    revalidatePath('/api/dashboard')

    return NextResponse.json(invoice, { status: 201 })

  } catch (err) {
    console.error('POST invoice error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

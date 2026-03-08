import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          status ? { paymentStatus: status } : {},
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
    let subtotal = 0
    const validatedItems: { productId: string; quantity: number; price: number; total: number }[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 })
      }
      const total = product.price * item.quantity
      subtotal += total
      validatedItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, total })
    }

    const discountAmount = (subtotal * (discount || 0)) / 100
    const afterDiscount = subtotal - discountAmount
    const vat = afterDiscount * 0.05
    const total = afterDiscount + vat

    // Create invoice and reduce stock in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          customerId,
          subtotal,
          discount: discount || 0,
          vat,
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

      // Reduce stock for each item
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return inv
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (err) {
    console.error('POST invoice error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

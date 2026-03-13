export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // day, month, year

    const now = new Date()
    let startDate: Date

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const invoices = await prisma.invoice.findMany({
      where: { date: { gte: startDate } },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, type: true } } } },
      },
      orderBy: { date: 'desc' },
    })

    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0)
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter(i => i.paymentStatus === 'Paid').length
    const pendingInvoices = invoices.filter(i => i.paymentStatus === 'Pending').length

    // Product sales summary
    const productSales: Record<string, { name: string; type: string; quantity: number; revenue: number }> = {}
    for (const inv of invoices) {
      for (const item of inv.items) {
        const key = item.productId
        if (!productSales[key]) {
          productSales[key] = { name: item.product.name, type: item.product.type, quantity: 0, revenue: 0 }
        }
        productSales[key].quantity += item.quantity
        productSales[key].revenue += item.total
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Payment method breakdown
    const paymentMethods: Record<string, number> = {}
    for (const inv of invoices) {
      paymentMethods[inv.paymentMethod] = (paymentMethods[inv.paymentMethod] || 0) + inv.total
    }

    return NextResponse.json({
      period,
      totalRevenue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      topProducts,
      paymentMethods,
      invoices: invoices.slice(0, 20),
    })
  } catch (err) {
    console.error('Reports error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

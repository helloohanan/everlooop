import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Today's stats
    const todayInvoices = await prisma.invoice.findMany({
      where: { date: { gte: startOfDay } },
    })
    const todaySales = todayInvoices.reduce((s, i) => s + i.total, 0)
    const todayCount = todayInvoices.length

    // Total stats
    const totalInvoices = await prisma.invoice.count()
    const totalProducts = await prisma.product.count()
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 3 } },
      select: { id: true, name: true, stock: true, productId: true },
    })

    // Monthly sales for last 6 months
    const months: { month: string; revenue: number; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const invs = await prisma.invoice.findMany({
        where: { date: { gte: start, lte: end } },
      })
      months.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: invs.reduce((s, i) => s + i.total, 0),
        count: invs.length,
      })
    }

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { customer: { select: { name: true } } },
    })

    return NextResponse.json({
      todaySales,
      todayCount,
      totalInvoices,
      totalProducts,
      lowStockProducts,
      monthly: months,
      recentInvoices,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

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
      include: { items: { include: { product: { select: { purchasedPrice: true } } } } }
    })
    const todaySales = todayInvoices.reduce((s, i) => s + i.total, 0)
    const todayCost = todayInvoices.reduce((s, i) => s + i.items.reduce((cs, item) => cs + (item.quantity * item.product.purchasedPrice), 0), 0)
    const todayProfit = todaySales - todayCost
    const todayCount = todayInvoices.length

    // Total stats
    const totalInvoices = await prisma.invoice.count()
    const totalProducts = await prisma.product.count()
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 3 } },
      select: { id: true, name: true, stock: true, productId: true },
    })

    const allInvoices = await prisma.invoice.findMany({
      include: { items: { include: { product: { select: { purchasedPrice: true } } } } }
    })
    const totalRevenue = allInvoices.reduce((s, i) => s + i.total, 0)
    const totalCost = allInvoices.reduce((s, i) => s + i.items.reduce((cs, item) => cs + (item.quantity * item.product.purchasedPrice), 0), 0)
    const totalProfit = totalRevenue - totalCost

    // Daily sales for last 7 days
    const daily: { label: string; revenue: number; profit: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59)
      const invs = await prisma.invoice.findMany({
        where: { date: { gte: start, lte: end } },
        include: { items: { include: { product: { select: { purchasedPrice: true } } } } }
      })
      const rev = invs.reduce((s, i) => s + i.total, 0)
      const cost = invs.reduce((s, i) => s + i.items.reduce((cs, item) => cs + (item.quantity * item.product.purchasedPrice), 0), 0)
      daily.push({
        label: start.toLocaleDateString('default', { weekday: 'short' }),
        revenue: rev,
        profit: rev - cost,
        count: invs.length,
      })
    }

    // Monthly sales for last 6 months
    const monthly: { label: string; revenue: number; profit: number; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const invs = await prisma.invoice.findMany({
        where: { date: { gte: start, lte: end } },
        include: { items: { include: { product: { select: { purchasedPrice: true } } } } }
      })
      const rev = invs.reduce((s, i) => s + i.total, 0)
      const cost = invs.reduce((s, i) => s + i.items.reduce((cs, item) => cs + (item.quantity * item.product.purchasedPrice), 0), 0)
      monthly.push({
        label: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: rev,
        profit: rev - cost,
        count: invs.length,
      })
    }

    // Yearly sales for last 5 years
    const yearly: { label: string; revenue: number; profit: number; count: number }[] = []
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now.getFullYear() - i, 0, 1)
      const end = new Date(now.getFullYear() - i, 11, 31, 23, 59, 59)
      const invs = await prisma.invoice.findMany({
        where: { date: { gte: start, lte: end } },
        include: { items: { include: { product: { select: { purchasedPrice: true } } } } }
      })
      const rev = invs.reduce((s, i) => s + i.total, 0)
      const cost = invs.reduce((s, i) => s + i.items.reduce((cs, item) => cs + (item.quantity * item.product.purchasedPrice), 0), 0)
      yearly.push({
        label: start.getFullYear().toString(),
        revenue: rev,
        profit: rev - cost,
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
      todayProfit,
      todayCount,
      totalInvoices,
      totalProducts,
      lowStockProducts,
      totalRevenue,
      totalProfit,
      daily,
      monthly,
      yearly,
      recentInvoices,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

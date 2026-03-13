import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        _count: { select: { invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch (err) {
    console.error('GET customers error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: { name, phone, email, address },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (err) {
    console.error('POST customer error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          include: { items: { include: { product: true } } },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(customer)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, phone, email, address } = body

    const customer = await prisma.customer.update({
      where: { id },
      data: { name, phone, email, address },
    })

    return NextResponse.json(customer)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    })
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(invoice)
  } catch {
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
    const { paymentStatus, paymentMethod } = body

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { paymentStatus, paymentMethod },
    })

    return NextResponse.json(invoice)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.invoice.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete invoice error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
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
    const { name, type, size, material, purchasedPrice, price, stock, lowStock, description, image } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        type,
        size,
        material,
        purchasedPrice: parseFloat(purchasedPrice) || 0,
        price: parseFloat(price),
        stock: parseInt(stock),
        lowStock: parseInt(lowStock) || 5,
        description,
        image,
      },
    })

    return NextResponse.json(product)
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
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (body.action === 'restore') {
      await prisma.product.update({
        where: { id },
        data: { deletedAt: null }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

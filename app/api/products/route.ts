import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    
    const products = await prisma.product.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search } },
              { productId: { contains: search } },
              { type: { contains: search } },
            ]
          } : {},
          type ? { type } : {},
        ]
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(products)
  } catch (err) {
    console.error('GET products error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, type, size, material, price, stock, lowStock, description, image } = body
    
    if (!productId || !name || !price) {
      return NextResponse.json({ error: 'Product ID, name and price are required' }, { status: 400 })
    }
    
    const product = await prisma.product.create({
      data: {
        productId,
        name,
        type: type || 'Other',
        size: size || '',
        material: material || 'Other',
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        lowStock: parseInt(lowStock) || 5,
        description,
        image,
      },
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 400 })
    }
    console.error('POST product error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

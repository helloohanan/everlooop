import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    await createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    })

    return NextResponse.json({ success: true, role: user.role, name: user.name })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

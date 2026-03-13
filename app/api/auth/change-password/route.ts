import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: session.userId } })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
        }

        const hashed = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Change password error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

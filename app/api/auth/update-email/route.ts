import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 })
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Since we can't reliably use findUnique on email in types right now, we use a more generic update
        await (prisma.user as any).update({
            where: { id: session.userId },
            data: { email }
        })

        return NextResponse.json({ success: true, message: 'Company email updated successfully' })
    } catch (err: any) {
        console.error('Update email error:', err)
        if (err.code === 'P2002') {
            return NextResponse.json({ error: 'This email is already in use' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { action, email, code, password } = await request.json()

        if (action === 'send') {
            if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

            const user = await (prisma.user as any).findUnique({ where: { email } })
            if (!user) {
                return NextResponse.json({ error: 'Email not found' }, { status: 404 })
            }

            const secretCode = Math.floor(100000 + Math.random() * 900000).toString()
            const expiry = new Date(Date.now() + 15 * 60 * 1000)

            await (prisma.user as any).update({
                where: { id: user.id },
                data: {
                    recoveryCode: secretCode,
                    recoveryExpiry: expiry
                }
            })

            console.log(`[RECOVERY] Code for ${email}: ${secretCode}`)
            return NextResponse.json({ success: true, message: 'Recovery code sent to email' })
        }

        if (action === 'verify') {
            if (!email || !code) return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })

            const user = await (prisma.user as any).findUnique({ where: { email } })
            if (!user || user.recoveryCode !== code || (user.recoveryExpiry && new Date(user.recoveryExpiry) < new Date())) {
                return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
            }

            return NextResponse.json({ success: true })
        }

        if (action === 'reset') {
            if (!email || !code || !password) return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

            const user = await (prisma.user as any).findUnique({ where: { email } })
            if (!user || user.recoveryCode !== code || (user.recoveryExpiry && new Date(user.recoveryExpiry) < new Date())) {
                return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            await (prisma.user as any).update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    recoveryCode: null,
                    recoveryExpiry: null
                }
            })

            return NextResponse.json({ success: true, message: 'Password reset successfully' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (err) {
        console.error('Recovery error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

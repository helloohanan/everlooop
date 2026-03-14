import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
        }

        // Verify token
        const resetToken = await (prisma as any).passwordResetToken.findUnique({
            where: { token }
        })

        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
        }

        // Check expiration
        if (new Date(resetToken.expiresAt) < new Date()) {
            await (prisma as any).passwordResetToken.delete({ where: { id: resetToken.id } })
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user password
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { 
                password: hashedPassword,
                // Also clear the old recovery fields if they exist
                recoveryCode: null,
                recoveryExpiry: null
            }
        })

        // Delete the used token
        await (prisma as any).passwordResetToken.delete({
            where: { id: resetToken.id }
        })

        return NextResponse.json({ 
            success: true, 
            message: 'Password has been reset successfully' 
        })
    } catch (err: any) {
        console.error('Reset password error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

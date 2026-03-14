import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // For security reasons, don't reveal if a user exists or not
            return NextResponse.json({ 
                success: true, 
                message: 'If an account exists with this email, a reset link has been sent.' 
            })
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Store token in database
        await (prisma as any).passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt
            }
        })

        // Create reset link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetLink = `${appUrl}/reset-password?token=${token}`

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        // Send email
        const mailOptions = {
            from: `"Ever Loop Carpets" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Password Reset</h2>
                    <p>You requested a password reset for your Ever Loop Carpets account.</p>
                    <p>Click the button below to reset your password. This link is valid for 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p style="color: #777; font-size: 12px; margin-top: 30px;">
                        If the button above doesn't work, copy and paste this link into your browser: <br>
                        <a href="${resetLink}">${resetLink}</a>
                    </p>
                </div>
            `,
        }

        await transporter.sendMail(mailOptions)

        return NextResponse.json({ 
            success: true, 
            message: 'If an account exists with this email, a reset link has been sent.' 
        })
    } catch (err: any) {
        console.error('Forgot password error:', err)
        return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
    }
}

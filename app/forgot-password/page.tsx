'use client'
import { useState } from 'react'
import { IconWarning, IconCheck } from '@/components/Icons'
import Image from 'next/image'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'

function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()
            if (res.ok) {
                setSuccess(data.message)
            } else {
                setError(data.error || 'Failed to send reset link')
            }
        } catch {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <Image
                        src="/logo.png"
                        alt="Ever Loop Carpets"
                        width={260}
                        height={90}
                        style={{ width: '260px', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                        priority
                    />
                </div>

                <div className="login-form">
                    <h3 className="step-title" style={{ color: 'white', marginBottom: '8px' }}>Forgot Password</h3>
                    <p className="step-desc" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="login-input-group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="login-input"
                                required
                            />
                        </div>

                        {error && <div className="login-error"><IconWarning size={14} /> {error}</div>}
                        {success && <div className="login-success"><IconCheck size={14} /> {success}</div>}

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link href="/login" className="btn-text" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <ThemeProvider>
            <ForgotPasswordForm />
        </ThemeProvider>
    )
}

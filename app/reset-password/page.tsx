'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconWarning, IconCheck, IconLock } from '@/components/Icons'
import Image from 'next/image'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.')
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()
            if (res.ok) {
                setSuccess('Password reset successfully! Redirecting to login...')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                setError(data.error || 'Failed to reset password')
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
                    <h3 className="step-title" style={{ color: 'white', marginBottom: '8px' }}>Set New Password</h3>
                    <p className="step-desc" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px' }}>
                        Please enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="login-input-group">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="login-input"
                                required
                                disabled={!token || !!success}
                            />
                        </div>

                        <div className="login-input-group">
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="login-input"
                                required
                                disabled={!token || !!success}
                            />
                        </div>

                        {error && <div className="login-error"><IconWarning size={14} /> {error}</div>}
                        {success && <div className="login-success"><IconCheck size={14} /> {success}</div>}

                        <button type="submit" disabled={loading || !token || !!success} className="login-btn">
                            {loading ? 'Updating...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
    return (
        <ThemeProvider>
            <Suspense fallback={<div className="login-page"><div className="login-card"><p style={{color: 'white'}}>Loading...</p></div></div>}>
                <ResetPasswordForm />
            </Suspense>
        </ThemeProvider>
    )
}

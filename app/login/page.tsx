'use client'
import { useState } from 'react'
import { IconWarning, IconClock, IconLock, IconCheck } from '@/components/Icons'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeProvider } from '@/components/ThemeProvider'

function LoginForm() {
  const [step, setStep] = useState<'LOGIN' | 'FORGOT_EMAIL' | 'FORGOT_CODE' | 'FORGOT_RESET'>('LOGIN')
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('ADMIN')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e: React.FormEvent, action: 'send' | 'verify' | 'reset') => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (action === 'reset' && newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      const res = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, code, password: newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        if (action === 'send') setStep('FORGOT_CODE')
        if (action === 'verify') setStep('FORGOT_RESET')
        if (action === 'reset') {
          setSuccess('Password updated! Please login.')
          setStep('LOGIN')
        }
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.message || 'Connection error')
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

        {step === 'LOGIN' && (
          <>
            <div className="login-role-selector">
              <button
                className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRole('ADMIN')}
              >Admin</button>
              <button
                className={`role-btn ${role === 'STAFF' ? 'active' : ''}`}
                onClick={() => setRole('STAFF')}
              >Staff</button>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-input-group">
                <input
                  type="text"
                  placeholder={`${role === 'ADMIN' ? 'Admin' : 'Staff'} Username`}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
              <div className="login-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="login-input"
                  required
                />
              </div>

              <a href="/forgot-password" className="login-forgot">
                Forgot Password?
              </a>

              {error && <div className="login-error"><IconWarning size={14} /> {error}</div>}
              {success && <div className="login-success"><IconCheck size={14} /> {success}</div>}

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {step === 'FORGOT_EMAIL' && (
          <form onSubmit={(e) => handleRecovery(e, 'send')} className="login-form">
            <h3 className="step-title">Recover Password</h3>
            <p className="step-desc">Enter your company email to receive a secret code.</p>
            <div className="login-input-group">
              <input
                type="email"
                placeholder="Company Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Sending...' : 'Send Code'}
            </button>
            <button type="button" onClick={() => setStep('LOGIN')} className="btn-text">Back to Login</button>
          </form>
        )}

        {step === 'FORGOT_CODE' && (
          <form onSubmit={(e) => handleRecovery(e, 'verify')} className="login-form">
            <h3 className="step-title">Verify Code</h3>
            <p className="step-desc">Enter the 6-digit code sent to <b>{email}</b></p>
            <div className="login-input-group">
              <input
                type="text"
                placeholder="6-Digit Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="login-input"
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
                maxLength={6}
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep('FORGOT_EMAIL')} className="btn-text">Change Email</button>
          </form>
        )}

        {step === 'FORGOT_RESET' && (
          <form onSubmit={(e) => handleRecovery(e, 'reset')} className="login-form">
            <h3 className="step-title">New Password</h3>
            <p className="step-desc">Create a secure password for your account.</p>
            <div className="login-input-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <div className="login-input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginForm />
    </ThemeProvider>
  )
}

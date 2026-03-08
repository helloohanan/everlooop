'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeProvider } from '@/components/ThemeProvider'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="login-input"
              required
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            id="login-submit"
          >
            {loading ? '🔄 Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div className="login-hint">
          Admin: admin / admin123 &nbsp;·&nbsp; Staff: staff / staff123
        </div>
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

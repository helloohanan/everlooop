'use client'
import { useState } from 'react'
import { IconLock, IconWarning, IconCheck, IconClock } from '@/components/Icons'

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Email update state
    const [newEmail, setNewEmail] = useState('')
    const [emailLoading, setEmailLoading] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [emailSuccess, setEmailSuccess] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })

            const data = await res.json()
            if (res.ok) {
                setSuccess('Password updated successfully')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                setError(data.error || 'Failed to update password')
            }
        } catch {
            setError('Connection error')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setEmailError('')
        setEmailSuccess('')
        setEmailLoading(true)

        try {
            const res = await fetch('/api/auth/update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail }),
            })

            const data = await res.json()
            if (res.ok) {
                setEmailSuccess('Company email updated successfully')
                setNewEmail('')
            } else {
                setEmailError(data.error || 'Failed to update email')
            }
        } catch {
            setEmailError('Connection error')
        } finally {
            setEmailLoading(false)
        }
    }

    return (
        <div className="page-content">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Account Settings</h1>
                    <p className="section-subtitle">Manage your credentials and security</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><IconLock /> Change Password</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {error && <div className="alert alert-danger"><IconWarning /> {error}</div>}
                            {success && <div className="alert alert-paid"><IconCheck /> {success}</div>}
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input type="password" name="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" name="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📧 Company Email</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {emailError && <div className="alert alert-danger"><IconWarning /> {emailError}</div>}
                            {emailSuccess && <div className="alert alert-paid"><IconCheck /> {emailSuccess}</div>}
                            <div className="form-group">
                                <label className="form-label">New Recovery Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="helloohanan@gmail.com"
                                    required
                                />
                                <p className="section-subtitle" style={{ marginTop: '8px', fontSize: '12px' }}>
                                    This email will receive secret codes for password recovery.
                                </p>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={emailLoading} style={{ background: 'var(--brand-secondary)' }}>
                                {emailLoading ? 'Updating...' : 'Update Email'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'
import { useState } from 'react'
import { IconLock, IconWarning, IconCheck, IconClock } from '@/components/Icons'

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
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

    return (
        <div className="page-content">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Account Settings</h1>
                    <p className="section-subtitle">Manage your login credentials</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '500px' }}>
                <div className="card-header">
                    <h2 className="card-title"><IconLock /> Change Password</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {error && <div className="alert alert-danger"><IconWarning /> {error}</div>}
                        {success && <div className="alert alert-paid"><IconCheck /> {success}</div>}

                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? <><IconClock style={{ marginRight: '8px' }} /> Updating...</> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

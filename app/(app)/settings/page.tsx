import { getSession } from '@/lib/auth'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
    const session = await getSession()

    return (
        <div className="page-content">
            <div className="section-header">
                <div>
                    <h1 className="section-title">Account Settings</h1>
                    <p className="section-subtitle">Manage your credentials and security</p>
                </div>
            </div>

            <SettingsForm userRole={session?.role || ''} />
        </div>
    )
}

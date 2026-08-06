import { Outlet } from 'react-router-dom'
import { AppNav } from '@/components/AppNav'

const NAV_ITEMS = [
  { to: '/company/dashboard', label: 'Tableau de bord' },
  { to: '/company/campaigns', label: 'Campagnes' },
  { to: '/company/applications', label: 'Candidatures' },
  { to: '/company/map', label: '🗺️ Carte' },
  { to: '/company/invitations', label: 'Invitations' },
]

export function CompanyLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav homeTo="/company/dashboard" audience="Entreprise" items={NAV_ITEMS} />
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}

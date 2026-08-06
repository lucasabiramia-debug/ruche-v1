import { Outlet } from 'react-router-dom'
import { AppNav } from '@/components/AppNav'

const NAV_ITEMS = [
  { to: '/creator/dashboard', label: 'Tableau de bord' },
  { to: '/creator/missions', label: 'Missions' },
  { to: '/creator/map', label: '🗺️ Radar' },
  { to: '/creator/assignments', label: 'Mes missions' },
  { to: '/creator/earnings', label: 'Revenus' },
]

export function CreatorLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav homeTo="/creator/dashboard" audience="Créateur" items={NAV_ITEMS} />
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}

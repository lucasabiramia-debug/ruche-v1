import { Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function CompanyLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white py-4">
        <div className="container flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Ruche · Entreprise</div>
          <nav className="flex gap-4">
            <a href="/company/dashboard" className="text-gray-700 hover:text-gray-900">Tableau de bord</a>
            <a href="/company/campaigns" className="text-gray-700 hover:text-gray-900">Campagnes</a>
            <a href="/company/creators" className="text-gray-700 hover:text-gray-900">Créateurs</a>
            <button
              onClick={() => signOut()}
              className="text-gray-700 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}

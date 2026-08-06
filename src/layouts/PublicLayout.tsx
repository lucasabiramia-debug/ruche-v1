import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-4">
        <div className="container flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Ruche</div>
          <nav className="flex gap-4">
            <a href="/" className="text-gray-700 hover:text-gray-900">Accueil</a>
            <a href="/auth/signin" className="text-gray-700 hover:text-gray-900">Connexion</a>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}

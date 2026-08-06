import { Outlet, Link, NavLink } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span aria-hidden className="text-2xl">🐝</span>
            <span className="text-xl font-bold text-gray-900">Ruche</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/auth/signin"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Connexion
            </NavLink>
            <Link
              to="/auth/signup"
              className="whitespace-nowrap rounded-md bg-ruche-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ruche-600 transition-colors"
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-8">
        <div className="container text-center text-sm text-gray-500">
          🐝 Ruche — la plateforme qui connecte créateurs et organisations
        </div>
      </footer>
    </div>
  )
}

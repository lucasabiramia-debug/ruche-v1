import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export interface NavItem {
  to: string
  label: string
}

interface AppNavProps {
  homeTo: string
  audience: string
  items: NavItem[]
}

// Shared authenticated header: brand block, SPA nav with active state,
// horizontally scrollable on small screens
export function AppNav({ homeTo, audience, items }: AppNavProps) {
  const { signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to={homeTo} className="flex shrink-0 items-center gap-2">
          <span aria-hidden className="text-2xl">🐝</span>
          <span className="text-xl font-bold text-gray-900">
            Ruche
            <span className="ml-2 rounded-full bg-ruche-100 px-2 py-0.5 text-xs font-semibold text-ruche-800">
              {audience}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ruche-100 text-ruche-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => signOut()}
            className="ml-2 whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  )
}

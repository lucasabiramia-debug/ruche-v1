import { useAuth } from '@/hooks/useAuth'

export function CreatorDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord créateur</h1>
        <p className="mt-2 text-gray-600">Bienvenue, {user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Profil</h2>
          <p className="mt-2 text-gray-600">Complète ton profil pour accéder aux missions</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Missions</h2>
          <p className="mt-2 text-gray-600">Explore les missions disponibles</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Candidatures</h2>
          <p className="mt-2 text-gray-600">Gère tes candidatures en cours</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Paiements</h2>
          <p className="mt-2 text-gray-600">Suivi de tes paiements</p>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-6">
        <p className="text-sm text-gray-600">
          ℹ️ Phase 0 de développement : Infrastructure de base. Les fonctionnalités complètes arrivent bientôt.
        </p>
      </div>
    </div>
  )
}

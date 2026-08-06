import { useAuth } from '@/hooks/useAuth'

export function CompanyDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord entreprise</h1>
        <p className="mt-2 text-gray-600">Bienvenue, {user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Campagnes</h2>
          <p className="mt-2 text-gray-600">Gère tes campagnes marketing</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Créateurs</h2>
          <p className="mt-2 text-gray-600">Explore et valide les profils</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Candidatures</h2>
          <p className="mt-2 text-gray-600">Gère les candidatures en attente</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold">Résultats</h2>
          <p className="mt-2 text-gray-600">Analyse les résultats de tes campagnes</p>
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

import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { listCampaigns } from '@/services/missions'
import { computeCompanyStats } from '@/lib/dashboard-stats'

export function CompanyDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const campaignsQuery = useQuery({
    queryKey: ['company-campaigns'],
    queryFn: () => listCampaigns(),
  })

  const stats = computeCompanyStats(campaignsQuery.data ?? [])

  const kpis = [
    {
      label: 'Campagnes actives',
      value: stats.activeCampaigns,
      accent: 'text-green-600',
      to: '/company/campaigns',
    },
    {
      label: 'Brouillons',
      value: stats.draftCampaigns,
      accent: 'text-gray-600',
      to: '/company/campaigns',
    },
    {
      label: 'Missions publiées',
      value: `${stats.publishedMissions}/${stats.totalMissions}`,
      accent: 'text-blue-600',
      to: '/company/campaigns',
    },
    {
      label: 'Budget engagé',
      value: `€${stats.totalBudget.toLocaleString()}`,
      accent: 'text-purple-600',
      to: '/company/campaigns',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord entreprise</h1>
        <p className="mt-2 text-gray-600">Bienvenue, {user?.email}</p>
      </div>

      {/* KPI cards */}
      {campaignsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : campaignsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des campagnes
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <button
              key={kpi.label}
              onClick={() => navigate(kpi.to)}
              className="rounded-lg border border-gray-200 bg-white p-6 text-left hover:border-blue-400 hover:shadow-md transition-all"
            >
              <p className="text-sm text-gray-600">{kpi.label}</p>
              <p className={`mt-2 text-3xl font-bold ${kpi.accent}`}>{kpi.value}</p>
            </button>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-bold">Actions rapides</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate('/company/campaigns')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">📢 Mes campagnes</h3>
            <p className="mt-2 text-sm text-gray-600">
              {stats.totalCampaigns} campagne{stats.totalCampaigns > 1 ? 's' : ''} au total
            </p>
          </button>

          <button
            onClick={() => navigate('/company/applications')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">📥 Candidatures</h3>
            <p className="mt-2 text-sm text-gray-600">
              Examine les candidatures des créateurs
            </p>
          </button>

          <button
            onClick={() => navigate('/company/invitations')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">✉️ Invitations</h3>
            <p className="mt-2 text-sm text-gray-600">
              Invite des créateurs à rejoindre la plateforme
            </p>
          </button>
        </div>
      </div>

      {/* Getting started when no campaign yet */}
      {!campaignsQuery.isLoading && !campaignsQuery.error && stats.totalCampaigns === 0 && (
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">Bien démarrer</h3>
          <p className="mt-2 text-sm text-blue-800">
            Crée ta première campagne, ajoute des missions, puis publie-les pour recevoir des
            candidatures de créateurs.
          </p>
          <button
            onClick={() => navigate('/company/campaigns')}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Créer ma première campagne
          </button>
        </div>
      )}
    </div>
  )
}

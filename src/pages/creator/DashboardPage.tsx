import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getApplicationsByCreator } from '@/services/applications'
import { getAssignmentsByCreator } from '@/services/assignments'
import { getPaymentSummary } from '@/services/payments'
import { computeCreatorStats } from '@/lib/dashboard-stats'

export function CreatorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const applicationsQuery = useQuery({
    queryKey: ['creator-applications'],
    queryFn: () => getApplicationsByCreator(user!.id),
    enabled: !!user,
  })

  const assignmentsQuery = useQuery({
    queryKey: ['creator-assignments'],
    queryFn: () => getAssignmentsByCreator(user!.id),
    enabled: !!user,
  })

  const paymentSummaryQuery = useQuery({
    queryKey: ['creator-payment-summary'],
    queryFn: () => getPaymentSummary(user!.id),
    enabled: !!user,
  })

  const isLoading =
    applicationsQuery.isLoading || assignmentsQuery.isLoading || paymentSummaryQuery.isLoading

  const stats = computeCreatorStats({
    applications: applicationsQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    paymentSummary: paymentSummaryQuery.data ?? null,
  })

  const kpis = [
    {
      label: 'Candidatures en attente',
      value: stats.pendingApplications,
      accent: 'text-yellow-600',
      to: '/creator/missions',
    },
    {
      label: 'Missions actives',
      value: stats.activeAssignments,
      accent: 'text-blue-600',
      to: '/creator/assignments',
    },
    {
      label: 'Missions complétées',
      value: stats.completedAssignments,
      accent: 'text-green-600',
      to: '/creator/assignments',
    },
    {
      label: 'Revenus en attente',
      value: `€${stats.totalPending.toLocaleString()}`,
      accent: 'text-purple-600',
      to: '/creator/earnings',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Tableau de bord créateur</h1>
        <p className="mt-2 text-gray-600">Bienvenue, {user?.email}</p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
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
            onClick={() => navigate('/creator/missions')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">🔍 Explorer les missions</h3>
            <p className="mt-2 text-sm text-gray-600">
              Trouve des collaborations adaptées à ton profil
            </p>
          </button>

          <button
            onClick={() => navigate('/creator/assignments')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">📋 Mes missions</h3>
            <p className="mt-2 text-sm text-gray-600">
              Consulte tes briefs et soumets ton contenu
            </p>
          </button>

          <button
            onClick={() => navigate('/creator/earnings')}
            className="rounded-lg border border-gray-200 p-6 text-left hover:border-blue-400 transition-colors"
          >
            <h3 className="font-semibold">💰 Mes revenus</h3>
            <p className="mt-2 text-sm text-gray-600">
              Total gagné : €{stats.totalEarned.toLocaleString()}
            </p>
          </button>
        </div>
      </div>

      {/* Onboarding hint when no activity yet */}
      {!isLoading &&
        stats.pendingApplications === 0 &&
        stats.activeAssignments === 0 &&
        stats.completedAssignments === 0 && (
          <div className="rounded-lg bg-blue-50 p-6">
            <h3 className="font-semibold text-blue-900">Bien démarrer</h3>
            <p className="mt-2 text-sm text-blue-800">
              Complète ton profil puis postule à ta première mission pour lancer ta première
              collaboration.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/creator/onboarding')}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Compléter mon profil
              </button>
              <button
                onClick={() => navigate('/creator/missions')}
                className="rounded border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Voir les missions
              </button>
            </div>
          </div>
        )}
    </div>
  )
}

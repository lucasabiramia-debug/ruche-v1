import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getAssignmentsByCreator } from '@/services/assignments'

interface Assignment {
  id: string
  mission_id: string
  agreed_budget: number
  assignment_status: string
  accepted_at: string
  completed_at?: string
  missions?: {
    id: string
    title: string
    campaign_id: string
    campaigns?: {
      id: string
      title: string
      status: string
      is_demo: boolean
    }
  }
}

export function CreatorAssignmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const assignmentsQuery = useQuery({
    queryKey: ['creator-assignments'],
    queryFn: () => (user ? getAssignmentsByCreator(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (assignmentsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (assignmentsQuery.error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-800">
        Erreur lors du chargement de vos missions assignées
      </div>
    )
  }

  const assignments = (assignmentsQuery.data || []) as Assignment[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes missions</h1>
        <p className="mt-2 text-gray-600">Collaborations en cours et complétées</p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">Aucune mission assignée pour le moment</p>
          <p className="mt-2 text-sm text-gray-500">Vos missions approuvées apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-lg border border-gray-200 p-6 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.missions?.title || 'Mission sans titre'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Campagne: {assignment.missions?.campaigns?.title || 'N/A'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    assignment.assignment_status,
                  )}`}
                >
                  {assignment.assignment_status.replace('_', ' ').charAt(0).toUpperCase() +
                    assignment.assignment_status.replace('_', ' ').slice(1)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Budget convenu</p>
                  <p className="mt-1 text-lg font-semibold">€{assignment.agreed_budget.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Acceptée le</p>
                  <p className="mt-1 text-sm">
                    {new Date(assignment.accepted_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {assignment.completed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Complétée le</p>
                    <p className="mt-1 text-sm">
                      {new Date(assignment.completed_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t pt-4">
                <button
                  onClick={() => navigate(`/creator/assignments/${assignment.id}`)}
                  className="w-full rounded-lg bg-ruche-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ruche-600 transition-colors"
                >
                  📍 Suivre ma mission →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listMissions } from '@/services/missions'
import { getApplicationsByCreator, createApplication, getApplicationByMissionAndCreator } from '@/services/applications'
import { MissionCard } from '@/components/MissionCard'

interface ApplicationState {
  missionId: string
  showDialog: boolean
  isSubmitting: boolean
  proposedPrice: string
  error: string
}

export function CreatorMissionsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [applicationState, setApplicationState] = useState<ApplicationState | null>(null)
  const [appliedMissions, setAppliedMissions] = useState<Set<string>>(new Set())

  // Fetch missions
  const missionsQuery = useQuery({
    queryKey: ['missions', { search, categoryFilter }],
    queryFn: () =>
      listMissions({
        search: search || undefined,
        categoryFilter: categoryFilter.length > 0 ? categoryFilter : undefined,
      }),
  })

  // Fetch creator's applications
  const applicationsQuery = useQuery({
    queryKey: ['creator-applications'],
    queryFn: () => (user ? getApplicationsByCreator(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  // Update applied missions set when applications load
  useEffect(() => {
    if (applicationsQuery.data) {
      const missionIds = new Set(applicationsQuery.data.map((app) => app.mission_id))
      setAppliedMissions(missionIds)
    }
  }, [applicationsQuery.data])

  const createAppMutation = useMutation({
    mutationFn: async (data: { missionId: string; proposedPrice: number }) => {
      if (!user) throw new Error('Not authenticated')
      return createApplication(data.missionId, user.id, data.proposedPrice)
    },
    onSuccess: () => {
      applicationsQuery.refetch()
      setApplicationState(null)
    },
    onError: (err: any) => {
      setApplicationState((prev) =>
        prev ? { ...prev, error: err.message || 'Erreur lors de la candidature', isSubmitting: false } : null,
      )
    },
  })

  const handleApplyClick = (missionId: string) => {
    setApplicationState({
      missionId,
      showDialog: true,
      isSubmitting: false,
      proposedPrice: '',
      error: '',
    })
  }

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicationState) return

    setApplicationState((prev) =>
      prev ? { ...prev, isSubmitting: true, error: '' } : null,
    )

    createAppMutation.mutate({
      missionId: applicationState.missionId,
      proposedPrice: parseFloat(applicationState.proposedPrice),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Opportunités de collaboration</h1>
        <p className="mt-2 text-gray-600">Trouvez des missions adaptées à votre profil</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Rechercher</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une mission..."
              className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      {missionsQuery.isLoading ? (
        <div className="text-center text-gray-600">Chargement des missions...</div>
      ) : missionsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des missions
        </div>
      ) : missionsQuery.data && missionsQuery.data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {missionsQuery.data.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              isApplied={appliedMissions.has(mission.id)}
              onApplyClick={() => handleApplyClick(mission.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">Aucune mission disponible pour le moment</p>
        </div>
      )}

      {/* Application Dialog */}
      {applicationState?.showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="rounded-lg bg-white p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold">Postuler à cette mission</h2>
            <p className="mt-2 text-sm text-gray-600">
              Proposez votre tarif pour cette collaboration
            </p>

            {applicationState.error && (
              <div className="mt-4 rounded bg-red-100 p-3 text-sm text-red-800">
                {applicationState.error}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium">Tarif proposé (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={applicationState.proposedPrice}
                  onChange={(e) =>
                    setApplicationState((prev) =>
                      prev ? { ...prev, proposedPrice: e.target.value } : null,
                    )
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="0.00"
                  required
                  disabled={applicationState.isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setApplicationState(null)}
                  disabled={applicationState.isSubmitting}
                  className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={applicationState.isSubmitting || !applicationState.proposedPrice}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {applicationState.isSubmitting ? 'Envoi...' : 'Postuler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

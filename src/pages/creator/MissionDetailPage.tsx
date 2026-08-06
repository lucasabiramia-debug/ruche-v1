import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getMissionById } from '@/services/missions'
import { getApplicationByMissionAndCreator, createApplication } from '@/services/applications'
import { getBriefByAssignment } from '@/services/briefs'

export function MissionDetailPage() {
  const { missionId } = useParams<{ missionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [proposedPrice, setProposedPrice] = useState('')
  const [error, setError] = useState('')

  if (!missionId || !user) {
    navigate('/creator/missions')
    return null
  }

  // Fetch mission details
  const missionQuery = useQuery({
    queryKey: ['mission', missionId],
    queryFn: () => getMissionById(missionId),
  })

  // Check if already applied
  const applicationQuery = useQuery({
    queryKey: ['application-status', missionId, user.id],
    queryFn: () => getApplicationByMissionAndCreator(missionId, user.id),
    enabled: !!user.id,
  })

  // Create application mutation
  const createAppMutation = useMutation({
    mutationFn: async (price: number) => {
      if (!missionId || !user) throw new Error('Missing data')
      return createApplication(missionId, user.id, price)
    },
    onSuccess: () => {
      applicationQuery.refetch()
      setProposedPrice('')
      setError('')
    },
    onError: (err: any) => {
      setError(err.message || 'Erreur lors de la candidature')
    },
  })

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proposedPrice || isNaN(parseFloat(proposedPrice))) {
      setError('Veuillez entrer un tarif valide')
      return
    }
    createAppMutation.mutate(parseFloat(proposedPrice))
  }

  if (missionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    )
  }

  if (missionQuery.error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-800">
        Erreur lors du chargement de la mission
      </div>
    )
  }

  const mission = missionQuery.data
  if (!mission) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">Mission non trouvée</p>
      </div>
    )
  }

  const isApplied = !!applicationQuery.data
  const campaign = mission.campaigns

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/creator/missions')}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Retour aux opportunités
        </button>

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{mission.title}</h1>
            {campaign && (
              <p className="mt-2 text-lg text-gray-600">
                Campagne: <span className="font-semibold">{campaign.title}</span>
              </p>
            )}
          </div>
          {campaign?.is_demo && (
            <span className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
              Démo
            </span>
          )}
        </div>
      </div>

      {/* Campaign Details */}
      {campaign && (
        <div className="grid gap-6 rounded-lg bg-gray-50 p-6 md:grid-cols-2">
          {campaign.objective && (
            <div>
              <h3 className="font-semibold text-gray-900">Objectif</h3>
              <p className="mt-2 text-gray-600">{campaign.objective}</p>
            </div>
          )}

          {campaign.target_audience && (
            <div>
              <h3 className="font-semibold text-gray-900">Public cible</h3>
              <p className="mt-2 text-gray-600">{campaign.target_audience}</p>
            </div>
          )}

          {campaign.description && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{campaign.description}</p>
            </div>
          )}

          {campaign.budget_ceiling && (
            <div>
              <h3 className="font-semibold text-gray-900">Budget maximum</h3>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                €{campaign.budget_ceiling.toLocaleString()}
              </p>
            </div>
          )}

          {campaign.status && (
            <div>
              <h3 className="font-semibold text-gray-900">Statut</h3>
              <p className="mt-2 capitalize text-gray-600">{campaign.status}</p>
            </div>
          )}
        </div>
      )}

      {/* Eligibility Rules */}
      {mission.eligibility_rules && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Critères d'éligibilité</h3>
          <div className="mt-4 space-y-2 text-gray-600">
            {Array.isArray(mission.eligibility_rules) ? (
              mission.eligibility_rules.map((rule: string, idx: number) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{rule}</span>
                </p>
              ))
            ) : (
              <p>{mission.eligibility_rules}</p>
            )}
          </div>
        </div>
      )}

      {/* Application Section */}
      {isApplied ? (
        <div className="rounded-lg bg-green-100 p-6">
          <p className="font-semibold text-green-900">
            ✓ Vous avez déjà postulé à cette mission
          </p>
          <p className="mt-2 text-sm text-green-800">
            Votre tarif proposé: €{applicationQuery.data?.proposed_price.toLocaleString()}
          </p>
        </div>
      ) : (
        <form onSubmit={handleApply} className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Postuler à cette mission</h2>

          {error && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Votre tarif proposé (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="mt-2 w-full rounded border border-gray-300 px-4 py-2"
                placeholder="0.00"
                required
                disabled={createAppMutation.isPending}
              />
              {campaign?.budget_ceiling && (
                <p className="mt-1 text-xs text-gray-600">
                  Budget max: €{campaign.budget_ceiling.toLocaleString()}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={createAppMutation.isPending || !proposedPrice}
              className="w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createAppMutation.isPending ? 'Envoi...' : 'Postuler'}
            </button>
          </div>
        </form>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/creator/missions')}
        className="text-blue-600 hover:underline"
      >
        ← Retour aux opportunités
      </button>
    </div>
  )
}

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCampaignById, listMissions } from '@/services/missions'
import { MissionCreationForm } from '@/components/MissionCreationForm'
import { MissionListItem } from '@/components/MissionListItem'

export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [showMissionForm, setShowMissionForm] = useState(false)

  const campaignQuery = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaignById(campaignId!),
    enabled: !!campaignId,
  })

  const missionsQuery = useQuery({
    queryKey: ['campaign-missions', campaignId],
    queryFn: () => listMissions({ campaignId }),
    enabled: !!campaignId,
  })

  if (!campaignId) {
    return <div>Campaign ID missing</div>
  }

  const campaign = campaignQuery.data
  const missions = missionsQuery.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-200 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{campaign?.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(campaign?.status)}`}>
            {campaign?.status.charAt(0).toUpperCase() + campaign?.status.slice(1)}
          </span>
          <p className="text-gray-600">
            Créée le {campaign && new Date(campaign.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Campaign Details */}
      {campaign && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Objectif</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{campaign.objective || 'Non spécifié'}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Audience cible</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{campaign.target_audience || 'Non spécifié'}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Budget plafond</p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {campaign.budget_ceiling ? `€${campaign.budget_ceiling.toLocaleString()}` : 'Non défini'}
            </p>
          </div>
        </div>
      )}

      {campaign?.description && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-3 text-gray-700">{campaign.description}</p>
        </div>
      )}

      {/* Missions Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Missions</h2>
          {campaign?.status !== 'archived' && (
            <button
              onClick={() => setShowMissionForm(!showMissionForm)}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {showMissionForm ? 'Annuler' : '+ Nouvelle mission'}
            </button>
          )}
        </div>

        {/* Mission Creation Form */}
        {showMissionForm && campaign && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <MissionCreationForm
              campaignId={campaignId}
              onSuccess={() => {
                setShowMissionForm(false)
                missionsQuery.refetch()
              }}
            />
          </div>
        )}

        {/* Missions List */}
        {missionsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : missionsQuery.error ? (
          <div className="rounded-lg bg-red-100 p-4 text-red-800">
            Erreur lors du chargement des missions
          </div>
        ) : missions && missions.length > 0 ? (
          <div className="space-y-3">
            {missions.map((mission) => (
              <MissionListItem key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">Aucune mission pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

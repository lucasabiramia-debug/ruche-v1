import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { listCampaigns } from '@/services/missions'

interface Campaign {
  id: string
  title: string
  description?: string
  objective?: string
  target_audience?: string
  budget_ceiling?: number
  status: string
  is_demo: boolean
  created_at: string
  missions?: Array<{ id: string; title: string; publication_status: string }>
}

export function CompanyCampaignsPage() {
  const navigate = useNavigate()
  const { organizationId } = useAuth()
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [search, setSearch] = useState('')

  const campaignsQuery = useQuery({
    queryKey: ['company-campaigns', { filterStatus, search }],
    queryFn: () =>
      listCampaigns({
        status: filterStatus || undefined,
        search: search || undefined,
      }),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMissionCount = (campaign: Campaign) => {
    return campaign.missions?.length || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campagnes</h1>
          <p className="mt-2 text-gray-600">Gérez vos campagnes de collaboration</p>
        </div>
        <button
          onClick={() => navigate('/company/campaigns/new')}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Créer une campagne
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 rounded-lg bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Rechercher</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titre de campagne..."
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Statut</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="active">Active</option>
            <option value="archived">Archivée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {campaignsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : campaignsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des campagnes
        </div>
      ) : campaignsQuery.data && campaignsQuery.data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaignsQuery.data.map((campaign: Campaign) => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/company/campaigns/${campaign.id}`)}
              className="cursor-pointer rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    campaign.status,
                  )}`}
                >
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>

              {campaign.is_demo && (
                <span className="mt-2 inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-700">
                  Démo
                </span>
              )}

              {campaign.description && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                  {campaign.description}
                </p>
              )}

              <div className="mt-4 space-y-2 border-t pt-4">
                {campaign.budget_ceiling && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">
                      €{campaign.budget_ceiling.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Missions</span>
                  <span className="font-semibold">{getMissionCount(campaign)}</span>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Créée le{' '}
                    {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/company/campaigns/${campaign.id}`)
                }}
                className="mt-4 w-full rounded bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
              >
                Voir détails
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">Aucune campagne trouvée</p>
          <button
            onClick={() => navigate('/company/campaigns/new')}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Créer votre première campagne
          </button>
        </div>
      )}
    </div>
  )
}

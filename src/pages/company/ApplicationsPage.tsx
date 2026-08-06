import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getApplicationsByMission, reviewApplication } from '@/services/applications'

interface Application {
  id: string
  creator_id: string
  status: string
  proposed_price: number
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  creator_profiles?: {
    id: string
    bio: string
    location: string
    profile_picture_url?: string
  }
}

export function CompanyApplicationsPage() {
  const { user } = useAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // In a real scenario, would get mission_id from route params
  const missionId = '' // Placeholder

  const applicationsQuery = useQuery({
    queryKey: ['mission-applications', missionId],
    queryFn: () => (missionId ? getApplicationsByMission(missionId) : Promise.resolve([])),
    enabled: !!missionId,
  })

  const reviewMutation = useMutation({
    mutationFn: async (data: { applicationId: string; status: 'approved' | 'rejected' }) => {
      return reviewApplication(
        data.applicationId,
        data.status,
        data.status === 'rejected' ? rejectionReason : undefined,
      )
    },
    onSuccess: () => {
      applicationsQuery.refetch()
      setReviewingId(null)
      setRejectionReason('')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidatures</h1>
        <p className="mt-2 text-gray-600">Examinez et répondez aux candidatures des créateurs</p>
      </div>

      {applicationsQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : applicationsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des candidatures
        </div>
      ) : applicationsQuery.data && applicationsQuery.data.length > 0 ? (
        <div className="space-y-4">
          {applicationsQuery.data.map((application: Application) => (
            <div
              key={application.id}
              className="rounded-lg border border-gray-200 p-6 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {application.creator_profiles?.profile_picture_url && (
                      <img
                        src={application.creator_profiles.profile_picture_url}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">Créateur</p>
                      <p className="text-sm text-gray-600">
                        {application.creator_profiles?.location || 'Localisation inconnue'}
                      </p>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                    application.status,
                  )}`}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-600">Tarif proposé</p>
                  <p className="mt-1 text-lg font-semibold">
                    €{application.proposed_price.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Candidature envoyée</p>
                  <p className="mt-1 text-sm">
                    {new Date(application.submitted_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {application.reviewed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Révisée le</p>
                    <p className="mt-1 text-sm">
                      {new Date(application.reviewed_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {application.creator_profiles?.bio && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-900">À propos</p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {application.creator_profiles.bio}
                  </p>
                </div>
              )}

              {application.status === 'submitted' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setReviewingId(application.id)}
                    className="flex-1 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => setReviewingId(application.id)}
                    className="flex-1 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Rejeter
                  </button>
                </div>
              )}

              {reviewingId === application.id && application.status === 'submitted' && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Que voulez-vous faire?</p>
                  <textarea
                    placeholder="Raison du rejet (optionnel)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          applicationId: application.id,
                          status: 'approved',
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="flex-1 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Approuver
                    </button>
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          applicationId: application.id,
                          status: 'rejected',
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="flex-1 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ Rejeter
                    </button>
                    <button
                      onClick={() => setReviewingId(null)}
                      disabled={reviewMutation.isPending}
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {application.rejection_reason && (
                <div className="mt-4 border-t border-red-200 bg-red-50 p-3 rounded">
                  <p className="text-sm font-medium text-red-900">Raison du rejet</p>
                  <p className="mt-1 text-sm text-red-800">{application.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">Aucune candidature pour le moment</p>
        </div>
      )}
    </div>
  )
}

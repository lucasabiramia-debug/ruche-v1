import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listApplications, reviewApplication } from '@/services/applications'
import { approveApplicationAndAssign } from '@/services/automation'

interface Application {
  id: string
  mission_id: string
  creator_id: string
  status: string
  proposed_price: number
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
  missions?: {
    id: string
    title: string
    campaigns?: { id: string; title: string }
  }
  creator_profiles?: {
    id: string
    bio: string
    location: string
    profile_picture_url?: string
  }
}

export function CompanyApplicationsPage() {
  const navigate = useNavigate()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const applicationsQuery = useQuery({
    queryKey: ['company-applications'],
    queryFn: () => listApplications(),
  })

  const reviewMutation = useMutation({
    mutationFn: async (data: {
      application: Application
      status: 'approved' | 'rejected'
    }) => {
      if (data.status === 'approved') {
        // One click: approve + create assignment + create pending payment
        return approveApplicationAndAssign({
          applicationId: data.application.id,
          missionId: data.application.mission_id,
          creatorId: data.application.creator_id,
          proposedPrice: data.application.proposed_price,
        })
      }
      return reviewApplication(data.application.id, 'rejected', rejectionReason || undefined)
    },
    onSuccess: (_data, variables) => {
      applicationsQuery.refetch()
      setReviewingId(null)
      setRejectionReason('')
      toast.success(
        variables.status === 'approved'
          ? 'Candidature acceptée ! Mission assignée et paiement préparé automatiquement.'
          : 'Candidature rejetée.',
      )
    },
    onError: () => {
      toast.error('L’action a échoué — réessaie.')
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
                      <p className="font-semibold text-gray-900">
                        {application.missions?.title || 'Mission'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.missions?.campaigns?.title
                          ? `Campagne ${application.missions.campaigns.title} · `
                          : ''}
                        {application.creator_profiles?.location || 'Localisation inconnue'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/company/creators/${application.creator_id}`)}
                    className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                  >
                    Voir profil
                  </button>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                      application.status,
                    )}`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
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

              {application.status === 'submitted' && reviewingId !== application.id && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      reviewMutation.mutate({ application, status: 'approved' })
                    }
                    disabled={reviewMutation.isPending}
                    className="flex-1 rounded-lg bg-ruche-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-ruche-600 disabled:opacity-50"
                  >
                    {reviewMutation.isPending
                      ? 'Mise en place…'
                      : `✓ J'accepte (€${application.proposed_price.toLocaleString()})`}
                  </button>
                  <button
                    onClick={() => setReviewingId(application.id)}
                    disabled={reviewMutation.isPending}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              )}

              {reviewingId === application.id && application.status === 'submitted' && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Pourquoi refuser cette candidature ?</p>
                  <textarea
                    placeholder="Raison du rejet (optionnel, visible par le créateur)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        reviewMutation.mutate({ application, status: 'rejected' })
                      }
                      disabled={reviewMutation.isPending}
                      className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirmer le rejet
                    </button>
                    <button
                      onClick={() => setReviewingId(null)}
                      disabled={reviewMutation.isPending}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
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

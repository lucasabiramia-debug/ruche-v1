import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { reviewProof } from '@/services/proofs'

interface Proof {
  id: string
  proof_type: string
  public_content_url?: string
  file_path?: string
  statistics_file_path?: string
  status: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}

interface ProofReviewCardProps {
  proof: Proof
  onReviewed?: () => void
}

export function ProofReviewCard({ proof, onReviewed }: ProofReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const reviewMutation = useMutation({
    mutationFn: (status: 'approved' | 'rejected' | 'needs_revision') =>
      reviewProof(proof.id, status),
    onSuccess: () => {
      setIsExpanded(false)
      onReviewed?.()
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
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProofTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      video: 'Vidéo',
      image: 'Image',
      article: 'Article',
      social_post: 'Publication réseaux sociaux',
      other: 'Autre',
    }
    return labels[type] || type
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {getProofTypeLabel(proof.proof_type)}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(proof.status)}`}>
              {proof.status.replace('_', ' ').charAt(0).toUpperCase() +
                proof.status.replace('_', ' ').slice(1)}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-600">
            Soumise le {new Date(proof.submitted_at).toLocaleDateString('fr-FR')}
          </p>

          {proof.reviewed_at && (
            <p className="mt-1 text-xs text-gray-600">
              Révisée le {new Date(proof.reviewed_at).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        {proof.status === 'submitted' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isExpanded ? 'Réduire' : 'Réviser'}
          </button>
        )}
      </div>

      {/* Preview Links */}
      <div className="mt-4 space-y-2 border-t pt-4">
        {proof.public_content_url && (
          <div>
            <p className="text-xs font-medium text-gray-700">Contenu public</p>
            <a
              href={proof.public_content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-blue-600 hover:underline break-all"
            >
              {proof.public_content_url}
            </a>
          </div>
        )}

        {proof.file_path && (
          <div>
            <p className="text-xs font-medium text-gray-700">Fichier</p>
            <p className="mt-1 text-sm text-gray-600 break-all">{proof.file_path}</p>
          </div>
        )}

        {proof.statistics_file_path && (
          <div>
            <p className="text-xs font-medium text-gray-700">Statistiques</p>
            <p className="mt-1 text-sm text-gray-600 break-all">{proof.statistics_file_path}</p>
          </div>
        )}
      </div>

      {/* Review Actions */}
      {isExpanded && proof.status === 'submitted' && (
        <div className="mt-4 border-t pt-4 space-y-3">
          <p className="text-sm font-medium">Que souhaitez-vous faire?</p>

          <div className="grid gap-2">
            <button
              onClick={() => reviewMutation.mutate('approved')}
              disabled={reviewMutation.isPending}
              className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              ✓ Approuver
            </button>

            <button
              onClick={() => reviewMutation.mutate('needs_revision')}
              disabled={reviewMutation.isPending}
              className="rounded bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
            >
              ↻ Demander des révisions
            </button>

            <button
              onClick={() => reviewMutation.mutate('rejected')}
              disabled={reviewMutation.isPending}
              className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              ✗ Rejeter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

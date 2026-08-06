import { useState } from 'react'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { publishMission, archiveMission } from '@/services/mission-management'

interface MissionListItemProps {
  mission: {
    id: string
    title: string
    publication_status: string
  }
}

export function MissionListItem({ mission }: MissionListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const publishMissionMutation = useMutation({
    mutationFn: () => publishMission(mission.id),
    onSuccess: () => {
      setIsExpanded(false)
      toast.success('Mission publiée ! Les créateurs peuvent maintenant postuler.')
    },
    onError: () => {
      toast.error('La publication a échoué — réessaie.')
    },
  })

  const archiveMissionMutation = useMutation({
    mutationFn: () => archiveMission(mission.id),
    onSuccess: () => {
      setIsExpanded(false)
      toast.success('Mission archivée.')
    },
    onError: () => {
      toast.error('L’archivage a échoué — réessaie.')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-200 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Publiée',
      archived: 'Archivée',
    }
    return labels[status] || status
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{mission.title}</h3>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(mission.publication_status)}`}
          >
            {getStatusLabel(mission.publication_status)}
          </span>
        </div>

        {mission.publication_status !== 'archived' && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isExpanded ? 'Réduire' : 'Actions'}
          </button>
        )}
      </div>

      {isExpanded && mission.publication_status !== 'archived' && (
        <div className="mt-4 border-t pt-4">
          <div className="flex gap-2">
            {mission.publication_status === 'draft' && (
              <button
                onClick={() => publishMissionMutation.mutate()}
                disabled={publishMissionMutation.isPending}
                className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {publishMissionMutation.isPending ? 'Publication...' : 'Publier'}
              </button>
            )}

            <button
              onClick={() => archiveMissionMutation.mutate()}
              disabled={archiveMissionMutation.isPending}
              className="rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {archiveMissionMutation.isPending ? 'Archivage...' : 'Archiver'}
            </button>
          </div>

          {publishMissionMutation.error && (
            <p className="mt-2 text-xs text-red-600">Erreur lors de la publication</p>
          )}
          {archiveMissionMutation.error && (
            <p className="mt-2 text-xs text-red-600">Erreur lors de l'archivage</p>
          )}
        </div>
      )}
    </div>
  )
}

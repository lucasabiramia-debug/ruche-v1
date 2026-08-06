import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBriefByAssignment } from '@/services/briefs'

interface Brief {
  id: string
  assignment_id: string
  title: string
  instructions: string
  tracking_codes?: string[]
  mandatory_mentions?: string[]
  prohibited_claims?: string[]
  usage_rights?: string
  created_at: string
  updated_at: string
}

export function BriefViewPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()

  const briefQuery = useQuery({
    queryKey: ['assignment-brief', assignmentId],
    queryFn: () => getBriefByAssignment(assignmentId!),
    enabled: !!assignmentId,
  })

  const brief = briefQuery.data as Brief | undefined

  if (!assignmentId) {
    return <div>Assignment ID missing</div>
  }

  if (briefQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 rounded bg-gray-200 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 rounded bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (briefQuery.error || !brief) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-800">
        Brief non trouvé pour cette mission
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{brief.title}</h1>
        <p className="mt-2 text-gray-600">
          Brief créé le {new Date(brief.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <div className="mt-4 whitespace-pre-wrap text-gray-700">{brief.instructions}</div>
      </div>

      {/* Tracking Codes */}
      {brief.tracking_codes && brief.tracking_codes.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-900">Codes de suivi</h2>
          <div className="mt-3 space-y-2">
            {brief.tracking_codes.map((code, index) => (
              <div key={index} className="flex items-center gap-2">
                <code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono text-gray-900">
                  {code}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Copier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Mentions */}
      {brief.mandatory_mentions && brief.mandatory_mentions.length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-yellow-900">Mentions obligatoires</h2>
          <ul className="mt-3 space-y-2">
            {brief.mandatory_mentions.map((mention, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span className="text-gray-800">{mention}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prohibited Claims */}
      {brief.prohibited_claims && brief.prohibited_claims.length > 0 && (
        <div className="rounded-lg bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">Affirmations interdites</h2>
          <ul className="mt-3 space-y-2">
            {brief.prohibited_claims.map((claim, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600">✗</span>
                <span className="text-gray-800">{claim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Usage Rights */}
      {brief.usage_rights && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Droits d'utilisation</h2>
          <div className="mt-4 text-gray-700">{brief.usage_rights}</div>
        </div>
      )}

      {/* Updated Info */}
      <div className="text-sm text-gray-500">
        Dernière mise à jour le {new Date(brief.updated_at).toLocaleDateString('fr-FR')}
      </div>
    </div>
  )
}

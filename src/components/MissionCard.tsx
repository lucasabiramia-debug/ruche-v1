import { Link } from 'react-router-dom'

interface Mission {
  id: string
  title: string
  campaign?: {
    id: string
    title: string
    objective?: string
    target_audience?: string
    budget_ceiling?: number
    is_demo?: boolean
  }
}

interface MissionCardProps {
  mission: Mission
  href?: string
  isApplied?: boolean
  onApplyClick?: () => void
}

export function MissionCard({ mission, href, isApplied, onApplyClick }: MissionCardProps) {
  const cardContent = (
    <div className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
          {mission.campaign && (
            <p className="mt-1 text-sm text-gray-600">Campagne: {mission.campaign.title}</p>
          )}
        </div>
        {mission.campaign?.is_demo && (
          <span className="ml-2 inline-block rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
            Démo
          </span>
        )}
      </div>

      {mission.campaign?.objective && (
        <p className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Objectif:</span> {mission.campaign.objective}
        </p>
      )}

      {mission.campaign?.target_audience && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Public cible:</span> {mission.campaign.target_audience}
        </p>
      )}

      {mission.campaign?.budget_ceiling && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Budget max:</span> €{mission.campaign.budget_ceiling.toLocaleString()}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {isApplied ? (
          <span className="inline-block rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            ✓ Candidature envoyée
          </span>
        ) : (
          <button
            onClick={onApplyClick}
            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Postuler
          </button>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link to={href}>{cardContent}</Link>
  }

  return cardContent
}

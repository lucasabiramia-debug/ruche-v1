import { Link } from 'react-router-dom'

interface Mission {
  id: string
  title: string
  // Supabase embed name is `campaigns` (single object at runtime)
  campaigns?: {
    id: string
    title: string
    objective?: string
    target_audience?: string
    budget_ceiling?: number
    is_demo?: boolean
  } | null
}

interface MissionCardProps {
  mission: Mission
  href?: string
  isApplied?: boolean
  onApplyClick?: () => void
  /** 0-100 match score — shown as a badge when >= 65 */
  matchScore?: number
}

export function MissionCard({ mission, href, isApplied, onApplyClick, matchScore }: MissionCardProps) {
  const campaign = mission.campaigns
  const cardContent = (
    <div className="block h-full rounded-xl border border-gray-200 bg-white p-6 hover:border-ruche-400 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
          {campaign && (
            <p className="mt-1 text-sm text-gray-600">Campagne : {campaign.title}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {matchScore !== undefined && matchScore >= 65 && (
            <span className="whitespace-nowrap rounded-full bg-ruche-100 px-2 py-1 text-xs font-semibold text-ruche-800">
              ✨ {matchScore}% match
            </span>
          )}
          {campaign?.is_demo && (
            <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
              Démo
            </span>
          )}
        </div>
      </div>

      {campaign?.objective && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          <span className="font-medium">Objectif :</span> {campaign.objective}
        </p>
      )}

      {campaign?.budget_ceiling && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Budget max :</span> €{campaign.budget_ceiling.toLocaleString()}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {isApplied ? (
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            ✓ Candidature envoyée
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              onApplyClick?.()
            }}
            className="inline-block rounded-lg bg-ruche-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ruche-600"
          >
            Postuler
          </button>
        )}
      </div>
    </div>
  )

  const linkHref = href || `/creator/missions/${mission.id}`
  return <Link to={linkHref}>{cardContent}</Link>
}

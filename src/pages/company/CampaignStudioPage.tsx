import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { generateCampaignPlan, type CampaignPlan } from '@/lib/campaign-generator'
import { createCampaignFromPlan } from '@/services/automation'

const EXAMPLES = [
  'Lancement de notre nouvelle gamme de cosmétiques bio sur Instagram',
  'Faire venir des lycéens à nos portes ouvertes en mars',
  'Récolter des avis authentiques sur notre application mobile',
]

export function CampaignStudioPage() {
  const navigate = useNavigate()
  const { user, organizationId } = useAuth()
  const [need, setNeed] = useState('')
  const [budget, setBudget] = useState('')
  const [plan, setPlan] = useState<CampaignPlan | null>(null)

  const handleGenerate = () => {
    if (need.trim().length < 10) {
      toast.error('Décris ton besoin en quelques mots de plus.')
      return
    }
    const budgetHint = budget ? parseFloat(budget) : undefined
    setPlan(generateCampaignPlan(need, budgetHint))
  }

  const launchMutation = useMutation({
    mutationFn: () => {
      if (!plan) throw new Error('No plan')
      return createCampaignFromPlan(organizationId ?? '', user?.id ?? '', plan)
    },
    onSuccess: ({ campaign, missionCount }) => {
      toast.success(
        `Campagne créée avec ${missionCount} mission${missionCount > 1 ? 's' : ''} ! Relis, ajuste, puis publie.`,
      )
      navigate(`/company/campaigns/${campaign.id}`)
    },
    onError: () => {
      toast.error('La création a échoué — réessaie.')
    },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="inline-block rounded-full bg-ruche-100 px-4 py-1 text-sm font-semibold text-ruche-800">
          ✨ Studio de campagne
        </p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Décris ton besoin, on prépare tout
        </h1>
        <p className="mt-2 text-gray-600">
          Une phrase suffit : le studio génère la campagne, les missions et les critères.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">Ton besoin</label>
        <textarea
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          placeholder="Ex : Lancement de notre nouvelle gamme de cosmétiques bio sur Instagram"
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-ruche-500 focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              onClick={() => setNeed(example)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-ruche-400 hover:text-ruche-700 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Budget indicatif (optionnel)
            </label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ex : 1500"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-ruche-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-ruche-500 px-6 py-2.5 font-semibold text-white hover:bg-ruche-600 transition-colors"
          >
            ✨ Générer ma campagne
          </button>
        </div>
      </div>

      {/* Generated plan preview */}
      {plan && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-ruche-200 bg-gradient-to-br from-ruche-50 to-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ruche-700">
              Proposition du studio
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{plan.title}</h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Objectif</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">{plan.objective}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Audience visée</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">{plan.targetAudience}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Budget suggéré</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">
                  €{plan.suggestedBudget.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Missions</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">
                  {plan.missions.length} mission{plan.missions.length > 1 ? 's' : ''} prête
                  {plan.missions.length > 1 ? 's' : ''}
                </dd>
              </div>
            </dl>
          </div>

          {/* Missions preview */}
          <div className="space-y-3">
            {plan.missions.map((mission, index) => (
              <div key={mission.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold text-ruche-700">Mission {index + 1}</p>
                <h3 className="mt-1 font-semibold text-gray-900">{mission.title}</h3>
                <ul className="mt-2 space-y-1">
                  {mission.eligibilityRules.map((rule) => (
                    <li key={rule} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-ruche-600">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Launch */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => launchMutation.mutate()}
              disabled={launchMutation.isPending}
              className="flex-1 rounded-lg bg-ruche-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-ruche-600 disabled:opacity-50 transition-colors"
            >
              {launchMutation.isPending ? 'Création en cours…' : '🚀 Créer cette campagne'}
            </button>
            <button
              onClick={handleGenerate}
              disabled={launchMutation.isPending}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              ↻ Regénérer
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">
            La campagne est créée en brouillon : tu peux tout ajuster avant de publier.
          </p>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { createMission } from '@/services/mission-management'

const missionCreationSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  eligibilityRules: z.string().optional(),
})

type MissionCreationInput = z.infer<typeof missionCreationSchema>

interface MissionCreationFormProps {
  campaignId: string
  onSuccess?: () => void
}

export function MissionCreationForm({ campaignId, onSuccess }: MissionCreationFormProps) {
  const [showRules, setShowRules] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MissionCreationInput>({
    resolver: zodResolver(missionCreationSchema),
  })

  const createMissionMutation = useMutation({
    mutationFn: (data: MissionCreationInput) =>
      createMission({
        campaignId,
        title: data.title,
        eligibilityRules: data.eligibilityRules
          ? data.eligibilityRules.split('\n').filter((rule) => rule.trim())
          : undefined,
      }),
    onSuccess: () => {
      reset()
      onSuccess?.()
    },
  })

  const onSubmit = (data: MissionCreationInput) => {
    createMissionMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre de la mission</label>
        <input
          type="text"
          placeholder="Ex: Créer un avis produit"
          {...register('title')}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showRules ? '- Masquer' : '+ Ajouter'} les critères d'éligibilité
        </button>

        {showRules && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">
              Critères d'éligibilité (un par ligne)
            </label>
            <textarea
              placeholder="Exemple:&#10;Avoir au moins 10k followers&#10;Audience basée en France&#10;Contenu original requis"
              {...register('eligibilityRules')}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={4}
            />
            {errors.eligibilityRules && (
              <p className="mt-1 text-xs text-red-600">{errors.eligibilityRules.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          type="submit"
          disabled={createMissionMutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createMissionMutation.isPending ? 'Création...' : 'Créer la mission'}
        </button>
      </div>

      {createMissionMutation.error && (
        <div className="rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Erreur lors de la création de la mission
        </div>
      )}
    </form>
  )
}

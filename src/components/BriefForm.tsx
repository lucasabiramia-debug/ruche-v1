import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBriefSchema } from '@/schemas/collaboration'

interface BriefFormProps {
  assignmentId: string
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  initialData?: any
}

export function BriefForm({ assignmentId, onSubmit, isLoading, initialData }: BriefFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createBriefSchema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Titre du brief</label>
        <input
          {...register('title')}
          type="text"
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          placeholder="Ex: Reel Instagram - Produit XYZ"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Instructions détaillées</label>
        <textarea
          {...register('instructions')}
          rows={6}
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          placeholder="Décrivez précisément ce que vous attendez du créateur..."
          disabled={isLoading}
        />
        {errors.instructions && (
          <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Code de suivi (optionnel)</label>
          <input
            {...register('trackingCode')}
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            placeholder="code123"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">URL de suivi (optionnel)</label>
          <input
            {...register('trackingUrl')}
            type="url"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            placeholder="https://example.com/track"
            disabled={isLoading}
          />
          {errors.trackingUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.trackingUrl.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Mentions obligatoires (optionnel)</label>
        <textarea
          {...register('mandatoryMentions')}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          placeholder="Ex: #Marque, @partenaire, hashtag spécifique"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">Une mention par ligne</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Réclamations interdites (optionnel)</label>
        <textarea
          {...register('prohibitedClaims')}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          placeholder="Ex: Ne pas faire de réclamations santé, Ne pas comparer avec la concurrence"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">Une interdiction par ligne</p>
      </div>

      <div>
        <label className="block text-sm font-medium">Droits d'utilisation (optionnel)</label>
        <textarea
          {...register('usageRights')}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          placeholder="Ex: Droits exclusifs pour 3 mois, Réutilisation en publicité autorisée"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Envoi...' : 'Créer le brief'}
      </button>
    </form>
  )
}

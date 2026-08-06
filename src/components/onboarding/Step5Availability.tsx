import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileStep5Schema, type CreatorProfileStep5 } from '@/schemas/creator-onboarding'

interface Step5AvailabilityProps {
  initialData?: Partial<CreatorProfileStep5>
  onNext: (data: CreatorProfileStep5) => void
  onPrevious: () => void
  isLoading?: boolean
}

export function Step5Availability({ initialData, onNext, onPrevious, isLoading }: Step5AvailabilityProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorProfileStep5>({
    resolver: zodResolver(creatorProfileStep5Schema),
    defaultValues: initialData,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Disponibilité</h2>
        <p className="mt-2 text-gray-600">Parlez-nous de votre disponibilité pour les collaborations</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">État de disponibilité</label>
          <select
            {...register('availability_status')}
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
          >
            <option value="available">Disponible</option>
            <option value="semi_available">Semi-disponible</option>
            <option value="unavailable">Non disponible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Temps de réponse moyen (heures)</label>
          <input
            {...register('response_time_hours', { valueAsNumber: true })}
            type="number"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            min="1"
            placeholder="24"
          />
          {errors.response_time_hours && (
            <p className="mt-1 text-sm text-red-600">{errors.response_time_hours.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Notes additionnelles (optionnel)</label>
          <textarea
            {...register('availability_notes')}
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="Ex: Meilleures disponibilités de mars à juin..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="flex-1 rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Sauvegarde...' : 'Continuer'}
          </button>
        </div>
      </form>
    </div>
  )
}

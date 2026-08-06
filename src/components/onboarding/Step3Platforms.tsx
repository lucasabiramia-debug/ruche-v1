import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileStep3Schema, type CreatorProfileStep3 } from '@/schemas/creator-onboarding'

interface Step3PlatformsProps {
  initialData?: Partial<CreatorProfileStep3>
  onNext: (data: CreatorProfileStep3) => void
  onPrevious: () => void
  isLoading?: boolean
}

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export function Step3Platforms({ initialData, onNext, onPrevious, isLoading }: Step3PlatformsProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatorProfileStep3>({
    resolver: zodResolver(creatorProfileStep3Schema),
    defaultValues: initialData || { platforms: [{ platform_name: 'instagram' as const, handle: '', follower_count: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'platforms',
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vos plateformes</h2>
        <p className="mt-2 text-gray-600">Où vous créez du contenu</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div>
              <label className="block text-sm font-medium">Plateforme</label>
              <select
                {...register(`platforms.${index}.platform_name`)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                disabled={isLoading}
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Handle (@username)</label>
              <input
                {...register(`platforms.${index}.handle`)}
                type="text"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                disabled={isLoading}
                placeholder="example_handle"
              />
              {errors.platforms?.[index]?.handle && (
                <p className="mt-1 text-sm text-red-600">{errors.platforms[index]?.handle?.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Nombre d'abonnés</label>
              <input
                {...register(`platforms.${index}.follower_count`, { valueAsNumber: true })}
                type="number"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                disabled={isLoading}
                min="0"
              />
              {errors.platforms?.[index]?.follower_count && (
                <p className="mt-1 text-sm text-red-600">{errors.platforms[index]?.follower_count?.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Taux d'engagement (%) (optionnel)</label>
              <input
                {...register(`platforms.${index}.engagement_rate`, { valueAsNumber: true })}
                type="number"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                disabled={isLoading}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={isLoading}
                className="w-full rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Supprimer cette plateforme
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            append({
              platform_name: 'instagram',
              handle: '',
              follower_count: 0,
            })
          }
          disabled={isLoading || fields.length >= PLATFORMS.length}
          className="w-full rounded border border-blue-300 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          + Ajouter une plateforme
        </button>

        {errors.platforms && typeof errors.platforms === 'object' && 'message' in errors.platforms && (
          <p className="text-sm text-red-600">{errors.platforms.message}</p>
        )}

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

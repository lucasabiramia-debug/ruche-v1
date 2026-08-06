import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileStep2Schema, type CreatorProfileStep2 } from '@/schemas/creator-onboarding'

interface Step2ProfileProps {
  initialData?: Partial<CreatorProfileStep2>
  onNext: (data: CreatorProfileStep2) => void
  onPrevious: () => void
  isLoading?: boolean
}

export function Step2Profile({ initialData, onNext, onPrevious, isLoading }: Step2ProfileProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatorProfileStep2>({
    resolver: zodResolver(creatorProfileStep2Schema),
    defaultValues: initialData,
  })

  const profilePictureUrl = watch('profile_picture_url')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profil public</h2>
        <p className="mt-2 text-gray-600">Personnalisez votre présence</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Photo de profil</label>
          <input
            {...register('profile_picture_url')}
            type="url"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="https://example.com/profile.jpg"
          />
          {profilePictureUrl && (
            <div className="mt-3">
              <img
                src={profilePictureUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
          )}
          {errors.profile_picture_url && (
            <p className="mt-1 text-sm text-red-600">{errors.profile_picture_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Localisation</label>
          <input
            {...register('location')}
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="Paris, France"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Site web (optionnel)</label>
          <input
            {...register('website_url')}
            type="url"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="https://votresite.com"
          />
          {errors.website_url && (
            <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
          )}
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

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileStep1Schema, type CreatorProfileStep1 } from '@/schemas/creator-onboarding'

interface Step1PersonalProps {
  initialData?: Partial<CreatorProfileStep1>
  onNext: (data: CreatorProfileStep1) => void
  isLoading?: boolean
}

export function Step1Personal({ initialData, onNext, isLoading }: Step1PersonalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorProfileStep1>({
    resolver: zodResolver(creatorProfileStep1Schema),
    defaultValues: initialData,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Informations personnelles</h2>
        <p className="mt-2 text-gray-600">Commençons par les bases</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <input
            {...register('first_name')}
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="Jean"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input
            {...register('last_name')}
            type="text"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="Dupont"
          />
          {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            {...register('bio')}
            rows={4}
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isLoading}
            placeholder="Parlez-nous de vous et de votre contenu..."
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sauvegarde...' : 'Continuer'}
        </button>
      </form>
    </div>
  )
}

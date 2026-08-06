import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creatorProfileStep4Schema, type CreatorProfileStep4 } from '@/schemas/creator-onboarding'

interface Step4CategoriesProps {
  initialData?: Partial<CreatorProfileStep4>
  onNext: (data: CreatorProfileStep4) => void
  onPrevious: () => void
  isLoading?: boolean
}

const CATEGORIES = [
  'Mode',
  'Beauté',
  'Lifestyle',
  'Tech',
  'Gaming',
  'Fitness',
  'Cuisine',
  'Voyage',
  'Éducation',
  'Humour',
  'Musique',
  'Art',
  'Automobile',
  'Maison',
  'Santé',
  'Finance',
]

export function Step4Categories({ initialData, onNext, onPrevious, isLoading }: Step4CategoriesProps) {
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatorProfileStep4>({
    resolver: zodResolver(creatorProfileStep4Schema),
    defaultValues: initialData,
  })

  const selectedCategories = watch('categories') || []

  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setValue('categories', updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Catégories de contenu</h2>
        <p className="mt-2 text-gray-600">Sélectionnez vos domaines d'expertise</p>
      </div>

      <form
        onSubmit={handleSubmit(onNext)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              disabled={isLoading}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                selectedCategories.includes(category)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              } disabled:opacity-50`}
            >
              {selectedCategories.includes(category) && <span className="mr-2">✓</span>}
              {category}
            </button>
          ))}
        </div>

        {errors.categories && (
          <p className="text-sm text-red-600">{errors.categories.message}</p>
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

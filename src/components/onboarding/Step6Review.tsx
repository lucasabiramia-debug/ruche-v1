import { CreatorProfileComplete } from '@/schemas/creator-onboarding'

interface Step6ReviewProps {
  data: CreatorProfileComplete
  onConfirm: () => void
  onPrevious: () => void
  isLoading?: boolean
}

export function Step6Review({ data, onConfirm, onPrevious, isLoading }: Step6ReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vérification</h2>
        <p className="mt-2 text-gray-600">Vérifiez vos informations avant de finaliser</p>
      </div>

      <div className="space-y-6 rounded-lg bg-gray-50 p-6">
        {/* Personal Info */}
        <div>
          <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Nom complet:</span>{' '}
              <span className="font-medium">
                {data.first_name} {data.last_name}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Bio:</span> <span className="font-medium">{data.bio}</span>
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900">Profil public</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Localisation:</span> <span className="font-medium">{data.location}</span>
            </p>
            {data.website_url && (
              <p>
                <span className="text-gray-600">Site web:</span>{' '}
                <a href={data.website_url} className="font-medium text-blue-600 hover:underline">
                  {data.website_url}
                </a>
              </p>
            )}
            {data.profile_picture_url && (
              <div>
                <span className="text-gray-600">Photo:</span>
                <img
                  src={data.profile_picture_url}
                  alt="Profile"
                  className="mt-2 h-16 w-16 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Platforms */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900">Vos plateformes</h3>
          <div className="mt-3 space-y-2 text-sm">
            {data.platforms.map((platform, index) => (
              <p key={index}>
                <span className="text-gray-600">{platform.platform_name}:</span>{' '}
                <span className="font-medium">
                  @{platform.handle} ({platform.follower_count.toLocaleString()} abonnés)
                </span>
              </p>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900">Catégories</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <span key={category} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900">Disponibilité</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-gray-600">État:</span>{' '}
              <span className="font-medium capitalize">{data.availability_status.replace('_', ' ')}</span>
            </p>
            <p>
              <span className="text-gray-600">Temps de réponse:</span>{' '}
              <span className="font-medium">{data.response_time_hours}h</span>
            </p>
            {data.availability_notes && (
              <p>
                <span className="text-gray-600">Notes:</span> <span className="font-medium">{data.availability_notes}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isLoading}
          className="flex-1 rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Finalisation...' : '✓ Finaliser'}
        </button>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { listCreatorProfiles } from '@/services/creator-profiles'
import { toPins, FRANCE_CENTER } from '@/lib/geo'

interface CreatorRow {
  id: string
  user_id: string
  bio?: string | null
  location?: string | null
  profile_picture_url?: string | null
  creator_platforms?: Array<{ platform_name: string; follower_count: number }>
}

// Pulsing honey marker, Uber-style
const beeIcon = divIcon({
  className: '',
  html: `
    <div class="ruche-pin">
      <span class="ruche-pin-pulse"></span>
      <span class="ruche-pin-dot">🐝</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -16],
})

function totalFollowers(creator: CreatorRow): number {
  return (creator.creator_platforms ?? []).reduce(
    (sum, p) => sum + (p.follower_count || 0),
    0,
  )
}

export function CreatorsMapPage() {
  const navigate = useNavigate()

  const creatorsQuery = useQuery({
    queryKey: ['creator-profiles-map'],
    queryFn: () => listCreatorProfiles(),
  })

  const creators = (creatorsQuery.data ?? []) as CreatorRow[]
  const pins = toPins(
    creators,
    (c) => c.location,
    (c) => c.id,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carte des créateurs</h1>
          <p className="mt-1 text-gray-600">
            Trouve des créateurs près de ton audience — clique sur une abeille.
          </p>
        </div>
        <span className="rounded-full bg-ruche-100 px-3 py-1 text-sm font-semibold text-ruche-800">
          🐝 {pins.length} créateur{pins.length > 1 ? 's' : ''} localisé{pins.length > 1 ? 's' : ''}
        </span>
      </div>

      {creatorsQuery.isLoading ? (
        <div className="h-[70vh] animate-pulse rounded-2xl bg-gray-200"></div>
      ) : creatorsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des créateurs
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <MapContainer
            center={[FRANCE_CENTER.lat, FRANCE_CENTER.lng]}
            zoom={6}
            scrollWheelZoom
            style={{ height: '70vh', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pins.map(({ item: creator, position }) => (
              <Marker
                key={creator.id}
                position={[position.lat, position.lng]}
                icon={beeIcon}
              >
                <Popup>
                  <div className="min-w-[190px]">
                    <div className="flex items-center gap-2">
                      {creator.profile_picture_url ? (
                        <img
                          src={creator.profile_picture_url}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ruche-100 text-lg">
                          🐝
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {creator.location}
                        </p>
                        <p className="text-xs text-gray-600">
                          {totalFollowers(creator).toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    {creator.bio && (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-600">{creator.bio}</p>
                    )}
                    <button
                      onClick={() => navigate(`/company/creators/${creator.user_id}`)}
                      className="mt-3 w-full rounded-lg bg-ruche-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ruche-600"
                    >
                      Voir le profil →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {!creatorsQuery.isLoading && pins.length === 0 && !creatorsQuery.error && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
          Aucun créateur localisé pour le moment — les créateurs apparaissent ici dès qu'ils
          renseignent leur ville.
        </div>
      )}
    </div>
  )
}

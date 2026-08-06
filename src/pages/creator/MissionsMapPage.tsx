import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '@/hooks/useAuth'
import { listMissions } from '@/services/missions'
import { getCreatorProfile } from '@/services/creator-profiles'
import { rankMissions, isStrongMatch, type CreatorMatchProfile, type MatchResult } from '@/lib/matching'
import { geocodeFromTexts, jitter, FRANCE_CENTER, type GeoPoint } from '@/lib/geo'

// Gold pulsing pin for strong matches (score on the pin), muted pin otherwise
function missionIcon(match?: MatchResult) {
  const strong = match ? isStrongMatch(match) : false
  if (strong) {
    return divIcon({
      className: '',
      html: `
        <div class="ruche-pin">
          <span class="ruche-pin-pulse"></span>
          <span class="ruche-pin-dot">🐝</span>
          <span class="ruche-pin-score">${match!.score}%</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -16],
    })
  }
  return divIcon({
    className: '',
    html: `<div class="ruche-pin-muted">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  })
}

interface MissionPin {
  mission: any
  match?: MatchResult
  position: GeoPoint
}

export function MissionsMapPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const missionsQuery = useQuery({
    queryKey: ['missions-map'],
    queryFn: () => listMissions(),
  })

  const profileQuery = useQuery({
    queryKey: ['creator-profile'],
    queryFn: () => getCreatorProfile(user!.id),
    enabled: !!user,
  })

  const { pins, nationalMissions } = useMemo(() => {
    const missions = ((missionsQuery.data ?? []) as any[]).filter(
      (m) => m.publication_status !== 'archived',
    )
    const profile = profileQuery.data as any

    // Match scores when the profile is available
    const matchByMission = new Map<string, MatchResult>()
    if (profile) {
      const matchProfile: CreatorMatchProfile = {
        platforms: (profile.creator_platforms ?? []).map((p: any) => ({
          name: p.platform_name ?? '',
          followerCount: p.follower_count ?? 0,
        })),
        categories: profile.preferred_categories ?? profile.categories ?? [],
        bio: profile.bio,
      }
      for (const ranked of rankMissions(
        matchProfile,
        missions.map((m) => ({
          ...m,
          eligibilityRules: m.eligibility_rules ?? [],
          campaign: m.campaigns
            ? {
                objective: m.campaigns.objective,
                targetAudience: m.campaigns.target_audience,
                description: m.campaigns.description,
              }
            : null,
        })),
      )) {
        matchByMission.set(ranked.mission.id, ranked.match)
      }
    }

    const localized: MissionPin[] = []
    const national: Array<{ mission: any; match?: MatchResult }> = []

    for (const mission of missions) {
      const point = geocodeFromTexts([
        mission.title,
        mission.campaigns?.target_audience,
        mission.campaigns?.description,
        mission.campaigns?.title,
        ...(mission.eligibility_rules ?? []),
      ])
      const match = matchByMission.get(mission.id)
      if (point) {
        localized.push({ mission, match, position: jitter(point, mission.id) })
      } else {
        national.push({ mission, match })
      }
    }

    // Strongest matches first in the national list
    national.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))

    return { pins: localized, nationalMissions: national }
  }, [missionsQuery.data, profileQuery.data])

  const isLoading = missionsQuery.isLoading || profileQuery.isLoading

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radar de missions</h1>
          <p className="mt-1 text-gray-600">
            Les abeilles dorées qui pulsent, c’est pour toi — ton % de compatibilité est sur la carte.
          </p>
        </div>
        <span className="rounded-full bg-ruche-100 px-3 py-1 text-sm font-semibold text-ruche-800">
          🐝 {pins.length} mission{pins.length > 1 ? 's' : ''} localisée{pins.length > 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="h-[60vh] animate-pulse rounded-2xl bg-gray-200"></div>
      ) : missionsQuery.error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Erreur lors du chargement des missions
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <MapContainer
            center={[FRANCE_CENTER.lat, FRANCE_CENTER.lng]}
            zoom={6}
            scrollWheelZoom
            style={{ height: '60vh', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pins.map(({ mission, match, position }) => (
              <Marker
                key={mission.id}
                position={[position.lat, position.lng]}
                icon={missionIcon(match)}
              >
                <Popup>
                  <div className="min-w-[190px]">
                    <p className="text-sm font-semibold text-gray-900">{mission.title}</p>
                    {mission.campaigns?.title && (
                      <p className="text-xs text-gray-600">Campagne {mission.campaigns.title}</p>
                    )}
                    {match && isStrongMatch(match) && (
                      <p className="mt-1 text-xs font-semibold text-ruche-700">
                        ✨ {match.score}% de compatibilité
                      </p>
                    )}
                    {mission.campaigns?.budget_ceiling && (
                      <p className="mt-1 text-xs text-gray-600">
                        Budget max €{mission.campaigns.budget_ceiling.toLocaleString()}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/creator/missions/${mission.id}`)}
                      className="mt-3 w-full rounded-lg bg-ruche-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ruche-600"
                    >
                      Voir la mission →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Missions without a local anchor — open to everyone */}
      {!isLoading && nationalMissions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            🌍 Accessibles partout ({nationalMissions.length})
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nationalMissions.map(({ mission, match }) => (
              <button
                key={mission.id}
                onClick={() => navigate(`/creator/missions/${mission.id}`)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-ruche-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900">{mission.title}</p>
                  {match && isStrongMatch(match) && (
                    <span className="whitespace-nowrap rounded-full bg-ruche-100 px-2 py-0.5 text-xs font-semibold text-ruche-800">
                      ✨ {match.score}%
                    </span>
                  )}
                </div>
                {mission.campaigns?.title && (
                  <p className="mt-1 text-xs text-gray-600">Campagne {mission.campaigns.title}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

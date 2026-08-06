import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface CreatorProfile {
  id: string
  user_id: string
  bio: string
  profile_picture_url?: string
  verified: boolean
  platform_links?: {
    id: string
    platform: string
    url: string
    follower_count?: number
  }[]
  preferred_categories?: string[]
  response_time_hours?: number
  availability?: string
}

export function CreatorProfilePage() {
  const { creatorId } = useParams<{ creatorId: string }>()

  const profileQuery = useQuery({
    queryKey: ['creator-profile', creatorId],
    enabled: !!creatorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select(
          `
          id,
          user_id,
          bio,
          profile_picture_url,
          verified,
          platform_links (
            id,
            platform,
            url,
            follower_count
          ),
          preferred_categories,
          response_time_hours,
          availability
        `,
        )
        .eq('user_id', creatorId)
        .single()

      if (error) throw error
      return data as CreatorProfile
    },
  })

  const profile = profileQuery.data

  if (!creatorId) {
    return <div>Creator ID missing</div>
  }

  const getTotalFollowers = () => {
    if (!profile?.platform_links) return 0
    return profile.platform_links.reduce((sum, link) => sum + (link.follower_count || 0), 0)
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📱',
      tiktok: '🎵',
      youtube: '▶️',
      linkedin: '💼',
      twitter: '𝕏',
      twitch: '🎮',
      others: '🔗',
    }
    return icons[platform.toLowerCase()] || '🔗'
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-lg bg-gray-200 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 rounded bg-gray-200 animate-pulse"></div>
          <div className="h-4 rounded bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (profileQuery.error || !profile) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-800">
        Profil du créateur non trouvé
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {profile.profile_picture_url && (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil créateur</h1>
                {profile.verified && (
                  <p className="mt-1 text-sm text-green-600">✓ Profil vérifié</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">À propos</h2>
          <p className="mt-3 text-gray-700">{profile.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total followers</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{getTotalFollowers().toLocaleString()}</p>
        </div>

        {profile.response_time_hours && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Temps de réponse</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{profile.response_time_hours}h</p>
          </div>
        )}

        {profile.preferred_categories && profile.preferred_categories.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Catégories</p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {profile.preferred_categories.slice(0, 2).join(', ')}
              {profile.preferred_categories.length > 2 && ` (+${profile.preferred_categories.length - 2})`}
            </p>
          </div>
        )}
      </div>

      {/* Platform Links */}
      {profile.platform_links && profile.platform_links.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
          <div className="mt-4 space-y-3">
            {profile.platform_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    </p>
                    {link.follower_count && (
                      <p className="text-xs text-gray-600">{link.follower_count.toLocaleString()} followers</p>
                    )}
                  </div>
                </div>
                <span className="text-blue-600">→</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {profile.availability && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Disponibilité</h2>
          <p className="mt-3 text-gray-700">{profile.availability}</p>
        </div>
      )}
    </div>
  )
}

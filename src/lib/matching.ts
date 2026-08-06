// Ruche matching engine — scores how well a mission fits a creator.
// Pure and deterministic: takes profile + mission signals, returns a
// 0-100 score with human-readable reasons ("pourquoi cette mission est
// pour toi"). Designed so an AI model can replace the heuristics later
// without touching the UI.

export interface CreatorMatchProfile {
  platforms: Array<{ name: string; followerCount: number }>
  categories: string[]
  bio?: string | null
}

export interface MissionMatchTarget {
  id: string
  title: string
  eligibilityRules: string[]
  campaign?: {
    objective?: string | null
    targetAudience?: string | null
    description?: string | null
  } | null
}

export interface MatchResult {
  missionId: string
  /** 0–100 */
  score: number
  /** Short human-readable reasons why this fits (or empty) */
  reasons: string[]
}

const KNOWN_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitch', 'linkedin']

function missionText(mission: MissionMatchTarget): string {
  return [
    mission.title,
    ...mission.eligibilityRules,
    mission.campaign?.objective ?? '',
    mission.campaign?.targetAudience ?? '',
    mission.campaign?.description ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

/** Parse follower thresholds like "10k", "10 000", "10000 followers/abonnés" */
export function parseFollowerThreshold(rule: string): number | null {
  const normalized = rule.toLowerCase()
  if (!/(follower|abonn)/.test(normalized)) return null

  const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*k\b/)
  if (kMatch) return Math.round(parseFloat(kMatch[1].replace(',', '.')) * 1000)

  const plainMatch = normalized.replace(/[\s  ]/g, ' ').match(/(\d[\d ]*\d|\d+)/)
  if (plainMatch) {
    const value = parseInt(plainMatch[1].replace(/ /g, ''), 10)
    return Number.isNaN(value) ? null : value
  }

  return null
}

export function computeMatchScore(
  profile: CreatorMatchProfile,
  mission: MissionMatchTarget,
): MatchResult {
  const text = missionText(mission)
  let score = 50
  const reasons: string[] = []

  // Platform fit: mission mentions a platform the creator is on
  const mentionedPlatforms = KNOWN_PLATFORMS.filter((p) => text.includes(p))
  const creatorPlatforms = profile.platforms.map((p) => p.name.toLowerCase())
  for (const platform of mentionedPlatforms) {
    if (creatorPlatforms.includes(platform)) {
      score += 20
      reasons.push(`Tu es sur ${platform.charAt(0).toUpperCase() + platform.slice(1)}, la plateforme demandée`)
    } else {
      score -= 15
    }
  }

  // Category fit: creator categories appear in the mission/campaign text
  for (const category of profile.categories) {
    if (category.length >= 3 && text.includes(category.toLowerCase())) {
      score += 12
      reasons.push(`Ta catégorie « ${category} » correspond au sujet`)
    }
  }

  // Follower threshold from eligibility rules
  const totalFollowers = profile.platforms.reduce((sum, p) => sum + (p.followerCount || 0), 0)
  for (const rule of mission.eligibilityRules) {
    const threshold = parseFollowerThreshold(rule)
    if (threshold !== null) {
      if (totalFollowers >= threshold) {
        score += 15
        reasons.push(`Ton audience (${totalFollowers.toLocaleString()}) dépasse le minimum demandé`)
      } else {
        score -= 35
      }
      break
    }
  }

  return {
    missionId: mission.id,
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.slice(0, 3),
  }
}

export interface RankedMission<T> {
  mission: T
  match: MatchResult
}

/** Ranks missions best-fit first. Stable for equal scores. */
export function rankMissions<T extends MissionMatchTarget>(
  profile: CreatorMatchProfile,
  missions: T[],
): RankedMission<T>[] {
  return missions
    .map((mission) => ({ mission, match: computeMatchScore(profile, mission) }))
    .sort((a, b) => b.match.score - a.match.score)
}

/** A match is worth highlighting only if it clearly fits. */
export function isStrongMatch(match: MatchResult): boolean {
  return match.score >= 65 && match.reasons.length > 0
}

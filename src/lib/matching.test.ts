import { describe, it, expect } from 'vitest'
import {
  computeMatchScore,
  rankMissions,
  parseFollowerThreshold,
  isStrongMatch,
} from './matching'

const creator = {
  platforms: [{ name: 'instagram', followerCount: 12000 }],
  categories: ['beauté', 'lifestyle'],
  bio: 'Créatrice beauté',
}

const baseMission = {
  id: 'm1',
  title: 'Créer un contenu',
  eligibilityRules: [] as string[],
  campaign: null,
}

describe('parseFollowerThreshold', () => {
  it('parses "10k followers"', () => {
    expect(parseFollowerThreshold('Avoir au moins 10k followers')).toBe(10000)
  })

  it('parses "10 000 abonnés"', () => {
    expect(parseFollowerThreshold('Minimum 10 000 abonnés')).toBe(10000)
  })

  it('returns null for rules without follower context', () => {
    expect(parseFollowerThreshold('Contenu original requis')).toBeNull()
    expect(parseFollowerThreshold('Audience basée en France')).toBeNull()
  })
})

describe('computeMatchScore', () => {
  it('rewards platform match with a reason', () => {
    const result = computeMatchScore(creator, {
      ...baseMission,
      title: 'Reel Instagram produit',
    })
    expect(result.score).toBeGreaterThan(50)
    expect(result.reasons.some((r) => r.includes('Instagram'))).toBe(true)
  })

  it('penalizes missions on platforms the creator lacks', () => {
    const result = computeMatchScore(creator, {
      ...baseMission,
      title: 'Vidéo TikTok danse',
    })
    expect(result.score).toBeLessThan(50)
  })

  it('rewards category overlap', () => {
    const result = computeMatchScore(creator, {
      ...baseMission,
      campaign: { objective: 'Lancement gamme beauté', targetAudience: null, description: null },
    })
    expect(result.reasons.some((r) => r.includes('beauté'))).toBe(true)
  })

  it('penalizes unmet follower thresholds heavily', () => {
    const result = computeMatchScore(creator, {
      ...baseMission,
      eligibilityRules: ['Avoir au moins 50k followers'],
    })
    expect(result.score).toBeLessThanOrEqual(15)
  })

  it('rewards met follower thresholds', () => {
    const result = computeMatchScore(creator, {
      ...baseMission,
      eligibilityRules: ['Avoir au moins 10k followers'],
    })
    expect(result.score).toBeGreaterThan(50)
    expect(result.reasons.some((r) => r.includes('12'))).toBe(true)
  })

  it('clamps score to 0-100', () => {
    const bad = computeMatchScore(
      { platforms: [], categories: [], bio: null },
      {
        ...baseMission,
        title: 'instagram tiktok youtube twitch linkedin',
        eligibilityRules: ['100k followers minimum'],
      },
    )
    expect(bad.score).toBeGreaterThanOrEqual(0)
    expect(bad.score).toBeLessThanOrEqual(100)
  })
})

describe('rankMissions', () => {
  it('puts the best fit first', () => {
    const ranked = rankMissions(creator, [
      { ...baseMission, id: 'tiktok', title: 'Vidéo TikTok' },
      { ...baseMission, id: 'insta', title: 'Post Instagram beauté' },
    ])
    expect(ranked[0].mission.id).toBe('insta')
  })
})

describe('isStrongMatch', () => {
  it('requires both a high score and at least one reason', () => {
    expect(isStrongMatch({ missionId: 'x', score: 80, reasons: ['ok'] })).toBe(true)
    expect(isStrongMatch({ missionId: 'x', score: 80, reasons: [] })).toBe(false)
    expect(isStrongMatch({ missionId: 'x', score: 50, reasons: ['ok'] })).toBe(false)
  })
})

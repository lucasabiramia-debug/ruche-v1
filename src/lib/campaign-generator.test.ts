import { describe, it, expect } from 'vitest'
import { generateCampaignPlan, generateBriefDraft } from './campaign-generator'

describe('generateCampaignPlan', () => {
  it('detects a product launch intent', () => {
    const plan = generateCampaignPlan('Lancement de notre nouvelle gamme de cosmétiques bio')
    expect(plan.title).toContain('Lancement')
    expect(plan.missions.length).toBeGreaterThanOrEqual(2)
    expect(plan.suggestedBudget).toBeGreaterThan(0)
  })

  it('detects an event intent (JPO)', () => {
    const plan = generateCampaignPlan('Faire venir des lycéens à nos portes ouvertes en mars')
    expect(plan.title).toContain('Événement')
    expect(plan.missions.some((m) => m.title.includes('jour J'))).toBe(true)
  })

  it('detects recruitment/school intent', () => {
    const plan = generateCampaignPlan('Attirer des étudiants pour notre école de commerce')
    expect(plan.title).toContain('Recrutement')
  })

  it('adds a platform rule when a platform is mentioned', () => {
    const plan = generateCampaignPlan('Campagne de notoriété sur Instagram et TikTok')
    for (const mission of plan.missions) {
      expect(mission.eligibilityRules.some((r) => r.includes('Instagram'))).toBe(true)
    }
    expect(plan.targetAudience).toContain('instagram')
  })

  it('respects an explicit budget hint', () => {
    const plan = generateCampaignPlan('Avis sur notre application mobile', 2500)
    expect(plan.suggestedBudget).toBe(2500)
  })

  it('falls back to a generic plan for unknown needs', () => {
    const plan = generateCampaignPlan('Quelque chose de sympa pour la marque')
    expect(plan.missions.length).toBeGreaterThanOrEqual(1)
    expect(plan.objective.length).toBeGreaterThan(0)
  })

  it('keeps the original need as description and truncates long titles', () => {
    const longNeed =
      'Nous voulons absolument faire découvrir notre tout nouveau service de livraison de paniers de légumes locaux à toute la région lyonnaise'
    const plan = generateCampaignPlan(longNeed)
    expect(plan.description).toBe(longNeed)
    expect(plan.title.length).toBeLessThanOrEqual(80)
  })
})

describe('generateBriefDraft', () => {
  it('builds a complete brief from mission + campaign context', () => {
    const draft = generateBriefDraft({
      missionTitle: 'Vidéo de découverte',
      campaignTitle: 'Lancement gamme bio',
      campaignObjective: 'Générer les premières ventes',
      targetAudience: '18-25 ans',
    })

    expect(draft.title).toContain('Vidéo de découverte')
    expect(draft.instructions).toContain('Générer les premières ventes')
    expect(draft.instructions).toContain('18-25 ans')
    expect(draft.mandatoryMentions.length).toBeGreaterThan(0)
    expect(draft.prohibitedClaims.length).toBeGreaterThan(0)
  })

  it('handles missing campaign context', () => {
    const draft = generateBriefDraft({ missionTitle: 'Post Instagram' })
    expect(draft.instructions).toContain('Post Instagram')
    expect(draft.instructions).not.toContain('undefined')
  })
})

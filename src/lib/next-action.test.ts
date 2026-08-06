import { describe, it, expect } from 'vitest'
import { computeCreatorNextAction, computeCompanyNextAction } from './next-action'

describe('computeCreatorNextAction', () => {
  const base = {
    hasProfile: true,
    pendingApplications: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    totalPending: 0,
  }

  it('sends new users to onboarding first, before anything else', () => {
    const action = computeCreatorNextAction({
      ...base,
      hasProfile: false,
      activeAssignments: 3,
    })
    expect(action.to).toBe('/creator/onboarding')
  })

  it('prioritizes active assignments over pending applications', () => {
    const action = computeCreatorNextAction({
      ...base,
      activeAssignments: 2,
      pendingApplications: 5,
    })
    expect(action.to).toBe('/creator/assignments')
    expect(action.title).toContain('2')
  })

  it('suggests exploring more missions while applications are pending', () => {
    const action = computeCreatorNextAction({ ...base, pendingApplications: 1 })
    expect(action.to).toBe('/creator/missions')
  })

  it('points to earnings when work is done and money is pending', () => {
    const action = computeCreatorNextAction({
      ...base,
      completedAssignments: 1,
      totalPending: 300,
    })
    expect(action.to).toBe('/creator/earnings')
    expect(action.reason).toContain('300')
  })

  it('defaults to exploring missions', () => {
    expect(computeCreatorNextAction(base).to).toBe('/creator/missions')
  })
})

describe('computeCompanyNextAction', () => {
  const base = {
    totalCampaigns: 0,
    activeCampaigns: 0,
    draftCampaigns: 0,
    totalMissions: 0,
    publishedMissions: 0,
  }

  it('starts with campaign creation', () => {
    expect(computeCompanyNextAction(base).to).toBe('/company/campaigns')
    expect(computeCompanyNextAction(base).title).toContain('première campagne')
  })

  it('asks for a mission when campaigns have none', () => {
    const action = computeCompanyNextAction({ ...base, totalCampaigns: 1 })
    expect(action.title).toContain('mission')
  })

  it('pushes publishing when all missions are drafts', () => {
    const action = computeCompanyNextAction({
      ...base,
      totalCampaigns: 1,
      totalMissions: 2,
      publishedMissions: 0,
    })
    expect(action.title).toContain('Publie')
  })

  it('surfaces draft campaigns once missions are published', () => {
    const action = computeCompanyNextAction({
      ...base,
      totalCampaigns: 2,
      draftCampaigns: 1,
      totalMissions: 2,
      publishedMissions: 1,
    })
    expect(action.title).toContain('brouillon')
  })

  it('defaults to reviewing applications when everything is live', () => {
    const action = computeCompanyNextAction({
      totalCampaigns: 1,
      activeCampaigns: 1,
      draftCampaigns: 0,
      totalMissions: 1,
      publishedMissions: 1,
    })
    expect(action.to).toBe('/company/applications')
  })
})

import { describe, it, expect } from 'vitest'
import { computeCreatorStats, computeCompanyStats } from './dashboard-stats'

describe('computeCreatorStats', () => {
  it('returns zeros for empty inputs', () => {
    const stats = computeCreatorStats({
      applications: [],
      assignments: [],
      paymentSummary: null,
    })

    expect(stats).toEqual({
      pendingApplications: 0,
      approvedApplications: 0,
      activeAssignments: 0,
      completedAssignments: 0,
      totalEarned: 0,
      totalPending: 0,
    })
  })

  it('counts applications by status', () => {
    const stats = computeCreatorStats({
      applications: [
        { status: 'submitted' },
        { status: 'submitted' },
        { status: 'approved' },
        { status: 'rejected' },
      ],
      assignments: [],
      paymentSummary: null,
    })

    expect(stats.pendingApplications).toBe(2)
    expect(stats.approvedApplications).toBe(1)
  })

  it('counts active and in_progress assignments together', () => {
    const stats = computeCreatorStats({
      applications: [],
      assignments: [
        { assignment_status: 'active' },
        { assignment_status: 'in_progress' },
        { assignment_status: 'completed' },
        { assignment_status: 'cancelled' },
      ],
      paymentSummary: null,
    })

    expect(stats.activeAssignments).toBe(2)
    expect(stats.completedAssignments).toBe(1)
  })

  it('passes through payment summary amounts', () => {
    const stats = computeCreatorStats({
      applications: [],
      assignments: [],
      paymentSummary: { total_earned: 1500, total_paid: 1000, total_pending: 500 },
    })

    expect(stats.totalEarned).toBe(1500)
    expect(stats.totalPending).toBe(500)
  })
})

describe('computeCompanyStats', () => {
  it('returns zeros for no campaigns', () => {
    expect(computeCompanyStats([])).toEqual({
      totalCampaigns: 0,
      activeCampaigns: 0,
      draftCampaigns: 0,
      totalMissions: 0,
      publishedMissions: 0,
      totalBudget: 0,
    })
  })

  it('counts campaigns by status and aggregates missions', () => {
    const stats = computeCompanyStats([
      {
        status: 'active',
        budget_ceiling: 2000,
        missions: [
          { publication_status: 'published' },
          { publication_status: 'draft' },
        ],
      },
      { status: 'draft', budget_ceiling: 500, missions: [] },
      { status: 'archived', budget_ceiling: 9999, missions: null },
    ])

    expect(stats.totalCampaigns).toBe(3)
    expect(stats.activeCampaigns).toBe(1)
    expect(stats.draftCampaigns).toBe(1)
    expect(stats.totalMissions).toBe(2)
    expect(stats.publishedMissions).toBe(1)
  })

  it('excludes archived and cancelled campaigns from total budget', () => {
    const stats = computeCompanyStats([
      { status: 'active', budget_ceiling: 2000 },
      { status: 'draft', budget_ceiling: 500 },
      { status: 'archived', budget_ceiling: 9999 },
      { status: 'cancelled', budget_ceiling: 1234 },
      { status: 'active', budget_ceiling: null },
    ])

    expect(stats.totalBudget).toBe(2500)
  })
})

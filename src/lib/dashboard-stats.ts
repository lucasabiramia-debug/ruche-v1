// Pure KPI derivations for the creator and company dashboards.
// No Supabase dependency: takes raw rows, returns display-ready numbers.

export interface CreatorStatsInput {
  applications: Array<{ status: string }>
  assignments: Array<{ assignment_status: string }>
  paymentSummary: {
    total_earned: number
    total_paid: number
    total_pending: number
  } | null
}

export interface CreatorStats {
  pendingApplications: number
  approvedApplications: number
  activeAssignments: number
  completedAssignments: number
  totalEarned: number
  totalPending: number
}

export function computeCreatorStats(input: CreatorStatsInput): CreatorStats {
  const pendingApplications = input.applications.filter(
    (a) => a.status === 'submitted',
  ).length
  const approvedApplications = input.applications.filter(
    (a) => a.status === 'approved',
  ).length
  const activeAssignments = input.assignments.filter(
    (a) => a.assignment_status === 'active' || a.assignment_status === 'in_progress',
  ).length
  const completedAssignments = input.assignments.filter(
    (a) => a.assignment_status === 'completed',
  ).length

  return {
    pendingApplications,
    approvedApplications,
    activeAssignments,
    completedAssignments,
    totalEarned: input.paymentSummary?.total_earned ?? 0,
    totalPending: input.paymentSummary?.total_pending ?? 0,
  }
}

export interface CompanyCampaignRow {
  status: string
  budget_ceiling?: number | null
  missions?: Array<{ publication_status: string }> | null
}

export interface CompanyStats {
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  totalMissions: number
  publishedMissions: number
  totalBudget: number
}

export function computeCompanyStats(campaigns: CompanyCampaignRow[]): CompanyStats {
  let totalMissions = 0
  let publishedMissions = 0
  let totalBudget = 0

  for (const campaign of campaigns) {
    const missions = campaign.missions ?? []
    totalMissions += missions.length
    publishedMissions += missions.filter(
      (m) => m.publication_status === 'published',
    ).length
    if (campaign.status !== 'archived' && campaign.status !== 'cancelled') {
      totalBudget += campaign.budget_ceiling ?? 0
    }
  }

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    draftCampaigns: campaigns.filter((c) => c.status === 'draft').length,
    totalMissions,
    publishedMissions,
    totalBudget,
  }
}

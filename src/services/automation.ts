// One-click flows: chain the individual services so a single user action
// completes the whole business step. "J'accepte" → everything follows.

import { reviewApplication } from '@/services/applications'
import { createAssignment } from '@/services/assignments'
import { createPayment } from '@/services/payments'
import { createBrief } from '@/services/briefs'
import { createCampaign } from '@/services/campaigns'
import { createMission } from '@/services/mission-management'
import { generateBriefDraft } from '@/lib/campaign-generator'
import type { CampaignPlan } from '@/lib/campaign-generator'

export interface ApproveAndAssignInput {
  applicationId: string
  missionId: string
  creatorId: string
  proposedPrice: number
  /** Extra context to auto-draft the brief */
  missionTitle?: string
  campaignTitle?: string | null
  campaignObjective?: string | null
  targetAudience?: string | null
}

/**
 * Approves an application and automatically:
 * 1. creates the assignment (the creator can start immediately)
 * 2. creates the pending payment for the agreed price
 * 3. auto-drafts the brief so the creator knows what to do right away
 * Returns the created assignment.
 */
export async function approveApplicationAndAssign(input: ApproveAndAssignInput) {
  await reviewApplication(input.applicationId, 'approved')

  const assignment = await createAssignment(
    input.missionId,
    input.creatorId,
    input.applicationId,
    input.proposedPrice,
  )

  await createPayment({
    assignmentId: assignment.id,
    creatorId: input.creatorId,
    agreedAmount: input.proposedPrice,
    payableAmount: input.proposedPrice,
  })

  if (input.missionTitle) {
    const draft = generateBriefDraft({
      missionTitle: input.missionTitle,
      campaignTitle: input.campaignTitle,
      campaignObjective: input.campaignObjective,
      targetAudience: input.targetAudience,
    })
    await createBrief({
      assignmentId: assignment.id,
      title: draft.title,
      instructions: draft.instructions,
      mandatoryMentions: draft.mandatoryMentions,
      prohibitedClaims: draft.prohibitedClaims,
    })
  }

  return assignment
}

/**
 * Materializes a generated campaign plan in one call:
 * creates the campaign then every mission attached to it.
 * Returns the created campaign with its mission count.
 */
export async function createCampaignFromPlan(
  organizationId: string,
  createdBy: string,
  plan: CampaignPlan,
) {
  const campaign = await createCampaign(organizationId, createdBy, {
    title: plan.title,
    description: plan.description,
    objective: plan.objective,
    targetAudience: plan.targetAudience,
    budgetCeiling: plan.suggestedBudget,
  })

  for (const mission of plan.missions) {
    await createMission({
      campaignId: campaign.id,
      title: mission.title,
      eligibilityRules: mission.eligibilityRules,
    })
  }

  return { campaign, missionCount: plan.missions.length }
}

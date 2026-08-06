// One-click flows: chain the individual services so a single user action
// completes the whole business step. "J'accepte" → everything follows.

import { reviewApplication } from '@/services/applications'
import { createAssignment } from '@/services/assignments'
import { createPayment } from '@/services/payments'

export interface ApproveAndAssignInput {
  applicationId: string
  missionId: string
  creatorId: string
  proposedPrice: number
}

/**
 * Approves an application and automatically:
 * 1. creates the assignment (the creator can start immediately)
 * 2. creates the pending payment for the agreed price
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

  return assignment
}

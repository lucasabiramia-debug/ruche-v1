import { describe, it, expect } from 'vitest'
import { computeCollaborationTracking } from './collaboration-tracker'

const base = {
  assignmentStatus: 'active',
  hasBrief: false,
  proofStatuses: [] as string[],
  paymentStatus: null as string | null,
}

describe('computeCollaborationTracking', () => {
  it('starts at "brief" when no brief exists yet', () => {
    const t = computeCollaborationTracking(base)
    expect(t.steps.find((s) => s.key === 'brief')?.state).toBe('current')
    expect(t.steps.find((s) => s.key === 'accepted')?.state).toBe('done')
    expect(t.nextAction).toBeNull()
    expect(t.progress).toBe(20)
  })

  it('moves to production once the brief exists, with a brief CTA', () => {
    const t = computeCollaborationTracking({ ...base, hasBrief: true })
    expect(t.steps.find((s) => s.key === 'production')?.state).toBe('current')
    expect(t.nextAction?.targetKey).toBe('brief')
  })

  it('moves to review when a proof is submitted', () => {
    const t = computeCollaborationTracking({
      ...base,
      hasBrief: true,
      proofStatuses: ['submitted'],
    })
    expect(t.steps.find((s) => s.key === 'review')?.state).toBe('current')
    expect(t.nextAction).toBeNull()
  })

  it('returns to production with a resubmit CTA on needs_revision', () => {
    const t = computeCollaborationTracking({
      ...base,
      hasBrief: true,
      proofStatuses: ['needs_revision'],
    })
    const production = t.steps.find((s) => s.key === 'production')
    expect(production?.state).toBe('current')
    expect(production?.detail).toContain('ajustements')
    expect(t.nextAction?.targetKey).toBe('proof')
  })

  it('moves to payment once a proof is approved', () => {
    const t = computeCollaborationTracking({
      ...base,
      hasBrief: true,
      proofStatuses: ['approved'],
      paymentStatus: 'pending',
    })
    expect(t.steps.find((s) => s.key === 'payment')?.state).toBe('current')
    expect(t.nextAction?.targetKey).toBe('earnings')
    expect(t.progress).toBe(80)
  })

  it('marks everything done when paid', () => {
    const t = computeCollaborationTracking({
      ...base,
      hasBrief: true,
      proofStatuses: ['approved'],
      paymentStatus: 'paid',
    })
    expect(t.steps.every((s) => s.state === 'done')).toBe(true)
    expect(t.progress).toBe(100)
  })

  it('uses the most recent proof status when several exist', () => {
    const t = computeCollaborationTracking({
      ...base,
      hasBrief: true,
      proofStatuses: ['submitted', 'needs_revision'],
    })
    expect(t.steps.find((s) => s.key === 'review')?.state).toBe('current')
  })
})

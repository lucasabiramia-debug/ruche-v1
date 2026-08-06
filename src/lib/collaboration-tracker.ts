// Uber-style live tracking of a collaboration: from the raw state of an
// assignment (brief? proofs? payment?), derive a 5-step timeline with
// exactly one current step and one next action. Pure and fully testable.

export type StepState = 'done' | 'current' | 'upcoming'

export interface TimelineStep {
  key: string
  label: string
  /** What is happening / what to do — only meaningful on the current step */
  detail: string
  state: StepState
}

export interface CollaborationTrackerInput {
  assignmentStatus: string
  hasBrief: boolean
  /** Statuses of submitted proofs, most recent first */
  proofStatuses: string[]
  paymentStatus: string | null
}

export interface CollaborationTracking {
  steps: TimelineStep[]
  /** 0-100, for a progress bar */
  progress: number
  /** The single next action for the creator, or null when all done */
  nextAction: { label: string; targetKey: 'brief' | 'proof' | 'earnings' } | null
}

export function computeCollaborationTracking(
  input: CollaborationTrackerInput,
): CollaborationTracking {
  const latestProof = input.proofStatuses[0] ?? null
  const hasApprovedProof = input.proofStatuses.includes('approved')
  const isPaid = input.paymentStatus === 'paid'
  const needsRevision = latestProof === 'needs_revision'
  const proofUnderReview = latestProof === 'submitted'

  // Determine how far the collaboration has progressed (index of current step)
  let currentIndex: number
  if (isPaid) {
    currentIndex = 5 // everything done
  } else if (hasApprovedProof) {
    currentIndex = 4 // waiting for payment
  } else if (proofUnderReview) {
    currentIndex = 3 // brand is reviewing
  } else if (input.hasBrief) {
    currentIndex = 2 // creator produces content (also after needs_revision)
  } else {
    currentIndex = 1 // waiting for the brief
  }

  const stepDefs: Array<{ key: string; label: string; detail: string }> = [
    {
      key: 'accepted',
      label: 'Mission acceptée',
      detail: 'La marque t’a choisi pour cette mission.',
    },
    {
      key: 'brief',
      label: 'Brief prêt',
      detail: input.hasBrief
        ? 'Ton brief est disponible — lis-le avant de créer.'
        : 'La marque prépare ton brief, tu seras notifié.',
    },
    {
      key: 'production',
      label: 'Création du contenu',
      detail: needsRevision
        ? 'La marque demande des ajustements — consulte ses retours et soumets une nouvelle version.'
        : 'À toi de jouer : crée ton contenu en suivant le brief, puis soumets ta preuve.',
    },
    {
      key: 'review',
      label: 'Validation par la marque',
      detail: 'Ta preuve est entre les mains de la marque — réponse rapide en général.',
    },
    {
      key: 'payment',
      label: 'Paiement',
      detail: isPaid
        ? 'Paiement effectué. Bravo pour cette collaboration !'
        : 'Contenu validé ! Ton paiement est en préparation.',
    },
  ]

  const steps: TimelineStep[] = stepDefs.map((def, index) => ({
    ...def,
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }))

  const progress = Math.round((Math.min(currentIndex, 5) / 5) * 100)

  let nextAction: CollaborationTracking['nextAction'] = null
  if (currentIndex === 2) {
    nextAction = needsRevision
      ? { label: 'Soumettre une nouvelle version', targetKey: 'proof' }
      : { label: 'Voir le brief et créer', targetKey: 'brief' }
  } else if (currentIndex === 4 || currentIndex === 5) {
    nextAction = { label: 'Suivre mon paiement', targetKey: 'earnings' }
  }

  return { steps, progress, nextAction }
}

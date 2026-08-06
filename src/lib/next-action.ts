// "Copilote Ruche" — computes THE single next best action for a user,
// so every dashboard can show one clear step instead of a wall of options.
// Pure and rule-based today; the interface is what an AI recommendation
// engine would produce, so it can be swapped for a model later.

export interface NextAction {
  /** Short imperative title, e.g. "Complète ton profil" */
  title: string
  /** One sentence explaining why this is the right next step */
  reason: string
  /** Route to send the user to */
  to: string
  /** Label of the single CTA button */
  cta: string
  /** Emoji illustrating the step */
  emoji: string
}

export interface CreatorJourneyState {
  hasProfile: boolean
  pendingApplications: number
  activeAssignments: number
  completedAssignments: number
  totalPending: number
}

export function computeCreatorNextAction(state: CreatorJourneyState): NextAction {
  if (!state.hasProfile) {
    return {
      emoji: '👤',
      title: 'Complète ton profil',
      reason:
        'Les marques regardent ton profil avant de valider une candidature — 5 minutes suffisent.',
      to: '/creator/onboarding',
      cta: 'Créer mon profil',
    }
  }

  if (state.activeAssignments > 0) {
    return {
      emoji: '🎬',
      title: state.activeAssignments === 1 ? 'Une mission t’attend' : `${state.activeAssignments} missions t’attendent`,
      reason:
        'Consulte le brief, produis ton contenu et soumets ta preuve pour déclencher le paiement.',
      to: '/creator/assignments',
      cta: 'Voir mes missions',
    }
  }

  if (state.pendingApplications > 0) {
    return {
      emoji: '⏳',
      title: 'Candidatures en cours d’examen',
      reason: `${state.pendingApplications} candidature${state.pendingApplications > 1 ? 's' : ''} en attente de réponse — augmente tes chances en postulant à d’autres missions.`,
      to: '/creator/missions',
      cta: 'Explorer les missions',
    }
  }

  if (state.completedAssignments > 0 && state.totalPending > 0) {
    return {
      emoji: '💸',
      title: 'Paiement en préparation',
      reason: `€${state.totalPending.toLocaleString()} en attente de versement — suis leur statut, et enchaîne sur une nouvelle mission.`,
      to: '/creator/earnings',
      cta: 'Voir mes revenus',
    }
  }

  return {
    emoji: '🔍',
    title: 'Trouve ta prochaine mission',
    reason: 'Des marques publient de nouvelles missions régulièrement — postule avec ton tarif.',
    to: '/creator/missions',
    cta: 'Explorer les missions',
  }
}

export interface CompanyJourneyState {
  totalCampaigns: number
  activeCampaigns: number
  draftCampaigns: number
  totalMissions: number
  publishedMissions: number
}

export function computeCompanyNextAction(state: CompanyJourneyState): NextAction {
  if (state.totalCampaigns === 0) {
    return {
      emoji: '🚀',
      title: 'Lance ta première campagne',
      reason:
        'Décris ton objectif et ton budget — les missions et les créateurs viennent ensuite.',
      to: '/company/campaigns',
      cta: 'Créer une campagne',
    }
  }

  if (state.totalMissions === 0) {
    return {
      emoji: '🎯',
      title: 'Ajoute une mission à ta campagne',
      reason:
        'Une campagne sans mission ne reçoit aucune candidature — définis ce que les créateurs doivent produire.',
      to: '/company/campaigns',
      cta: 'Ajouter une mission',
    }
  }

  if (state.publishedMissions === 0) {
    return {
      emoji: '📢',
      title: 'Publie tes missions',
      reason:
        'Tes missions sont en brouillon : tant qu’elles ne sont pas publiées, les créateurs ne les voient pas.',
      to: '/company/campaigns',
      cta: 'Publier mes missions',
    }
  }

  if (state.draftCampaigns > 0) {
    return {
      emoji: '📝',
      title: 'Finalise ta campagne en brouillon',
      reason: `${state.draftCampaigns} campagne${state.draftCampaigns > 1 ? 's' : ''} en attente d’activation.`,
      to: '/company/campaigns',
      cta: 'Voir mes brouillons',
    }
  }

  return {
    emoji: '📥',
    title: 'Examine les candidatures',
    reason:
      'Tes missions sont en ligne — réponds vite aux créateurs pour garder les meilleurs profils.',
    to: '/company/applications',
    cta: 'Voir les candidatures',
  }
}

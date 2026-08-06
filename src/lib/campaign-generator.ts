// Studio de campagne — turns a one-sentence need into a complete,
// ready-to-launch campaign plan (title, objective, audience, missions
// with eligibility rules, budget suggestion) plus auto-drafted briefs.
// Deterministic template engine today; the input/output contract is what
// an LLM would consume/produce, so it can be upgraded to a real model
// without touching the UI.

export interface CampaignPlan {
  title: string
  objective: string
  targetAudience: string
  description: string
  suggestedBudget: number
  missions: Array<{
    title: string
    eligibilityRules: string[]
  }>
}

interface Intent {
  key: string
  keywords: string[]
  titlePrefix: string
  objective: string
  missions: Array<{ title: string; eligibilityRules: string[] }>
  baseBudget: number
}

const INTENTS: Intent[] = [
  {
    key: 'launch',
    keywords: ['lancement', 'lancer', 'nouveau produit', 'nouvelle', 'sortie'],
    titlePrefix: 'Lancement',
    objective: 'Faire connaître le nouveau produit et générer les premières ventes',
    missions: [
      {
        title: 'Vidéo de découverte du produit',
        eligibilityRules: ['Contenu original requis', 'Publication dans les 14 jours'],
      },
      {
        title: 'Avis authentique après essai',
        eligibilityRules: ['Avoir testé le produit au moins 7 jours', 'Transparence sur le partenariat'],
      },
    ],
    baseBudget: 1500,
  },
  {
    key: 'awareness',
    keywords: ['notoriété', 'visibilité', 'faire connaître', 'connaitre', 'image de marque'],
    titlePrefix: 'Notoriété',
    objective: 'Augmenter la visibilité et la reconnaissance de la marque',
    missions: [
      {
        title: 'Story / post de présentation de la marque',
        eligibilityRules: ['Mention du compte de la marque', 'Publication dans les 7 jours'],
      },
      {
        title: 'Contenu lifestyle intégrant la marque',
        eligibilityRules: ['Intégration naturelle, pas de discours publicitaire'],
      },
    ],
    baseBudget: 1000,
  },
  {
    key: 'review',
    keywords: ['avis', 'review', 'test produit', 'tester', 'retour'],
    titlePrefix: 'Avis produit',
    objective: 'Récolter des avis authentiques et du contenu réutilisable',
    missions: [
      {
        title: 'Test et avis détaillé du produit',
        eligibilityRules: ['Avis honnête et transparent', 'Droits de réutilisation accordés à la marque'],
      },
    ],
    baseBudget: 600,
  },
  {
    key: 'event',
    keywords: ['événement', 'evenement', 'salon', 'portes ouvertes', 'jpo', 'soirée', 'inauguration'],
    titlePrefix: 'Événement',
    objective: 'Attirer du public et couvrir l’événement en contenu',
    missions: [
      {
        title: 'Annonce de l’événement à ta communauté',
        eligibilityRules: ['Audience locale prioritaire', 'Publication au moins 7 jours avant'],
      },
      {
        title: 'Couverture le jour J (stories, vidéo)',
        eligibilityRules: ['Présence sur place requise'],
      },
    ],
    baseBudget: 800,
  },
  {
    key: 'recruitment',
    keywords: ['recrutement', 'recruter', 'candidat', 'étudiants', 'admissions', 'école', 'formation', 'inscription'],
    titlePrefix: 'Recrutement',
    objective: 'Attirer des candidatures qualifiées via des créateurs crédibles',
    missions: [
      {
        title: 'Témoignage / immersion authentique',
        eligibilityRules: ['Lien réel avec le domaine', 'Ton authentique, pas de script imposé'],
      },
      {
        title: 'Q&A avec ta communauté',
        eligibilityRules: ['Session questions/réponses en story ou live'],
      },
    ],
    baseBudget: 900,
  },
]

const DEFAULT_INTENT: Intent = {
  key: 'general',
  keywords: [],
  titlePrefix: 'Campagne',
  objective: 'Créer du contenu authentique avec des créateurs alignés avec la marque',
  missions: [
    {
      title: 'Contenu créatif autour de la marque',
      eligibilityRules: ['Contenu original requis', 'Transparence sur le partenariat'],
    },
  ],
  baseBudget: 800,
}

const PLATFORM_KEYWORDS = ['instagram', 'tiktok', 'youtube', 'twitch', 'linkedin']

/** Extracts the subject of the sentence for the campaign title (best effort). */
function extractSubject(text: string): string {
  const cleaned = text.trim().replace(/[.!?]+$/, '')
  if (cleaned.length <= 60) return cleaned
  return cleaned.slice(0, 57) + '…'
}

export function generateCampaignPlan(need: string, budgetHint?: number): CampaignPlan {
  const text = need.toLowerCase()

  const intent =
    INTENTS.find((i) => i.keywords.some((k) => text.includes(k))) ?? DEFAULT_INTENT

  const platforms = PLATFORM_KEYWORDS.filter((p) => text.includes(p))

  // Platform-specific rule appended to every mission when detected
  const platformRule =
    platforms.length > 0
      ? `Présence active sur ${platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ou ')}`
      : null

  const missions = intent.missions.map((m) => ({
    title: m.title,
    eligibilityRules: platformRule ? [...m.eligibilityRules, platformRule] : m.eligibilityRules,
  }))

  const audienceParts: string[] = []
  if (/local|proximité|région|ville/.test(text)) audienceParts.push('audience locale')
  if (/jeune|étudiant|18-25|génération z|gen z/.test(text)) audienceParts.push('18-25 ans')
  if (/famille|parent/.test(text)) audienceParts.push('familles')
  if (platforms.length > 0) audienceParts.push(`communautés ${platforms.join(' / ')}`)

  return {
    title: `${intent.titlePrefix} — ${extractSubject(need)}`,
    objective: intent.objective,
    targetAudience:
      audienceParts.length > 0
        ? audienceParts.join(', ')
        : 'Communautés engagées des créateurs sélectionnés',
    description: need.trim(),
    suggestedBudget: budgetHint && budgetHint > 0 ? budgetHint : intent.baseBudget,
    missions,
  }
}

export interface BriefDraftContext {
  missionTitle: string
  campaignTitle?: string | null
  campaignObjective?: string | null
  targetAudience?: string | null
}

export interface BriefDraft {
  title: string
  instructions: string
  mandatoryMentions: string[]
  prohibitedClaims: string[]
}

/** Auto-drafts a structured brief the moment a creator is assigned. */
export function generateBriefDraft(context: BriefDraftContext): BriefDraft {
  const lines = [
    `Mission : ${context.missionTitle}.`,
    context.campaignObjective
      ? `Objectif de la campagne : ${context.campaignObjective}.`
      : null,
    context.targetAudience ? `Public visé : ${context.targetAudience}.` : null,
    '',
    'Attendus :',
    '1. Produis un contenu authentique, fidèle à ton style habituel.',
    '2. Mentionne clairement le partenariat (obligation légale).',
    '3. Envoie ta preuve de publication depuis ton espace Ruche une fois en ligne.',
    '',
    'Ce brief a été préparé automatiquement — la marque peut le préciser à tout moment.',
  ].filter((l): l is string => l !== null)

  return {
    title: `Brief — ${context.missionTitle}`,
    instructions: lines.join('\n'),
    mandatoryMentions: ['Mention du partenariat (#collaboration ou #partenariat)'],
    prohibitedClaims: ['Aucune promesse chiffrée non vérifiée', 'Pas de dénigrement de concurrents'],
  }
}

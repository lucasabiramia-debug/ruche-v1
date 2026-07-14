# MVP_IMPLEMENTATION_PLAN.md — Ruche V1

Objectif : rendre réellement fonctionnelle, bouton par bouton, la verticale décrite dans `PRODUCT_REQUIREMENTS.md` §3 et `ACCEPTANCE_TESTS.md`, avec 3 à 5 vrais créateurs dès le premier pilote.

## Ordre de développement et dépendances

### Phase 0 — Fondations (bloquant tout le reste)
1. Provisionner le projet Supabase, appliquer `DATABASE_SCHEMA.sql` en migrations numérotées.
2. Appliquer `RLS_POLICIES.sql` et `STORAGE_POLICIES.sql`.
3. Générer les types TypeScript (`supabase gen types typescript`).
4. Mettre en place `AuthProvider`, `ProtectedRoute`, layouts `PublicLayout`/`CreatorLayout`/`CompanyLayout`.
5. Créer le premier `organization_admin` réel (script one-shot, pas d'UI encore) pour pouvoir se connecter côté Entreprise.

*Critère de fin* : un utilisateur peut s'inscrire, confirmer son email, se connecter, atterrir sur un dashboard vide selon son rôle.

### Phase 1 — Invitation → compte créateur
6. `/company/invitations` : formulaire d'invitation, génération de jeton (hash stocké, jeton brut envoyé une seule fois), statut `created`.
7. Edge function ou job d'envoi d'email (template "invitation créateur", voir `PRODUCT_REQUIREMENTS.md` — Resend en V1.1, en V1 un lien copiable suffit si l'envoi réel n'est pas encore câblé).
8. `/invitation/:token` : vérification via `verify_invitation_token()`, formulaire de création de compte pré-rempli avec l'email invité, `invitations.status -> accepted`.

*Critère de fin* : un lien d'invitation généré par un admin permet à un vrai créateur de créer un compte lié à la bonne organisation.

### Phase 2 — Onboarding et validation de profil
9. `/creator/onboarding` : 6 étapes (Identité, Réseaux, Audience, Types de contenu, Tarifs indicatifs, Vérification/consentement), écriture progressive dans `creator_profiles`/`creator_platforms`, upload statistiques vers bucket `creator-statistics`.
10. Soumission finale → `profile_status = pending_review`.
11. `/company/creators/:id/verify` : actions Valider / Demander correction / Refuser, chacune avec note obligatoire et entrée `audit_logs`.

*Critère de fin* : un profil créé par un créateur est visible et validable côté EBS, le statut se répercute immédiatement côté créateur.

### Phase 3 — Campagne → mission
12. `/company/campaigns` : création (brouillon), édition, publication (`status -> active`).
13. Missions rattachées à une campagne, `publication_status -> open`.

*Critère de fin* : une mission publiée apparaît dans `/creator/missions` pour un créateur au profil validé.

### Phase 4 — Candidature → acceptation → assignment
14. `/creator/missions` + candidature (formulaire message/format/délai/montant proposé) → `applications` (`status = submitted`).
15. `/company/applications` : vue par mission, accepter/refuser. Acceptation = transaction qui crée `assignments` + met `applications.status = accepted` + refuse implicitement les autres candidatures concurrentes si la mission est à créateur unique (règle à confirmer avec le produit — sinon laisser plusieurs assignments actifs par mission).

*Critère de fin* : une acceptation crée un assignment réel, visible côté créateur.

### Phase 5 — Brief → preuve → validation
16. `/company/campaigns/:id` (ou `/company/assignments/:id`) : édition du brief (`briefs`), publication (`validation_status -> published`).
17. `/creator/assignments/:id` : lecture du brief.
18. `/creator/proofs` : dépôt de preuve (lien ou fichier via bucket `proofs`/`proof-statistics`), `proofs.status -> submitted`.
19. `/company/proofs` : file de validation, actions Approuver / Demander correction / Refuser.

*Critère de fin* : une preuve déposée par le créateur est visible et traitable côté EBS, avec retour de statut visible côté créateur (y compris `correction_requested` qui redonne la main au créateur).

### Phase 6 — Paiement (suivi manuel)
20. Création automatique d'une ligne `payments` (`status = not_due`) à la création de l'assignment (montant = `agreed_budget`), ou à l'approbation de la première preuve — à trancher avec le produit, mais dans tous les cas **jamais** de passage automatique à `ready_to_pay`/`paid` (le trigger `enforce_payment_requires_approved_proof` de `RLS_POLICIES.sql` garantit seulement la précondition, pas le déclenchement).
21. `/company/payments` : marquer prêt à payer / envoyé / payé / litige.
22. `/creator/payments` : lecture seule du statut.

*Critère de fin* : le statut de paiement suit fidèlement `not_due → pending_validation → ready_to_pay → payment_sent → paid`, jamais d'automatisation.

### Phase 7 — PWA et installation
23. `manifest.webmanifest`, icônes, service worker avec exclusions (voir `ARCHITECTURE.md` §5), page hors-ligne.
24. Test d'installation réel sur iPhone (Safari → Partager → Écran d'accueil) et Android (Chrome → Installer).

*Critère de fin* : l'application s'installe et se lance en mode standalone sur les deux plateformes.

### Phase 8 — Séparation Démo/Réel et données de démonstration
25. Résolution serveur du mode (organisation démo dédiée vs organisation pilote réelle), bannières obligatoires.
26. Exécution de `DEMO_SEED.sql`/`.ts` sur l'organisation démo uniquement.

*Critère de fin* : aucune donnée `is_demo=true` n'apparaît dans l'organisation pilote réelle, et inversement, sans bannière explicite.

## Hors MVP (backlog explicite, ne pas développer maintenant)
- Runbook multi-format (standard/WhatsApp/Notion), export CSV Admissions, seuils CPL/CPR configurables + garde-fou rebook, section Partenaires 13e dédiée, code magique email, notifications email réelles (modèles prêts, envoi Resend à câbler), résultats de campagne détaillés (agrégation `campaign_metrics`), gestion fine des permissions collaborateur au-delà d'Org Admin/Org Member basique, export/suppression RGPD self-service complet.

## Dépendances critiques entre phases
- Phase 2 doit être terminée avant Phase 4 (un profil non vérifié ne peut pas candidater — à faire respecter par une policy RLS `applications_insert_self` enrichie d'une condition `profile_status = 'verified'` si le produit le confirme).
- Phase 4 doit être terminée avant Phase 5 (pas de brief sans assignment).
- Phase 5 doit être terminée avant Phase 6 (le trigger de paiement dépend d'une preuve approuvée).

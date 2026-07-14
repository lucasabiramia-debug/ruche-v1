# LOVABLE_HANDOFF_PROMPT.md

Copie le bloc ci-dessous dans Lovable, en joignant les fichiers suivants (présents dans ce dépôt, branche `claude/ruche-fullstack-app-wplz8a`) :

1. `Ruche_EBS_V90_UX_Design_Final.html` (référence visuelle et fonctionnelle)
2. `PRODUCT_REQUIREMENTS.md`
3. `ARCHITECTURE.md`
4. `DATABASE_SCHEMA.sql`
5. `RLS_POLICIES.sql`
6. `STORAGE_POLICIES.sql`
7. `DEMO_SEED.sql`
8. `ROUTES_AND_PERMISSIONS.md`
9. `ACCEPTANCE_TESTS.md`
10. `AUDIT_V90.md` (contexte, notamment §6 sur les données sensibles à ne pas reproduire)
11. `MIGRATION_RISK_REGISTER.md`

---

## PROMPT À COLLER DANS LOVABLE

Tu es un lead developer full-stack senior, architecte SaaS, expert Supabase, sécurité, PWA et UX marketplace.

Je joins :
- `Ruche_EBS_V90_UX_Design_Final.html` : prototype fonctionnel avancé de Ruche × EBS, référence visuelle et fonctionnelle (design, parcours, ton, garde-fous métier) — **ne le remplace pas par une application générique**.
- Un dossier technique déjà produit par un audit complet du prototype (`AUDIT_V90.md`, `PRODUCT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.sql`, `RLS_POLICIES.sql`, `STORAGE_POLICIES.sql`, `DEMO_SEED.sql`, `ROUTES_AND_PERMISSIONS.md`, `ACCEPTANCE_TESTS.md`, `MIGRATION_RISK_REGISTER.md`).

**Utilise ces fichiers comme la source de vérité.** N'invente pas un schéma de base de données différent, n'invente pas de routes différentes, ne simplifie pas les garde-fous métier. Si un point n'est pas couvert par ces fichiers, pose la question plutôt que d'improviser une règle métier.

### Mission

Construis la vraie application Ruche : full-stack, multi-utilisateurs, connectée à Supabase, sécurisée par RLS, installable en PWA. Pas de landing page, pas de maquette, pas de bouton sans action backend réelle.

### Ce que l'audit a déjà tranché (ne pas rouvrir ces décisions sans le signaler)

- Stack : React + TypeScript strict + Tailwind + Supabase Auth/Postgres/Storage + React Query + React Hook Form + Zod + PWA. Voir `ARCHITECTURE.md`.
- Schéma de base : exactement les tables de `DATABASE_SCHEMA.sql` (profiles, organizations, organization_members, creator_profiles, creator_platforms, invitations, campaigns, missions, applications, assignments, briefs, proofs, payments, tracking_links, campaign_metrics, audit_logs, notifications, consent_logs).
- Sécurité : applique `RLS_POLICIES.sql` et `STORAGE_POLICIES.sql` tels quels (adapte la syntaxe si Lovable génère les migrations différemment, mais conserve l'intégralité des règles et des garde-fous qu'elles encodent — en particulier le trigger `enforce_payment_requires_approved_proof` et le verrou sur `profiles.role`).
- Routes et permissions : `ROUTES_AND_PERMISSIONS.md`.
- Ordre d'implémentation : `MVP_IMPLEMENTATION_PLAN.md` (phases 0 à 8). Construis dans cet ordre, ne saute pas de phase.
- Données de démonstration : importe `DEMO_SEED.sql` dans une organisation démo dédiée, jamais mélangée à l'organisation pilote réelle. **N'importe pas `VIP_PROSPECTS`** (12 personnalités publiques réelles listées dans le prototype comme cibles de prospection, pas comme utilisateurs — voir `AUDIT_V90.md` §6 et `MIGRATION_RISK_REGISTER.md` risque #1). **N'importe pas `PILOT_CONFIG`** (contact réel du pilote) dans un seed démo.

### Garde-fous métier non négociables (déjà actés et vérifiés dans le prototype, à préserver au même niveau d'exigence)

- Aucun ROI garanti, aucune acceptation automatique, aucun paiement automatique.
- Une preuve doit être `approved` avant qu'un paiement puisse passer à `ready_to_pay` ou `paid` — appliqué en base (trigger), pas seulement en UI.
- Bannière permanente "Données fictives — démonstration" sur toute donnée `is_demo=true`.
- Bannière "EXEMPLE FICTIF — AUCUN PARTENARIAT CONFIRMÉ" sur les partenaires locaux fictifs du 13e.
- Doctrine affichée mot pour mot : *"Une preuve conforme rend le paiement dû selon l'accord conclu. Aucun paiement n'est déclenché automatiquement par l'application."* et *"Les résultats observés ne garantissent pas les performances futures."*
- Le mode Démo/Réel n'est jamais déterminé par un paramètre d'URL — uniquement par l'organisation résolue côté serveur.
- Un créateur ne voit jamais un autre créateur, ses tarifs, ses preuves, ses paiements, ni aucune donnée Admissions.
- Stepper créateur à 6 étapes, libellés exacts : **Profil, Candidature, Acceptation, Création, Preuve, Paiement**, calculé dynamiquement depuis les données réelles (candidature/assignment/preuve/paiement), pas un champ stocké statiquement.

### Première livraison attendue (verticale complète, tous les boutons fonctionnels avec la base de données)

Reprends exactement la liste de `PRODUCT_REQUIREMENTS.md` §3 / `ACCEPTANCE_TESTS.md` Scénarios A et B : invitation → compte créateur → onboarding → validation profil → campagne → mission → candidature → acceptation → assignment → brief → preuve → validation/correction → suivi de paiement manuel → installation PWA.

### Méthode de travail

1. Confirme avoir lu l'intégralité des fichiers joints (pas seulement les premières lignes).
2. Applique les migrations Supabase (`DATABASE_SCHEMA.sql`, `RLS_POLICIES.sql`, `STORAGE_POLICIES.sql`).
3. Construis l'authentification et le routage protégé (`ROUTES_AND_PERMISSIONS.md`).
4. Implémente la verticale MVP dans l'ordre de `MVP_IMPLEMENTATION_PLAN.md`.
5. Importe les données démo (`DEMO_SEED.sql`, en complétant les profils créateurs avec de vrais comptes Supabase Auth de démonstration comme indiqué dans ce fichier).
6. Mets en place la PWA.
7. Vérifie chaque scénario de `ACCEPTANCE_TESTS.md` avant de déclarer une phase terminée.

### Livrables attendus en retour

- Lien de prévisualisation.
- Comptes de démonstration (ou procédure de création).
- Confirmation que les migrations et policies RLS sont bien celles fournies (ou diff expliqué si adapté).
- Liste des fonctionnalités réellement fonctionnelles vs restant à développer, au regard de `ACCEPTANCE_TESTS.md`.
- Procédure d'installation PWA (iPhone/Android).
- Procédure de bascule Démo → Réel (côté serveur, pas côté URL).

### Règle finale

Ne transforme pas Ruche en landing page marketing. Construis une véritable application métier multi-utilisateurs, sécurisée, connectée et installable, permettant dès le premier pilote d'inviter de vrais créateurs et de leur faire effectuer tout le parcours jusqu'au dépôt de preuve et au suivi de paiement.

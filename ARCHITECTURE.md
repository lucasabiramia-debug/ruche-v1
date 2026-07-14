# ARCHITECTURE.md — Ruche V1

## 1. Stack

- React + TypeScript strict
- Tailwind CSS + composants accessibles (Radix primitives recommandées pour dialog/focus trap — le prototype V90 n'a pas de focus trap vérifié, à construire proprement)
- React Router
- TanStack React Query (cache serveur, invalidation par mutation)
- React Hook Form + Zod (schémas partagés client/edge functions)
- Supabase (Auth, Postgres, Storage, Edge Functions)
- PWA : `vite-plugin-pwa` ou équivalent (manifest + service worker Workbox)

## 2. Structure de dossiers

```
src/
  app/                 # bootstrap, providers (QueryClient, AuthProvider, ThemeProvider), router racine
  layouts/             # PublicLayout, CompanyLayout, CreatorLayout (nav distincte par espace)
  pages/               # une page = une route, orchestration uniquement (pas de logique métier lourde)
    public/            # /, /connexion, /inscription, /devenir-createur, /invitation/[token]
    creator/           # onboarding, dashboard, missions, applications, proofs, payments
    company/           # dashboard, campaigns, creators, applications, proofs, payments, results, team, settings
  features/            # logique métier groupée par domaine, réutilisable entre pages
    auth/
    invitations/
    creator-profile/
    campaigns/
    missions/
    applications/
    assignments/
    briefs/
    proofs/
    payments/
    tracking/
    results/
    audit/
  components/          # UI générique réutilisable (Badge, StatusPill, Stepper, KpiCard, Modal...)
  hooks/                # hooks transverses (useSession, useRole, useIsDemoMode...)
  services/             # appels Supabase encapsulés (jamais d'appel Supabase direct dans un composant)
  lib/                  # utilitaires purs (formatage montant, dates, ratios anti-division-par-zéro)
  types/                # types générés depuis le schéma Supabase + types métier
  schemas/              # schémas Zod (un par formulaire / entité)
  integrations/supabase/  # client Supabase, types générés (`supabase gen types typescript`)
  demo/                 # données et bannières spécifiques au mode démo (jamais mélangées au code métier réel)
  tests/
public/
  manifest.webmanifest
  icons/
  offline.html
supabase/
  migrations/           # DATABASE_SCHEMA.sql découpé en migrations numérotées
  policies/              # RLS_POLICIES.sql, STORAGE_POLICIES.sql
  seed/                  # DEMO_SEED.sql
  functions/              # edge functions (invitation token, notifications email)
```

Règle : **aucun composant de page ne dépasse ~150 lignes** ; toute logique de calcul (stepper, KPI, ratios coût/lead) vit dans `features/*/logic.ts`, testée unitairement, à l'image de ce que `creatorJourneyData()` faisait dans le prototype (fonction pure, testée par assertions).

## 3. Flux de données

- Toute lecture passe par React Query + un hook `useXxx` dans `features/*/hooks.ts` qui appelle `services/*`.
- Toute écriture est une mutation React Query qui invalide les clés concernées puis déclenche un toast de confirmation (équivalent du `toast()` du prototype).
- Aucune règle de permission n'est appliquée uniquement côté client : chaque hook suppose que Supabase RLS refusera silencieusement ce qui n'est pas autorisé, et le rôle utilisateur ne sert qu'à *adapter l'affichage*, jamais à *sécuriser l'accès*.
- Le mode Démo/Réel est résolu côté serveur (colonne `organizations.is_demo_org` ou équivalent + `is_demo` sur les lignes), jamais par un paramètre d'URL lu côté client (contrairement au prototype V90 qui utilisait `?mode=`).

## 4. Authentification et routage protégé

- `AuthProvider` enveloppe l'app, expose `session`, `profile`, `role`, `organizationId`.
- `ProtectedRoute` par rôle : redirige vers `/connexion` si non authentifié, vers le tableau de bord adapté sinon (`/company/dashboard` ou `/creator/dashboard`) selon `profiles.role`.
- Les routes d'invitation (`/invitation/:token`) et de découverte créateur (`/devenir-createur`) sont publiques mais valident le jeton côté serveur (edge function ou requête RPC) avant d'autoriser la création de compte liée à une organisation.

## 5. PWA

- `manifest.webmanifest` : nom court "Ruche", couleur de thème bleu Ruche, icônes 192/512, `display: standalone`.
- Service worker : cache uniquement les assets statiques et les pages publiques ; exclusion explicite de `/creator/proofs`, `/company/proofs`, et de toute route Storage signée.
- Page hors-ligne minimaliste pour les routes non authentifiées.

## 6. Ce qui n'est PAS repris du prototype

- Le mécanisme `localStorage` + export/import JSON + "Sync Diff" (réconciliation manuelle de conflits) est remplacé intégralement par Postgres + `audit_logs`. Ne pas construire d'équivalent : c'était une solution à l'absence de backend, elle n'a plus de raison d'être.
- Le paramètre d'URL `?mode=pilote` est remplacé par une résolution serveur du mode (organisation réelle vs organisation démo), non falsifiable côté client.

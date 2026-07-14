# ROUTES_AND_PERMISSIONS.md — Ruche V1

Légende rôle : **Public** (non authentifié) · **Creator** · **Org Member** · **Org Admin** · **Super Admin**

## Routes publiques

| Route | Accès | Redirection si connecté |
|---|---|---|
| `/` | Public | Vers dashboard adapté au rôle si session active |
| `/connexion` | Public | Vers dashboard adapté au rôle |
| `/inscription` | Public | Vers dashboard adapté au rôle |
| `/devenir-createur` | Public | — (démarre l'onboarding même si déjà connecté en tant qu'autre rôle : cas d'un admin qui teste) |
| `/invitation/:token` | Public | Vérifie le jeton via `verify_invitation_token()` (RPC), affiche erreur si expiré/déjà utilisé/invalide, sinon crée le compte lié à l'organisation |
| `/mentions-legales`, `/confidentialite`, `/cgu` | Public | — |

## Routes Créateur (`role = creator`, profil obligatoire sauf onboarding)

| Route | Accès | Note |
|---|---|---|
| `/creator/onboarding` | Creator | Accessible tant que `creator_profiles.profile_status != 'verified'` |
| `/creator/dashboard` | Creator | Vue de synthèse : statut profil, missions, candidatures, preuves à déposer, paiements |
| `/creator/missions` | Creator | Missions `publication_status IN ('open','invitation_only')` uniquement, filtrées par éligibilité |
| `/creator/applications` | Creator | Ses propres candidatures uniquement (`creator_id = soi`) |
| `/creator/assignments/:id` | Creator | Brief + statut, uniquement si `assignments.creator_id = soi` |
| `/creator/proofs` | Creator | Dépôt/suivi de ses preuves uniquement |
| `/creator/payments` | Creator | Suivi lecture seule de ses paiements uniquement |
| `/settings` | Creator | Profil, consentement, export/suppression RGPD |

**Refus explicite** : un créateur qui tente `/company/*` ou l'ID d'un autre créateur dans une route dynamique reçoit un 403 applicatif — et surtout la requête Supabase sous-jacente échoue via RLS, pas seulement via un garde de routage React.

## Routes Entreprise (`role IN (organization_member, organization_admin, super_admin)`)

| Route | Accès minimum | Note |
|---|---|---|
| `/company/dashboard` | Org Member | Actions prioritaires filtrées par permissions du collaborateur |
| `/company/campaigns` | Org Member (lecture), Org Admin (écriture) | Création/publication réservée Org Admin |
| `/company/campaigns/:id` | Org Member | |
| `/company/creators` | Org Member | Catalogue créateurs de l'organisation (jamais tous les créateurs de la plateforme) |
| `/company/creators/:id` | Org Member | Fiche créateur, historique |
| `/company/creators/:id/verify` | Org Admin | Valider / demander correction / refuser — écrit dans `audit_logs` |
| `/company/applications` | Org Member | Vue par mission, accepter/refuser réservé aux permissions candidatures |
| `/company/proofs` | Org Member avec permission `proofs.review` | File de validation |
| `/company/payments` | Org Admin | Informations financières — accès restreint (voir §4 du prompt produit : "pas nécessairement accès aux informations bancaires" pour un collaborateur) |
| `/company/results` | Org Member | Lecture seule des métriques agrégées |
| `/company/team` | Org Admin | Gestion des collaborateurs, permissions, invitations internes |
| `/company/settings` | Org Admin | Paramètres organisation, bascule affichage Démo/Réel (jamais par URL, voir `ARCHITECTURE.md`) |
| `/company/invitations` | Org Admin | Inviter un créateur, suivre statut |

## Permissions collaborateur EBS (granularité `organization_members.permissions` jsonb)

Clés recommandées (booléens) : `campaigns.write`, `creators.verify`, `applications.review`, `proofs.review`, `payments.view`, `payments.write`, `team.manage`, `settings.manage`.

Un `organization_admin` a implicitement toutes les permissions. Un `organization_member` sans permission explicite a uniquement l'accès en lecture accordé par les policies RLS de base (campagnes, créateurs, candidatures, résultats) et aucun accès à `payments.write`, `team.manage`, `settings.manage` par défaut — conforme à l'exigence produit *"pas nécessairement accès aux paramètres sensibles / gestion des rôles / informations bancaires / suppression définitive"*.

## Gestion des sessions et jetons

- Session expirée → redirection `/connexion?redirect=<route d'origine>`.
- Invitation expirée/déjà acceptée/annulée → page dédiée avec message clair + CTA "Demander un nouveau lien" (ré-déclenche une notification à l'admin, ne recrée pas silencieusement une invitation).
- Un jeton d'invitation n'est jamais visible dans les logs applicatifs ni dans `audit_logs` en clair (seul `token_hash` existe en base, voir `RLS_POLICIES.sql`).

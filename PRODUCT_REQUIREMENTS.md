# PRODUCT_REQUIREMENTS.md — Ruche V1

Référence : voir `AUDIT_V90.md` pour la justification de chaque exigence par rapport au prototype `Ruche_EBS_V90_UX_Design_Final.html`.

## 1. Vision produit

Ruche est l'outil qui permet à EBS de transformer des créateurs de contenu, alumni, étudiants et commerces de proximité (quartier du 13e) en relais de campagnes marketing/admissions, avec un parcours entièrement traçable : profil vérifié → mission → candidature → acceptation humaine → brief → preuve → validation humaine → paiement suivi manuellement → résultats mesurés.

Principe non négociable hérité du prototype : **aucune automatisation ne remplace une décision humaine** sur l'acceptation d'une candidature, la validation d'une preuve, ou le déclenchement d'un paiement.

## 2. Utilisateurs cibles

- **Administrateur EBS/Ruche** : pilote l'ensemble (organisation admin).
- **Collaborateur EBS** : accès restreint par permission (organisation member).
- **Créateur / relais / partenaire local** : utilisateur externe invité ou auto-inscrit.

## 3. Périmètre fonctionnel V1 (MVP vertical, voir `MVP_IMPLEMENTATION_PLAN.md` pour l'ordre)

1. Authentification complète (inscription, connexion, confirmation email, mot de passe oublié, déconnexion, protection des routes).
2. Invitation créateur par lien à jeton unique, avec expiration.
3. Onboarding créateur en 6 étapes (Identité, Réseaux, Audience, Types de contenu, Tarifs indicatifs, Vérification/consentement).
4. Statuts de profil : `incomplete`, `pending_review`, `verified`, `changes_requested`, `rejected`.
5. Espace Entreprise : création de campagne, publication de mission.
6. Catalogue de missions filtrable côté créateur, candidature.
7. Vue Entreprise des candidatures par mission, acceptation/refus → création d'un `assignment`.
8. Brief accessible au créateur une fois affecté (mentions obligatoires/interdites, code/lien de tracking, droits d'usage).
9. Dépôt de preuve (lien, capture, fichier, statistiques, commentaire) avec limites de taille/format.
10. File de validation des preuves côté Entreprise : approuver / demander correction / refuser.
11. Suivi de paiement manuel (`not_due → pending_validation → ready_to_pay → payment_sent → paid`, plus `disputed`/`cancelled`), sans déclenchement automatique.
12. Résultats de campagne agrégés (vues, clics, leads, RDV, dossiers, inscrits) avec coûts dérivés (CPL, CPR, coût par dossier, coût par inscrit), protection division par zéro, disclaimer "ne garantit pas les performances futures".
13. Séparation stricte Démo/Réel (`is_demo`), bannières obligatoires sur toute donnée fictive, non contournable par paramètre d'URL côté client.
14. PWA installable (manifest, service worker, icônes, page hors ligne pour l'interface publique uniquement).

## 4. Fonctionnalités héritées du prototype à préserver explicitement

- Stepper créateur 6 étapes calculé dynamiquement (Profil, Candidature, Acceptation, Création, Preuve, Paiement) — libellés exacts contractuels (voir tests V90 ligne 1067 de l'audit).
- Doctrine affichée : *"Une preuve conforme rend le paiement dû selon l'accord conclu. Aucun paiement n'est déclenché automatiquement par l'application."*
- Doctrine résultats : *"Les résultats observés ne garantissent pas les performances futures."*
- Bandeau obligatoire sur toute donnée de démonstration : *"Données fictives — démonstration"*.
- Bandeau obligatoire sur les partenaires locaux fictifs : *"EXEMPLE FICTIF — AUCUN PARTENARIAT CONFIRMÉ"*.
- Garde-fou rebook : une décision "réactiver" un créateur dont le CPL/CPR dépasse le seuil configuré exige une justification textuelle explicite avant d'être enregistrée.
- Anti-fabrication de lien : aucun lien ou code de tracking public généré tant que la configuration réelle (organisation) n'est pas renseignée.
- Section "Partenaires vidéo du 13e" comme fonctionnalité produit distincte (parcours en 7 étapes propre aux partenaires commerce/lieu), pas un simple sous-cas des créateurs.

## 5. Fonctionnalités explicitement hors périmètre V1

- Paiement automatique / intégration bancaire.
- Acceptation automatique de candidature.
- Synchronisation HubSpot.
- Récupération automatisée de données Instagram/TikTok (scraping ou API officielle) — les statistiques sont déclarées et prouvées par capture, pas collectées automatiquement.
- Publication native App Store / Google Play (prévu pour plus tard via Capacitor, l'architecture doit le permettre sans réécriture).
- Code magique par email (prévu en V1.1, l'architecture Supabase Auth le permet nativement).

## 6. Exigences non fonctionnelles

- Sécurité : RLS Postgres réelle, jamais de permission simulée uniquement côté client (voir `RLS_POLICIES.sql`).
- RGPD : consentement explicite horodaté, export/suppression de données personnelles, journal des consentements, non-exposition des données Admissions aux créateurs.
- Accessibilité : AA, cibles tactiles 44px, focus visible, `aria-live`, focus trap modal, Échap, `prefers-reduced-motion`.
- Responsive : 320/375/390/448/768/1280px, aucun débordement horizontal.
- PWA : installable iOS (Partager → Écran d'accueil) et Android/Chrome (Installer l'application), aucun cache hors-ligne de fichier privé ou preuve sensible.

## 7. Critères d'acceptation de la première livraison

Voir `ACCEPTANCE_TESTS.md` — scénario bout-en-bout administrateur et créateur, correspondant point par point à la section 20 du prompt produit d'origine.

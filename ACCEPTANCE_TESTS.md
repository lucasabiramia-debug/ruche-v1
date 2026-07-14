# ACCEPTANCE_TESTS.md — Ruche V1

Checklist de recette manuelle correspondant à `MVP_IMPLEMENTATION_PLAN.md`. Chaque étape doit être vérifiée avec de vrais comptes (pas de mocks), en observant à la fois l'interface ET les données en base (Supabase Table Editor) pour confirmer qu'aucune action n'est "seulement visuelle".

## Scénario A — Parcours Administrateur

1. [ ] Connexion admin sur `/connexion` avec un compte `organization_admin` réel.
2. [ ] `/company/invitations` : créer une invitation créateur (email réel de test), copier le lien généré.
3. [ ] Vérifier en base : `invitations.status = 'created'`, `token_hash` renseigné, `token` brut absent de la table.
4. [ ] Après ouverture du lien par le créateur (Scénario B, étapes 1-2) : `invitations.status` passe à `opened` puis `accepted`.
5. [ ] Une fois le profil créateur soumis (Scénario B, étape 6) : voir le profil apparaître dans `/company/creators` avec `profile_status = pending_review`.
6. [ ] Valider le profil depuis `/company/creators/:id/verify` avec une note. Vérifier : `creator_profiles.profile_status = 'verified'`, une ligne ajoutée dans `audit_logs` (`action = 'profile_verified'` ou équivalent).
7. [ ] Créer une campagne dans `/company/campaigns`, la publier (`status = active`).
8. [ ] Publier une mission rattachée (`publication_status = open`).
9. [ ] Après candidature du créateur (Scénario B, étape 9) : la candidature apparaît dans `/company/applications`, filtrable par mission.
10. [ ] Accepter la candidature. Vérifier : `applications.status = accepted`, une ligne créée dans `assignments` avec le bon `creator_id`/`mission_id`.
11. [ ] Rédiger et publier le brief (`briefs.validation_status = published`) — mentions obligatoires/interdites, code de tracking renseignés.
12. [ ] Après dépôt de preuve (Scénario B, étape 12) : la preuve apparaît dans `/company/proofs` en attente.
13. [ ] Tester le chemin "demander une correction" : `proofs.status = correction_requested`, `reviewer_comment` rempli, la preuve redevient éditable côté créateur (vérifier Scénario B étape 13).
14. [ ] Approuver la preuve corrigée : `proofs.status = approved`.
15. [ ] Vérifier que la ligne `payments` correspondante passe (manuellement, pas automatiquement) à `ready_to_pay`, puis `payment_sent`, puis `paid`, avec `payment_reference` obligatoire pour passer à `paid` (contrainte SQL `chk_payment_paid_requires_reference`).
16. [ ] Tenter de faire passer un paiement à `ready_to_pay` sans preuve approuvée (via un autre assignment) : la mutation doit échouer (trigger `enforce_payment_requires_approved_proof`).
17. [ ] Vérifier qu'un `organization_member` sans permission `payments.write` ne peut pas modifier `/company/payments` (bouton désactivé ET requête Supabase rejetée si forcée depuis la console réseau).

## Scénario B — Parcours Créateur

1. [ ] Ouvrir le lien d'invitation `/invitation/:token` reçu.
2. [ ] Vérifier que le jeton expiré ou déjà utilisé affiche un message clair (tester avec un jeton expiré factice) sans révéler d'information sur d'autres invitations.
3. [ ] Créer le compte (email pré-rempli depuis l'invitation, mot de passe).
4. [ ] Confirmer l'adresse email (lien reçu réellement, pas simulé).
5. [ ] Suivre les 6 étapes d'onboarding : Identité, Réseaux, Audience, Types de contenu, Tarifs indicatifs (vérifier l'affichage du disclaimer *"Ces informations sont indicatives..."*), Vérification/consentement (case à cocher obligatoire, upload d'une capture de statistiques).
6. [ ] Soumettre le profil → message *"Profil envoyé pour validation"*, statut affiché `En cours de vérification`.
7. [ ] Vérifier qu'aucune mission n'est visible dans `/creator/missions` tant que le profil n'est pas `verified` (si cette règle est confirmée par le produit — sinon documenter l'écart).
8. [ ] Après validation admin (Scénario A, étape 6) : statut affiché passe à `Profil validé`, notification reçue.
9. [ ] Ouvrir `/creator/missions`, filtrer, candidater à une mission avec message et format proposés. Vérifier le message *"Votre candidature a été transmise. Aucune mission n'est acceptée automatiquement."*
10. [ ] Vérifier qu'une seconde candidature à la même mission est bloquée (contrainte unique `applications(mission_id, creator_id)`).
11. [ ] Après acceptation admin (Scénario A, étape 10) : la mission apparaît dans les "missions acceptées" avec le brief complet (mentions obligatoires/interdites, lien/code de tracking, droits d'usage).
12. [ ] Déposer une preuve (`/creator/proofs`) : tester chaque type (lien Instagram/TikTok/LinkedIn/YouTube, capture, vidéo, image, PDF, commentaire) et vérifier le rejet d'un fichier hors format/taille autorisés.
13. [ ] Recevoir une demande de correction (Scénario A, étape 13) : le formulaire de preuve redevient modifiable, historique de l'échange conservé.
14. [ ] Re-soumettre la preuve corrigée.
15. [ ] Suivre `/creator/payments` : le statut affiché correspond exactement à celui mis à jour côté admin, avec la doctrine affichée *"Une preuve conforme rend le paiement dû selon l'accord conclu. Aucun paiement n'est déclenché automatiquement par l'application."*
16. [ ] Vérifier qu'à aucun moment le créateur ne peut voir un autre créateur, ses tarifs, ses preuves ou ses paiements (tenter d'accéder à l'URL d'un autre `assignment_id`/`creator_id` connu → doit échouer via RLS, pas juste être caché par l'UI).

## Scénario C — Stepper créateur (fidélité au prototype V90)

1. [ ] Aucun profil → stepper affiche "Profil" comme étape courante.
2. [ ] Profil créé, aucune candidature → "Candidature".
3. [ ] Candidature envoyée, non acceptée → "Acceptation".
4. [ ] Mission acceptée, aucune preuve → "Création".
5. [ ] Preuve soumise, non validée → "Preuve".
6. [ ] Preuve validée, paiement non soldé → "Paiement".
7. [ ] Preuve validée + paiement soldé (`paid`) → parcours marqué terminé.
8. [ ] Les 6 libellés exacts **Profil, Candidature, Acceptation, Création, Preuve, Paiement** sont présents et l'étape active porte `aria-current="step"`.

## Scénario D — Démo / Réel

1. [ ] Se connecter sur l'organisation de démonstration : bannière *"Données fictives — démonstration"* visible en permanence.
2. [ ] Les 4 partenaires locaux 13e affichent le bandeau *"EXEMPLE FICTIF — AUCUN PARTENARIAT CONFIRMÉ"*.
3. [ ] Modifier manuellement `?mode=pilote` ou tout paramètre d'URL équivalent en étant connecté sur l'organisation démo : aucune donnée réelle d'une autre organisation ne doit apparaître (le mode n'est pas piloté par l'URL, voir `ARCHITECTURE.md`).
4. [ ] Se connecter sur l'organisation pilote réelle : aucune campagne, profil ou résultat fictif visible, aucune bannière démo affichée.
5. [ ] Vérifier qu'aucun KPI n'agrège des lignes `is_demo=true` avec des lignes réelles.

## Scénario E — PWA

1. [ ] iPhone Safari : bannière/aide *"Partager → Sur l'écran d'accueil"*, installation réussie, lancement en mode standalone.
2. [ ] Android Chrome : proposition *"Installer l'application"*, installation réussie.
3. [ ] Mode hors-ligne : la page publique et le shell applicatif s'affichent avec un message clair ; `/creator/proofs` et `/company/proofs` ne sont pas mis en cache et affichent un message de reconnexion requise.

## Scénario F — Accessibilité et responsive (largeurs de test : 320/375/390/448/768/1280px)

1. [ ] Aucun débordement horizontal à aucune largeur.
2. [ ] Toutes les cibles tactiles ≥ 44px.
3. [ ] Navigation complète au clavier (tab order logique, focus visible).
4. [ ] Modales : focus trap actif, fermeture par Échap, focus restitué à l'élément déclencheur à la fermeture.
5. [ ] Messages d'erreur de formulaire associés via `aria-describedby`, annoncés via `aria-live="polite"`.
6. [ ] Contraste texte/fond ≥ AA sur tous les badges de statut (vert/orange/rouge/violet).
7. [ ] `prefers-reduced-motion` respecté (pas d'animation forcée).

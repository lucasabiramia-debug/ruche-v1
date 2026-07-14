# AUDIT_V90.md — Audit technique du prototype `Ruche_EBS_V90_UX_Design_Final.html`

Fichier audité : `Ruche_EBS_V90_UX_Design_Final.html` (1082 lignes, ~343 Ko, HTML/CSS/JS dans un seul fichier, aucune dépendance externe, aucun build).
Le fichier s'auto-décrit `VERSION='90'` et embarque une suite de tests (`runSelfTests`, ~100+ assertions) qui documente elle-même le comportement attendu — c'est la source de vérité la plus fiable pour ce qui doit être préservé.

## 1. Vue d'ensemble architecturale du prototype

- **Rendu** : SPA "vanilla JS" — un objet `state` global, un objet `store` (miroir de `localStorage`), une fonction `render()` qui régénère le DOM via template strings (pas de framework, pas de virtual DOM).
- **Persistance** : 100 % `localStorage`, avec :
  - clés préfixées par version (`ruche_v85_*`, migrations `LEGACY_STORAGE` pour compat ascendante) ;
  - séparation stricte des clés par mode (`storageKeyFor` suffixe `_demo` en mode démo) ;
  - un verrou de migration (`ruche_v80_storage_gc_lock`) et un canal `BroadcastChannel` (`STORAGE_GC_CHANNEL`) pour éviter les écritures concurrentes multi-onglets ;
  - gestion de quota dépassé (`isQuotaError`) avec téléchargement automatique d'un rollback JSON de secours (`triggerSafetyRollbackDownload`).
- **Deux espaces applicatifs** dans la même page : `entreprise` (pilotage EBS) et `createur` (auto-service créateur/partenaire), commutables via `switchSpace()`.
- **Deux modes de données** : `demo` (données fictives, activé par défaut) et `pilote` (données réelles, initialement vide), commutés par `?mode=pilote|demo` dans l'URL (`getDataMode()`/`setDataMode()`).
- **Aucun backend, aucune authentification, aucun multi-utilisateur réel** : tout est local à l'appareil/navigateur. C'est la limite structurelle centrale que la migration doit lever.

## 2. Inventaire des données embarquées (constantes JS, lignes indiquées)

| Constante | Lignes | Contenu | Nature |
|---|---|---|---|
| `CONTACTS` | 163–202 | 37 profils : 33 profils historiques (créateurs, alumni, relais, BDE, "Office Admissions 505") + 4 "partenaires locaux 13e" explicitement fictifs (`localPartnerDemo:true`) | Démo, à seeder avec `is_demo=true` |
| `CAMPAIGNS` | 203–213 | 7 campagnes historiques : Liban, Italie, JPO 1107, LinkedIn Alumni, Bachelor BD, Bibliothèque UGC, Partenaires vidéo 13e | Démo |
| `PILOT_CAMPAIGNS` | 214 | 1 campagne pilote réelle : `pilot-jpo-ebs-2026` | Pilote/réel — **ne pas marquer is_demo** |
| `PERF` | 215–239 | Résultats (cost/views/clicks/leads/rdv/dossiers/inscrits/assets/paid/decision) par `campaignId:personId`, uniquement pour les 4 campagnes historiques actives | Démo, entièrement fictif |
| `DEMO_CREATOR_IDS` | 240 | 5 personas de démonstration (nina, emma, marc, lea, local_culture_13) | Démo |
| `DEMO_IDEAS` | 241–250 | 8 idées de contenu prêtes à l'emploi (bibliothèque d'inspiration) | Contenu produit, réutilisable tel quel (pas des données utilisateur) |
| `VIP_PROSPECTS` | 251–264 | 12 personnalités **réelles et identifiables** (Yomi Denzel, Stan Leloup, Pauline Laigneau, Anthony Bourbon, HugoDécrypte, Tibo InShape, Ali Abdaal, Steven Bartlett, Gary Vaynerchuk, Micode, Le Crayon, Le Grand Bain) marquées `contact:'À rechercher'` | **Sensible — voir §6** |
| `AGENCY_PROSPECTS` | 265–277 | 10 agences/réseaux prospects, statut "à sourcer" | Prospection, non confirmé |
| `PILOT_CONFIG` | 281 | Config réelle du pilote : nom, contact (`Lucas Abiramia`, email réel), WhatsApp, URL de tracking, webhook — **tout est vide sauf identité du contact** | **Donnée réelle, pas une donnée de démo** |
| `MARKET_GEO` / `PROFILE_GEO` | 800–856 | Coordonnées géographiques pour affichage carte, par marché et par profil | Démo, dérivable |
| `MIX_CHAIN` | 857 | `['Attirer','Rassurer','Montrer','Diffuser','Convertir']` — vocabulaire du funnel marketing utilisé dans l'UI | Constante produit |

La suite de tests confirme ces volumes exacts (ligne 925) :
`33 profils historiques préservés`, `4 partenaires locaux fictifs`, `6 campagnes historiques préservées`, `campagne vidéo 13e ajoutée`, `12 VIP`, `10 agences`.

## 3. Modèle de données fonctionnel (dérivé du code, pas seulement des constantes)

Le prototype ne stocke pas d'entités "candidature", "assignment", "preuve", "paiement" comme des tables séparées : il calcule des **statuts dérivés** à partir de peu de structures de state, stockées comme dictionnaires clé→valeur dans `store` (`STORE_KEYS`, ligne 308) :

| Clé `store` | Rôle | Équivalent cible V1 |
|---|---|---|
| `customCampaigns` | Campagnes créées localement (hors démo) | `campaigns` |
| `additions` | Ajout manuel de créateurs à une campagne (`campaignId -> [personId]`) | jonction `campaigns_creators` / `assignments` |
| `inboundApplications` | Candidatures reçues (`campaignId -> [{id, personId, status, receivedAt, note, ...}]`), statuts `new/shortlisted/accepted/declined` | `applications` |
| `inboundBriefs` | Brief par campagne (`status: draft/open/paused`, `note`) | `briefs` |
| `proofStates` | Statut de preuve par `campaignId:personId` (`missing/received/validated`), avec calcul par défaut si non renseigné (`inferredProof`) | `proofs.status` |
| `paymentStates` | Statut de paiement par `campaignId:personId` (`blocked/none/due/paid/internal/litige`), calcul par défaut (`defaultPayment`) dépendant de la preuve | `payments.status` |
| `creatorDecisions` | Décision de rebook par `campaignId:personId` (`pending/rebook/test/stop`), avec **garde-fou obligatoire** : un rebook sur CPL/CPR au-dessus du seuil exige une justification texte (≥12 caractères) avant d'être enregistré (`confirmRebookJustification`, ligne 488) | Champ `assignments.rebook_decision` + `assignments.rebook_justification` |
| `counters` | Compteurs Admissions saisis manuellement (leads/rdv/dossiers/inscrits) qui **priment** sur les valeurs attribuées automatiquement (`totals()`, ligne 445 : `sourceOf` distingue `admissions` vs `attributed` vs `none`) | `campaign_metrics` avec champ `source` |
| `statusOverrides` | Override manuel du statut de campagne (Brouillon/Programmée/En cours/Terminée/Actif permanent) | `campaigns.status` |
| `externalCreators` | Profils créateurs auto-inscrits (id `ext-...`), avec consentement, contact, offre locale | `creator_profiles` (réel) |
| `settings.performance` | Seuils d'alerte CPL/CPR configurables (défaut 25€/80€) | `organizations.settings` ou table de config |
| `rebookJustifications` | Texte de justification obligatoire pour un rebook risqué | voir plus haut |
| `missionVisibility` | Visibilité de mission (`privee/invitation/ouverte`) | `missions.publication_status` / `eligibility_rules` |
| `pipeline` | (présent dans les clés mais peu utilisé dans les extraits examinés — CRM léger) | à investiguer avant migration, ne pas perdre silencieusement |

**Point d'architecture important** : les preuves, paiements et décisions ne sont PAS liés à une "candidature acceptée" explicite dans le modèle actuel — ils sont indexés par la paire `(campaignId, personId)`. Cela fonctionne dans un prototype mono-utilisateur mais **ne supporte pas** qu'un créateur postule deux fois à la même campagne avec des issues différentes, ni qu'une même personne ait deux missions actives dans une campagne. La V1 doit introduire une vraie table `assignments` avec sa propre clé primaire (déjà prévu dans le prompt produit) — c'est un vrai gain, pas une régression.

## 4. Parcours créateur en 6 étapes (à préserver à l'identique)

`creatorJourneyData()` (ligne 536) calcule dynamiquement une étape courante (`current` 0–5) à partir des données réelles, jamais d'un champ stocké :

1. **Profil** (`current=0/1`) — pas de profil actif → "Créez votre profil"
2. **Candidature** (`current=1/2`) — profil créé, aucune candidature vivante → "Choisissez une mission"
3. **Acceptation** (`current=2`) — candidature envoyée, pas encore acceptée → "Validation humaine en attente"
4. **Création** (`current=3`) — mission acceptée, aucune preuve déposée → "Création du livrable"
5. **Preuve** (`current=4`) — preuve reçue mais pas validée → "Preuve à faire valider"
6. **Paiement** (`current=5`) — preuve validée, paiement pas encore soldé → "Paiement selon accord" ; tout soldé → "Parcours terminé" (`finished:true`)

Le HTML du stepper (`creatorJourneyHtml`) inclut `aria-current` — accessibilité déjà présente, à conserver. Un test dédié vérifie la présence des 6 libellés exacts (ligne 1067) : **Profil, Candidature, Acceptation, Création, Preuve, Paiement**. Ces libellés sont donc contractuels, pas décoratifs.

## 5. Fonctionnalités par domaine (inventaire large)

### 5.1 Espace Entreprise
- Tableau de bord avec KPI compacts (`homeKpiSummary`), file d'actions prioritaires (`actionCounts`, `priorityActions`) : candidatures entrantes, preuves manquantes, paiements dus, décisions en attente.
- Wizard de création de campagne en 3 étapes : **Besoin → Créateurs → Vérification** (`wizardView`, ligne 739). Ne pas confondre avec le stepper créateur à 6 étapes.
- Détail de campagne : funnel (`campaignFunnelHtml`), répartition par canal (`campaignChannelBreakdownHtml`), panneau stratégie (`campaignStrategyPanel`), "signal strip" avec garde-fou anti-invention (`campaignSignalStrip` affiche *"Test non lancé ou résultats non renseignés — aucune performance inventée"* si tout est à zéro).
- Génération de **runbook** en 3 formats (standard, WhatsApp/Signal, Notion) — `buildRunbook`/`buildWhatsAppRunbook`/`buildNotionRunbook` (lignes 627–704) : plan d'action texte prêt à copier, avec rappel de doctrine ("paiement dû dès preuve livrée", "aucun ROI promis").
- **Export CSV Admissions** (`exportAdmissionsCsv`, `csvEscape`) pour usage J+30.
- **Sauvegarde/restauration JSON** avec réconciliation intelligente ("Sync Diff") : `buildSyncPreview`, `buildMergedSnapshotFromPreview` — détecte ajouts sans conflit vs conflits nécessitant un arbitrage utilisateur (garder local / garder importé / garder les deux via fork de campagne), avec **rollback automatique téléchargé avant toute fusion**. C'est une fonctionnalité de robustesse non triviale à ne pas perdre silencieusement (même si son équivalent en V1 change de nature : Postgres remplace le besoin d'un import JSON manuel).
- Registres profils cloisonnés en 4 onglets : Créateurs / Partenaires 13e / VIP / Agences (`profilesView`).
- Réglages de seuils de performance CPL/CPR (`performanceSettingsPanel`).
- Guide de démo oral intégré en 6 étapes pour présentation commerciale (`demoGuidePanel`) — contenu produit, pas une fonctionnalité applicative à migrer en l'état, mais à conserver comme script de démo/onboarding commercial.

### 5.2 Espace Créateur
- Onboarding auto-service : formulaire unique (pas un multi-étapes façon wizard dans le prototype — c'est un long formulaire à un seul écran, `creatorProfileFormHtml`) couvrant identité, réseaux, audience, tarifs indicatifs, droits d'usage, consentement. **La V1 doit le découper en étapes** (le prompt produit le demande, c'est une amélioration UX assumée, pas une reproduction à l'identique).
- Auto-inscription "partenaire local 13e" avec formulaire pré-rempli contextuel (`startLocalPartnerOnboarding`).
- Catalogue de missions filtrable (`creatorMissionsView`, `openMissions`), candidature via feuille modale (`missionApplySheet`, `submitCandidature`) avec anti-doublon ("vous avez déjà candidaté").
- Suivi de candidatures (`creatorApplicationsView`), avec récapitulatif copiable et partage WhatsApp direct (`candidatureRecapText`, `copyCandidatureRecap`, `shareCandidatureWhatsApp`).
- 4 "personas démo" activables sans création de compte pour explorer le parcours créateur (`creatorDemoChooser`, `DEMO_CREATOR_IDS`).

### 5.3 Partenaires vidéo du 13e (fonctionnalité produit spécifique, pas générique)
- Section dédiée `localPartnersView` avec :
  - bandeau **"EXEMPLE FICTIF — AUCUN PARTENARIAT CONFIRMÉ"** systématiquement affiché sur les 4 profils fictifs (`localPartnerCard`, ligne 591) ;
  - parcours partenaire en 7 étapes affiché (Profil du lieu → Concept vidéo → Validation humaine → Tournage/QR → Preuve conforme → Paiement ou contrepartie → Analyse & rebook) — **distinct** du stepper créateur à 6 étapes, à ne pas fusionner par erreur ;
  - séparation stricte démo/pilote : en mode pilote, seuls les partenaires réels enregistrés via `pilotLocalPartnerProfiles()` (filtrés par mots-clés commerce/lieu + zone 13e/75013) sont affichés, jamais les 4 fictifs.

### 5.4 Garde-fous métier déjà implémentés dans le code (pas seulement dans la doctrine texte)
- Aucun paiement ne passe à `due` sans preuve `validated` (`setPayment`, ligne 455 : *"Validez d'abord la preuve"*).
- Un rebook sur métriques dégradées (CPL/CPR au-dessus des seuils) est bloqué tant qu'une justification écrite n'est pas fournie (`needsRebookJustification`, `confirmRebookJustification`).
- Aucune URL de tracking ni lien type `ebs.re/...` n'est généré tant que `PILOT_CONFIG.publicTrackingUrl` est vide — vérifié explicitement par un self-test (ligne 956) qui interdit tout domaine inventé ou placeholder copiable.
- Consentement de contact obligatoire (`cf_consent`) avant tout enregistrement de profil créateur, avec mention explicite que rien n'est transmis automatiquement à EBS.
- Import de sauvegarde : validation stricte de schéma (whitelist de 17 versions de schéma acceptées), sanitation champ par champ avec troncature de longueur (anti-XSS/anti-overflow), rejet des statuts hors énumération connue.

## 6. Points sensibles / à ne pas reproduire tels quels dans la V1

1. **`VIP_PROSPECTS`** contient les noms, thèmes et audiences de 12 personnalités publiques réelles présentées comme cibles de prospection ("contact : à rechercher"). Ce ne sont ni des utilisateurs, ni des partenaires, ni du contenu à seeder dans une base "démo créateurs" — les y mettre créerait un risque de confusion (on pourrait croire qu'ils sont inscrits sur la plateforme) et un risque d'image si ces données fuitaient. **Recommandation : ne pas importer `VIP_PROSPECTS` dans le seed applicatif** ; le garder, si besoin, comme document interne (liste de prospection commerciale) hors base de données produit.
2. **`PILOT_CONFIG`** contient une vraie adresse email (`lucasabiramia@gmail.com`). Ce n'est pas une donnée de démo — elle ne doit pas être committée dans un seed "démo" marqué `is_demo=true` et rejouable/partageable ; elle doit vivre dans la config d'organisation réelle (table `organizations`/`organization_members`), pas dans un script de seed versionné en clair si le dépôt devient plus largement partagé.
3. **Mode réel activable par paramètre d'URL** (`?mode=pilote`) : dans le prototype c'est un choix d'affichage local sans conséquence de sécurité (tout est dans le même `localStorage` du même navigateur). En V1 multi-utilisateurs, un paramètre d'URL ne doit **jamais** déterminer l'accès aux données réelles — ce doit être un attribut serveur (organisation/rôle) contrôlé par RLS.
4. **Aucune authentification, aucune notion d'utilisateur** dans le prototype — toute la logique de rôle (Entreprise vs Créateur) est un simple *espace d'affichage* choisi localement, pas une permission. Toute la couche sécurité de la V1 est donc à construire from scratch ; le prototype ne fournit aucune brique réutilisable ici, seulement les règles métier *à qui montrer quoi*.
5. **Preuves/paiements par paire (campagne, personne)** plutôt que par candidature/assignment : voir §3, à corriger consciemment dans le schéma cible.
6. **`localStorage` comme unique état** : tout ce qui est "backup export/import/sync diff" perd son sens une fois qu'on a Postgres — ne pas essayer de porter le mécanisme de fusion JSON tel quel ; le remplacer par les garanties transactionnelles de la base et un vrai journal d'audit.

## 7. Accessibilité déjà présente (à conserver comme niveau plancher)
- `aria-current` sur l'étape active du stepper créateur.
- `aria-controls`/`role="tab"`/`aria-selected` sur le switch Entreprise/Créateur (`renderSpaceSwitch`, ligne 507).
- Échappement systématique des données affichées (`esc()`, ligne 409) — bonne hygiène anti-XSS déjà en place pour du contenu utilisateur affiché en HTML.
- Modales avec structure de dialogue (`dialogShell`) — à vérifier lors de la migration que le focus trap et Échap sont bien câblés (non confirmé dans les extraits audités, à re-vérifier avant de cocher "acquis").

## 8. Suite de tests intégrée (`runSelfTests`, lignes 924–1080)
Environ 60+ assertions couvrant : volumétrie des données démo, présence des fonctions clés, invariants du stepper créateur, absence de faux domaines/placeholders, disponibilité de l'export CSV, presence de l'onglet partenaires 13e, etc. Cette suite s'exécute dans le navigateur (`window.__RUCHE_SELF_TESTS__`), restaure l'état avant/après (`snapshotStore`/`persistSnapshot`) pour ne pas polluer les données réelles pendant le test. **Recommandation** : transformer ces assertions en cas de tests explicites dans `ACCEPTANCE_TESTS.md` et en tests unitaires Vitest/Playwright de la V1 — elles constituent une spécification comportementale gratuite.

## 9. Fonctionnalités à prioriser MVP vs différer

| Fonctionnalité | Priorité | Risque de régression si oubliée |
|---|---|---|
| Stepper créateur 6 étapes calculé dynamiquement | MVP | Élevé — c'est l'identité produit |
| Invitation → onboarding → validation profil | MVP | Élevé |
| Campagne → mission → candidature → acceptation → brief | MVP | Élevé |
| Preuve → validation/correction → paiement (suivi manuel) | MVP | Élevé |
| Garde-fou "preuve validée avant paiement dû" | MVP | Élevé (garde-fou métier explicite) |
| Séparation Démo/Réel avec bannières fictives | MVP | Élevé (obligation légale/éthique déjà actée par le prototype) |
| Runbook (standard/WhatsApp/Notion) | Post-MVP | Faible — confort opérationnel |
| Export CSV Admissions | Post-MVP proche | Moyen — utile dès le pilote réel |
| Sync Diff / import JSON | Ne pas porter | Nul — remplacé par Postgres |
| Guide de démo oral intégré | Post-MVP (contenu) | Nul — support commercial |
| Partenaires 13e (parcours dédié 7 étapes) | Post-MVP proche | Moyen — mentionné explicitement comme fonctionnalité produit différenciante |
| VIP/Agences (registres de prospection) | Différé, hors base produit | Voir §6 — à traiter comme donnée interne, pas comme feature applicative |
| Seuils CPL/CPR configurables + garde-fou rebook justifié | Post-MVP proche | Moyen — logique métier déjà mature à réutiliser telle quelle |

-- ============================================================================
-- Ruche V1 — DEMO_SEED.sql
-- Importe les données de démonstration issues de Ruche_EBS_V90_UX_Design_Final.html
-- (voir AUDIT_V90.md §2 pour la correspondance exacte avec les constantes JS).
--
-- Règles suivies (voir AUDIT_V90.md §6) :
--   * Tout est marqué is_demo = true.
--   * VIP_PROSPECTS n'est PAS importé dans le produit : ce sont des personnalités
--     publiques réelles listées comme cibles de prospection commerciale, pas des
--     utilisateurs Ruche. Les y faire figurer créerait une confusion "ils sont
--     inscrits" — ce fichier ne les inclut donc pas. La liste reste disponible
--     comme document interne hors base de données (voir MIGRATION_RISK_REGISTER.md).
--   * PILOT_CONFIG (contact réel du pilote) n'est PAS un seed démo : il doit
--     être saisi manuellement dans l'organisation réelle, pas committé ici.
--   * Les 4 partenaires locaux 13e gardent leur mention "profil fictif" /
--     "aucun partenariat confirmé" dans leur bio, pour que la bannière produit
--     s'appuie sur une donnée honnête même si le flag is_demo était omis par erreur.
-- ============================================================================

do $$
declare
  v_org_id uuid;
  v_admin_user_id uuid;
begin
  -- Organisation de démonstration dédiée (jamais la même organization_id que
  -- le pilote réel EBS — is_demo=true est une commodité d'affichage, pas la
  -- seule barrière : l'isolation réelle vient de l'organisation elle-même).
  insert into organizations (id, name, slug, organization_type, is_demo)
  values (gen_random_uuid(), 'EBS — Démonstration Ruche', 'ebs-demo', 'company', true)
  returning id into v_org_id;

  -- ------------------------------------------------------------------------
  -- Créateurs de démonstration (issus de CONTACTS, hors 'office' qui est un
  -- pseudo-contact interne Admissions et non un créateur).
  -- Un profil auth.users réel est requis par la FK ; en pratique ce script
  -- est destiné à être rejoué après création de comptes de démo via
  -- Supabase Auth Admin API (voir MVP_IMPLEMENTATION_PLAN.md). Les inserts
  -- ci-dessous supposent des user_id déjà créés et passés en paramètre, ou
  -- adaptés pour utiliser `auth.admin.createUser` en amont dans un script
  -- Node/TS équivalent (DEMO_SEED.ts recommandé en pratique pour ce couplage
  -- avec Supabase Auth — ce .sql couvre la partie purement relationnelle).
  --
  -- Échantillon représentatif (5 des 33 profils historiques, à compléter en
  -- reprenant l'inventaire complet de AUDIT_V90.md §2 / CONTACTS lignes 163-202) :
  --   ines   — Inès Parcoursup Live (TikTok, lycéens, France)
  --   omar   — Omar BTS Alternance (Instagram, étudiants, France)
  --   nina   — Nina Orientation (persona démo créateur)
  --   emma   — Emma Campus (persona démo créateur)
  --   marc   — Marc Alumni Finance (persona démo créateur)
  --   lea    — Léa UGC Étudiante (persona démo créateur)
  --   claire — Claire Alumni Marketing
  --   bilal  — Bilal Orientation
  --   celine — Céline Entreprise Partenaire
  -- ------------------------------------------------------------------------

  -- Exemple d'insertion paramétrable (à dupliquer par profil réel importé) :
  -- insert into creator_profiles (user_id, display_name, bio, city, country,
  --   audience_types, content_types, primary_platform, follower_count,
  --   indicative_rate, profile_status, is_demo)
  -- values (
  --   :ines_user_id, 'Inès Parcoursup Live',
  --   'Créatrice TikTok lives Parcoursup · 8.2K abonnés',
  --   'Paris', 'France', array['lycéens'], array['story','tiktok'],
  --   'TikTok', 8200, '{"note":"tarif indicatif à reconstituer depuis le prototype"}'::jsonb,
  --   'verified', true
  -- );

  -- ------------------------------------------------------------------------
  -- Partenaires locaux 13e — 4 profils, explicitement fictifs
  -- (CONTACTS.localPartnerDemo === true, lignes 197-200 du prototype)
  -- ------------------------------------------------------------------------
  -- insert into creator_profiles (user_id, display_name, bio, city, country,
  --   audience_types, content_types, primary_platform, profile_status, is_demo)
  -- values
  --   (:local_cafe_user_id, 'Café Tolbiac — profil démo',
  --    'Commerce de proximité fictif · café étudiant du 13e. Profil fictif de démonstration : partenariat réel à qualifier. Aucun partenariat EBS réel annoncé.',
  --    'Paris 13e', 'France', array['étudiants et habitants du quartier'], array['terrain','video'],
  --    'Terrain', 'verified', true),
  --   (:local_resto_user_id, 'Cantine Campus 13 — profil démo',
  --    'Commerce de proximité fictif · restauration rapide du 13e. Aucun partenariat EBS réel annoncé.',
  --    'Paris 13e', 'France', array['étudiants, jeunes actifs et riverains'], array['instagram','reel'],
  --    'Instagram', 'verified', true),
  --   (:local_sport_user_id, 'Studio Mouvement 13 — profil démo',
  --    'Lieu partenaire fictif · studio sport et bien-être du 13e. Aucun partenariat EBS réel annoncé.',
  --    'Paris 13e', 'France', array['étudiants et jeunes actifs'], array['ugc'],
  --    'UGC', 'verified', true),
  --   (:local_culture_user_id, 'Librairie Créative 13 — profil démo',
  --    'Lieu partenaire fictif · librairie et espace culturel du 13e. Aucune collaboration réelle annoncée.',
  --    'Paris 13e', 'France', array['étudiants, parents et habitants du quartier'], array['instagram','interview'],
  --    'Instagram', 'verified', true);

  -- ------------------------------------------------------------------------
  -- Campagnes historiques (CAMPAIGNS, lignes 203-213) + campagne 13e
  -- ------------------------------------------------------------------------
  insert into campaigns (organization_id, title, description, objective, market, channels, budget_ceiling, status, mode, is_demo, created_by)
  values
    (v_org_id, 'Marché Liban — francophones & diaspora', null,
     'Faire connaître le Bachelor et le PGE auprès des lycéens francophones et de la diaspora libanaise',
     'Liban', array['WhatsApp','Instagram'], null, 'scheduled', 'demo', true, v_admin_user_id),
    (v_org_id, 'Marché Italie — Milan/Rome, doubles diplômes', null, null,
     'Italie', array['Instagram'], null, 'scheduled', 'demo', true, v_admin_user_id),
    (v_org_id, 'JPO exemple — présence & RDV', null, null,
     'France', array['TikTok','Instagram'], null, 'active', 'demo', true, v_admin_user_id),
    (v_org_id, 'LinkedIn Alumni — Parcoursup complémentaire', null, null,
     'France', array['LinkedIn'], null, 'scheduled', 'demo', true, v_admin_user_id),
    (v_org_id, 'Bachelor Business Development — candidatures', null, null,
     'France', array['LinkedIn','Instagram'], null, 'completed', 'demo', true, v_admin_user_id),
    (v_org_id, 'Bibliothèque UGC admissions', null, null,
     'France', array['UGC'], null, 'active', 'demo', true, v_admin_user_id),
    (v_org_id, 'Partenaires vidéo — commerces du 13e',
     'Créer un petit réseau de commerces et lieux de proximité capables de co-produire des vidéos utiles sur la vie étudiante autour d''EBS.',
     'Créer un petit réseau de commerces et lieux de proximité capables de co-produire des vidéos utiles sur la vie étudiante autour d''EBS.',
     'France', array['Terrain','Instagram'], 380, 'scheduled', 'demo', true, v_admin_user_id);

  -- ------------------------------------------------------------------------
  -- VIP_PROSPECTS et AGENCY_PROSPECTS : volontairement NON importés dans le
  -- produit (voir en-tête de ce fichier). Si un futur besoin de CRM de
  -- prospection apparaît, créer une table dédiée hors du domaine "créateurs
  -- inscrits" (ex: `partnership_prospects`, jamais jointe à creator_profiles).
  -- ------------------------------------------------------------------------

  raise notice 'Seed démo Ruche V1 : organisation % créée. Compléter les inserts creator_profiles après création des comptes Supabase Auth de démo.', v_org_id;
end $$;

-- ============================================================================
-- Note : ce script est un squelette relationnel volontairement partiel sur
-- creator_profiles car chaque ligne dépend d'un auth.users existant. En
-- pratique, préférer un script DEMO_SEED.ts exécuté côté serveur qui :
--   1. crée les comptes via supabase.auth.admin.createUser() pour chaque
--      persona (nina, emma, marc, lea, local_culture_13, ines, omar, ...) ;
--   2. insère ensuite creator_profiles / creator_platforms / campaigns /
--      missions / applications / assignments / proofs / payments avec les
--      user_id obtenus, en reprenant l'inventaire complet de AUDIT_V90.md.
-- ============================================================================

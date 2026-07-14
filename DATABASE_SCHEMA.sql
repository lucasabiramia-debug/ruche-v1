-- ============================================================================
-- Ruche V1 — DATABASE_SCHEMA.sql
-- Cible : Supabase Postgres
-- Référence fonctionnelle : AUDIT_V90.md / PRODUCT_REQUIREMENTS.md
-- ============================================================================
-- Conventions :
--   * PK uuid default gen_random_uuid()
--   * created_at / updated_at avec trigger générique
--   * is_demo boolean partout où une ligne peut être une donnée de démonstration
--   * ON DELETE RESTRICT par défaut sur les FK vers preuves/paiements/audit
--     (pas de suppression en cascade dangereuse), ON DELETE CASCADE seulement
--     pour les entités strictement possédées (ex: creator_platforms -> creator_profiles)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Fonction générique updated_at
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type app_role as enum ('super_admin', 'organization_admin', 'organization_member', 'creator');
create type org_member_status as enum ('active', 'invited', 'suspended');
create type creator_profile_status as enum ('incomplete', 'pending_review', 'verified', 'changes_requested', 'rejected');
create type invitation_status as enum ('created', 'sent', 'opened', 'accepted', 'expired', 'cancelled');
create type campaign_status as enum ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived');
create type campaign_mode as enum ('demo', 'pilot', 'live');
create type mission_publication_status as enum ('draft', 'open', 'invitation_only', 'closed');
create type application_status as enum ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn');
create type assignment_status as enum ('active', 'delivered', 'completed', 'cancelled');
create type brief_validation_status as enum ('draft', 'published', 'archived');
create type proof_status as enum ('draft', 'submitted', 'under_review', 'correction_requested', 'approved', 'rejected');
create type proof_type as enum ('instagram_link', 'tiktok_link', 'linkedin_link', 'youtube_link', 'screenshot', 'video', 'image', 'pdf', 'other');
create type payment_status as enum ('not_due', 'pending_validation', 'ready_to_pay', 'payment_sent', 'paid', 'disputed', 'cancelled');
create type consent_type as enum ('terms_of_service', 'privacy_policy', 'contact_consent', 'image_rights');

-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  organization_type text not null default 'company',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_organizations_updated_at before update on organizations
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- profiles (1:1 avec auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  avatar_url text,
  role app_role not null default 'creator',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_user_id on profiles(user_id);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- organization_members
-- ----------------------------------------------------------------------------
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'organization_member',
  permissions jsonb not null default '{}'::jsonb,
  status org_member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index idx_org_members_org on organization_members(organization_id);
create index idx_org_members_user on organization_members(user_id);
create trigger trg_org_members_updated_at before update on organization_members
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- creator_profiles
-- ----------------------------------------------------------------------------
create table creator_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  city text,
  country text,
  language text,
  audience_types text[] not null default '{}',
  content_types text[] not null default '{}',
  primary_platform text,
  follower_count integer check (follower_count >= 0),
  indicative_rate jsonb, -- {video, story, post, per_result, in_kind}
  profile_status creator_profile_status not null default 'incomplete',
  verification_note text,
  consent_given_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_creator_profiles_status on creator_profiles(profile_status);
create trigger trg_creator_profiles_updated_at before update on creator_profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- creator_platforms
-- ----------------------------------------------------------------------------
create table creator_platforms (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references creator_profiles(id) on delete cascade,
  platform text not null, -- instagram | tiktok | linkedin | youtube | other
  username text,
  profile_url text,
  followers integer check (followers >= 0),
  engagement_rate numeric(5,2),
  statistics_file_url text, -- storage path, jamais une URL publique
  verified boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (creator_profile_id, platform, username)
);
create trigger trg_creator_platforms_updated_at before update on creator_platforms
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- invitations
-- ----------------------------------------------------------------------------
create table invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text,
  phone text,
  invited_role app_role not null default 'creator',
  token_hash text not null unique, -- jamais le token en clair, seulement son hash (sha256)
  status invitation_status not null default 'created',
  campaign_id uuid, -- FK ajoutée après création de campaigns (voir ALTER plus bas)
  message text,
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_invitations_org on invitations(organization_id);
create index idx_invitations_token_hash on invitations(token_hash);

-- ----------------------------------------------------------------------------
-- campaigns
-- ----------------------------------------------------------------------------
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  objective text,
  target_audience text,
  market text,
  channels text[] not null default '{}',
  budget_ceiling numeric(10,2) check (budget_ceiling >= 0),
  start_date date,
  end_date date,
  status campaign_status not null default 'draft',
  mode campaign_mode not null default 'live',
  is_demo boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_campaign_dates check (end_date is null or start_date is null or end_date >= start_date)
);
create index idx_campaigns_org on campaigns(organization_id);
create index idx_campaigns_status on campaigns(status);
create index idx_campaigns_is_demo on campaigns(is_demo);
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();

alter table invitations
  add constraint fk_invitations_campaign foreign key (campaign_id) references campaigns(id) on delete set null;

-- ----------------------------------------------------------------------------
-- missions
-- ----------------------------------------------------------------------------
create table missions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  objective text,
  target text,
  deliverable text,
  required_proof text,
  budget_ceiling numeric(10,2) check (budget_ceiling >= 0),
  compensation_type text not null default 'fixed', -- fixed | per_result | in_kind
  deadline date,
  publication_status mission_publication_status not null default 'draft',
  eligibility_rules jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_missions_campaign on missions(campaign_id);
create index idx_missions_publication_status on missions(publication_status);
create trigger trg_missions_updated_at before update on missions
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- applications
-- ----------------------------------------------------------------------------
create table applications (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  creator_id uuid not null references creator_profiles(id) on delete cascade,
  message text,
  proposed_format text,
  proposed_price numeric(10,2) check (proposed_price >= 0),
  status application_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, creator_id) -- un créateur ne candidate qu'une fois par mission (retrait possible via withdrawn)
);
create index idx_applications_mission on applications(mission_id);
create index idx_applications_creator on applications(creator_id);
create index idx_applications_status on applications(status);
create trigger trg_applications_updated_at before update on applications
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- assignments (créé uniquement à l'acceptation d'une candidature)
-- ----------------------------------------------------------------------------
create table assignments (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete restrict,
  creator_id uuid not null references creator_profiles(id) on delete restrict,
  application_id uuid not null unique references applications(id) on delete restrict,
  agreed_budget numeric(10,2) check (agreed_budget >= 0),
  final_deliverable text,
  final_deadline date,
  assignment_status assignment_status not null default 'active',
  accepted_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_assignments_mission on assignments(mission_id);
create index idx_assignments_creator on assignments(creator_id);
create trigger trg_assignments_updated_at before update on assignments
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- briefs
-- ----------------------------------------------------------------------------
create table briefs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references assignments(id) on delete restrict,
  title text not null,
  instructions text,
  mandatory_mentions text,
  prohibited_claims text,
  tracking_code text,
  tracking_url text,
  usage_rights text,
  validation_status brief_validation_status not null default 'draft',
  created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
create index idx_briefs_assignment on briefs(assignment_id);
create trigger trg_briefs_updated_at before update on briefs
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- proofs
-- ----------------------------------------------------------------------------
create table proofs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete restrict,
  creator_id uuid not null references creator_profiles(id) on delete restrict,
  proof_type proof_type not null,
  public_content_url text,
  file_path text, -- storage privé
  statistics_file_path text, -- storage privé
  creator_comment text,
  status proof_status not null default 'draft',
  reviewer_comment text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_proofs_assignment on proofs(assignment_id);
create index idx_proofs_creator on proofs(creator_id);
create index idx_proofs_status on proofs(status);
create trigger trg_proofs_updated_at before update on proofs
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- payments — aucun paiement automatique déclenché par l'application
-- ----------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete restrict,
  creator_id uuid not null references creator_profiles(id) on delete restrict,
  agreed_amount numeric(10,2) not null check (agreed_amount >= 0),
  payable_amount numeric(10,2) check (payable_amount >= 0),
  currency text not null default 'EUR',
  status payment_status not null default 'not_due',
  due_date date,
  paid_at timestamptz,
  payment_reference text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- garde-fou métier : un paiement ne peut être "prêt à payer" ou "payé"
  -- sans qu'une preuve liée à l'assignment soit approuvée (appliqué aussi en RLS/trigger, voir RLS_POLICIES.sql)
  constraint chk_payment_paid_requires_reference check (status <> 'paid' or payment_reference is not null)
);
create index idx_payments_assignment on payments(assignment_id);
create index idx_payments_creator on payments(creator_id);
create index idx_payments_status on payments(status);
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- tracking_links
-- ----------------------------------------------------------------------------
create table tracking_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  assignment_id uuid references assignments(id) on delete set null,
  creator_id uuid references creator_profiles(id) on delete set null,
  code text not null,
  short_slug text unique,
  destination_url text not null,
  clicks integer not null default 0 check (clicks >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (campaign_id, code)
);
create index idx_tracking_links_campaign on tracking_links(campaign_id);

-- ----------------------------------------------------------------------------
-- campaign_metrics — saisie manuelle Admissions, jamais inventée si absente
-- ----------------------------------------------------------------------------
create table campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  assignment_id uuid references assignments(id) on delete set null,
  views integer not null default 0 check (views >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  leads integer not null default 0 check (leads >= 0),
  appointments integer not null default 0 check (appointments >= 0),
  applications_count integer not null default 0 check (applications_count >= 0),
  enrollments integer not null default 0 check (enrollments >= 0),
  source text not null default 'admissions', -- admissions | attributed | none
  recorded_by uuid references auth.users(id),
  recorded_at timestamptz not null default now()
);
create index idx_campaign_metrics_campaign on campaign_metrics(campaign_id);

-- ----------------------------------------------------------------------------
-- audit_logs — append-only, jamais supprimé en cascade
-- ----------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_logs_org on audit_logs(organization_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- invitation_sent | profile_verified | application_accepted | proof_approved | ...
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id);

-- ----------------------------------------------------------------------------
-- consent_logs — RGPD
-- ----------------------------------------------------------------------------
create table consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type consent_type not null,
  granted boolean not null,
  version text not null default '1.0',
  ip_address inet,
  created_at timestamptz not null default now()
);
create index idx_consent_logs_user on consent_logs(user_id);

-- ============================================================================
-- Fin du schéma de base. Voir RLS_POLICIES.sql et STORAGE_POLICIES.sql
-- pour la couche de sécurité appliquée par-dessus ces tables.
-- ============================================================================

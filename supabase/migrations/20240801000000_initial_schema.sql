-- Migration: Initial schema setup for Ruche V1
-- Creates: extensions, enums, base tables (organizations, profiles, creator_profiles)

create extension if not exists pgcrypto;

-- Generic updated_at trigger function
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ENUMS
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

-- organizations
create table if not exists organizations (
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

-- profiles (1:1 with auth.users)
create table if not exists profiles (
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
create index if not exists idx_profiles_user_id on profiles(user_id);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- organization_members
create table if not exists organization_members (
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
create index if not exists idx_org_members_org on organization_members(organization_id);
create index if not exists idx_org_members_user on organization_members(user_id);
create trigger trg_org_members_updated_at before update on organization_members
  for each row execute function set_updated_at();

-- creator_profiles
create table if not exists creator_profiles (
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
  indicative_rate jsonb,
  profile_status creator_profile_status not null default 'incomplete',
  verification_note text,
  consent_given_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_creator_profiles_status on creator_profiles(profile_status);
create trigger trg_creator_profiles_updated_at before update on creator_profiles
  for each row execute function set_updated_at();

-- creator_platforms
create table if not exists creator_platforms (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references creator_profiles(id) on delete cascade,
  platform text not null,
  username text,
  profile_url text,
  followers integer check (followers >= 0),
  engagement_rate numeric(5,2),
  statistics_file_url text,
  verified boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (creator_profile_id, platform, username)
);
create trigger trg_creator_platforms_updated_at before update on creator_platforms
  for each row execute function set_updated_at();

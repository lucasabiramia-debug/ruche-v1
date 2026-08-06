-- Migration: Campaigns, Invitations, and Missions
-- Creates: invitations, campaigns, missions tables and relationships

-- invitations
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text,
  phone text,
  invited_role app_role not null default 'creator',
  token_hash text not null unique,
  status invitation_status not null default 'created',
  campaign_id uuid,
  message text,
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_invitations_org on invitations(organization_id);
create index if not exists idx_invitations_token_hash on invitations(token_hash);

-- campaigns
create table if not exists campaigns (
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
create index if not exists idx_campaigns_org on campaigns(organization_id);
create index if not exists idx_campaigns_status on campaigns(status);
create index if not exists idx_campaigns_is_demo on campaigns(is_demo);
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();

-- Add campaign_id FK to invitations after campaigns table created
alter table invitations
  add constraint fk_invitations_campaign foreign key (campaign_id) references campaigns(id) on delete set null;

-- missions
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  objective text,
  target text,
  deliverable text,
  required_proof text,
  budget_ceiling numeric(10,2) check (budget_ceiling >= 0),
  compensation_type text not null default 'fixed',
  deadline date,
  publication_status mission_publication_status not null default 'draft',
  eligibility_rules jsonb not null default '{}'::jsonb,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_missions_campaign on missions(campaign_id);
create index if not exists idx_missions_publication_status on missions(publication_status);
create trigger trg_missions_updated_at before update on missions
  for each row execute function set_updated_at();

-- Migration: Tracking links, Metrics, Audit logs, Notifications, Consent
-- Creates: tracking_links, campaign_metrics, audit_logs, notifications, consent_logs tables

-- tracking_links
create table if not exists tracking_links (
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
create index if not exists idx_tracking_links_campaign on tracking_links(campaign_id);

-- campaign_metrics
create table if not exists campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  assignment_id uuid references assignments(id) on delete set null,
  views integer not null default 0 check (views >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  leads integer not null default 0 check (leads >= 0),
  appointments integer not null default 0 check (appointments >= 0),
  applications_count integer not null default 0 check (applications_count >= 0),
  enrollments integer not null default 0 check (enrollments >= 0),
  source text not null default 'admissions',
  recorded_by uuid references auth.users(id),
  recorded_at timestamptz not null default now()
);
create index if not exists idx_campaign_metrics_campaign on campaign_metrics(campaign_id);

-- audit_logs (append-only, never deleted in cascade)
create table if not exists audit_logs (
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
create index if not exists idx_audit_logs_org on audit_logs(organization_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);

-- notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id);

-- consent_logs (GDPR)
create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type consent_type not null,
  granted boolean not null,
  version text not null default '1.0',
  ip_address inet,
  created_at timestamptz not null default now()
);
create index if not exists idx_consent_logs_user on consent_logs(user_id);

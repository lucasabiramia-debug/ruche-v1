-- Migration: Applications and Assignments
-- Creates: applications, assignments tables

-- applications
create table if not exists applications (
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
  unique (mission_id, creator_id)
);
create index if not exists idx_applications_mission on applications(mission_id);
create index if not exists idx_applications_creator on applications(creator_id);
create index if not exists idx_applications_status on applications(status);
create trigger trg_applications_updated_at before update on applications
  for each row execute function set_updated_at();

-- assignments
create table if not exists assignments (
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
create index if not exists idx_assignments_mission on assignments(mission_id);
create index if not exists idx_assignments_creator on assignments(creator_id);
create trigger trg_assignments_updated_at before update on assignments
  for each row execute function set_updated_at();

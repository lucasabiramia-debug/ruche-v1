-- Migration: Briefs, Proofs, and Payments
-- Creates: briefs, proofs, payments tables

-- briefs
create table if not exists briefs (
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
create index if not exists idx_briefs_assignment on briefs(assignment_id);
create trigger trg_briefs_updated_at before update on briefs
  for each row execute function set_updated_at();

-- proofs
create table if not exists proofs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete restrict,
  creator_id uuid not null references creator_profiles(id) on delete restrict,
  proof_type proof_type not null,
  public_content_url text,
  file_path text,
  statistics_file_path text,
  creator_comment text,
  status proof_status not null default 'draft',
  reviewer_comment text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_proofs_assignment on proofs(assignment_id);
create index if not exists idx_proofs_creator on proofs(creator_id);
create index if not exists idx_proofs_status on proofs(status);
create trigger trg_proofs_updated_at before update on proofs
  for each row execute function set_updated_at();

-- payments
create table if not exists payments (
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
  constraint chk_payment_paid_requires_reference check (status <> 'paid' or payment_reference is not null)
);
create index if not exists idx_payments_assignment on payments(assignment_id);
create index if not exists idx_payments_creator on payments(creator_id);
create index if not exists idx_payments_status on payments(status);
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();

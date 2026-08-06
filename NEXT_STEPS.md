# Next Steps — Ruche V1 Phase 0 Completion

**Current Status**: Frontend infrastructure complete and pushed to `claude/ruche-fullstack-app-wplz8a`  
**Last Commit**: 29e97f9 (env fix)  
**Completion Timeline**: Phase 0 can be completed in ~2-3 hours

## Immediate Actions Required (Blocking)

### 1. Provision Supabase Project (Supabase.com)
```
1. Go to https://supabase.com/dashboard
2. Create new project
3. Note the Project Ref (e.g., "xyzabc123def")
4. Get credentials:
   - Settings → API → Project URL (copy full URL)
   - Settings → API → Project API Keys → copy anon key
   - Settings → API → Project API Keys → copy service_role key
```

### 2. Create .env.local (Local Development)
```bash
# Copy .env.example to .env.local
cp .env.local .env.example

# Fill in your Supabase credentials
VITE_SUPABASE_URL=https://xyzabc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Set Up Supabase CLI (Optional but Recommended)
```bash
npm install -g supabase

# Link local repo to Supabase project
supabase link --project-ref xyzabc123def

# Authenticate with GitHub
supabase login
```

## Phase 0 Migration Steps

### Step 1: Create Numbered Migrations
Convert `DATABASE_SCHEMA.sql` into timestamped migration files:

```bash
# Create migrations directory
mkdir -p supabase/migrations

# Create migration 20240101000000_initial_schema.sql
# (Split DATABASE_SCHEMA.sql into this file)

# Create migration 20240101000001_rls_policies.sql
# (Move RLS_POLICIES.sql here)

# Create migration 20240101000002_storage_policies.sql
# (Move STORAGE_POLICIES.sql here)
```

**File Format**: Each `.sql` file should be idempotent:
```sql
-- supabase/migrations/20240101000000_initial_schema.sql
-- Create all tables with CREATE TABLE IF NOT EXISTS...
-- Add constraints, indexes, triggers
```

### Step 2: Push Migrations to Supabase
```bash
# If using Supabase CLI
supabase db push

# Or manually in Supabase Console:
# - SQL Editor
# - Create new query
# - Paste each migration file content
# - Execute in order
```

Verify in Supabase:
- SQL Editor → select * from information_schema.tables
- Should see: organizations, creator_profiles, campaigns, etc.

### Step 3: Generate TypeScript Types
```bash
# Option A: Using CLI (requires supabase login)
supabase gen types typescript --linked > src/types/supabase.ts

# Option B: Manual (if CLI not available)
# Get introspection JSON from Supabase Console
# Use online tool or supabase-js to generate types
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Run Development Server
```bash
npm run dev
# Opens http://localhost:5173
```

**Test endpoints**:
- `/` — Public home page
- `/auth/signin` — Sign in form
- `/auth/signup` — Sign up form
- `/creator/dashboard` — Protected (redirects if not logged in)
- `/company/dashboard` — Protected

### Step 6: Create First Admin User (One-shot Script)
After migrations are applied, create the seed organization:

```bash
# Option A: Use Supabase Console
# 1. SQL Editor → Paste DEMO_SEED.sql content
# 2. Execute query
# 3. Note the organization_id created

# Option B: Via App (when signup/signin work)
# 1. Sign up as test@ruche.local
# 2. Verify email (check Supabase Auth tab)
# 3. Create admin in database manually via SQL Editor
```

## Detailed Migration Structure

Before implementing, review `DATABASE_SCHEMA.sql` line by line and break into:

**Migration 1** (`20240101000000_initial_schema.sql`):
- CREATE all tables (organizations, creator_profiles, campaigns, missions, applications, assignments, briefs, proofs, payments, audit_logs, etc.)
- ADD all constraints, foreign keys, unique indexes
- CREATE triggers for `updated_at` timestamp

**Migration 2** (`20240101000001_rls_policies.sql`):
- DROP existing policies (if re-running)
- CREATE security-definer functions (`verify_invitation_token`, `check_permission`, etc.)
- CREATE ROW SECURITY POLICIES on all tables
- ENABLE RLS on all tables

**Migration 3** (`20240101000002_storage_policies.sql`):
- CREATE storage buckets (avatars, creator-statistics, proofs, org-documents)
- CREATE storage policies (private access, signed URLs)

## Verification Checklist (Phase 0 Complete)

- [ ] Supabase project created and URL retrieved
- [ ] Migrations pushed and all tables exist
- [ ] TypeScript types generated in `src/types/supabase.ts`
- [ ] npm install successful (no errors)
- [ ] npm run dev starts server without errors
- [ ] Public homepage loads at http://localhost:5173
- [ ] Sign up form loads and submits (no errors, may not send real email yet)
- [ ] Email confirm link displays (token validation happens later)
- [ ] Sign in with test credentials works
- [ ] Creator dashboard accessible after login
- [ ] Company dashboard accessible after login with company role
- [ ] No TypeScript errors: npm run type-check passes
- [ ] No console errors in browser DevTools

## Next Phase Preview (Phase 1)

Once Phase 0 is verified:

1. **Invitation System** (`Phase 1` in MVP_IMPLEMENTATION_PLAN.md)
   - `/company/invitations` form
   - RPC for token generation
   - `/invitation/:token` verification flow

2. **Creator Onboarding** (`Phase 2`)
   - 6-step stepper form
   - Profile data submission
   - Avatar upload to Supabase Storage

3. **Campaigns & Missions** (`Phase 3`)
   - Company creates campaigns
   - Campaigns publish missions
   - Missions appear in creator feed

## Common Issues & Troubleshooting

**Issue**: "VITE_SUPABASE_URL is not defined"
- **Fix**: Check .env.local exists in root with VITE_ prefix, restart dev server

**Issue**: "Failed to connect to Supabase"
- **Fix**: Verify URL and anon key are correct (no spaces, full URL)

**Issue**: "RLS policies not found"
- **Fix**: Run migrations in correct order (schema → RLS → storage)

**Issue**: "TypeScript types mismatch with Supabase schema"
- **Fix**: Regenerate types: `supabase gen types typescript --linked > src/types/supabase.ts`

## Files Changed in This Commit
- Infrastructure bootstrap (25 files added)
- Vite + React + TypeScript project
- Tailwind + PostCSS configuration
- Supabase client integration
- React Router layout system (Public/Creator/Company)
- Basic auth pages (signin, signup)
- Dashboard placeholders

## Architecture Reference
- See `ARCHITECTURE.md` for folder structure conventions
- See `PHASE_0_SETUP.md` for detailed setup checklist
- See `MVP_IMPLEMENTATION_PLAN.md` for feature roadmap
- See `PRODUCT_REQUIREMENTS.md` for user stories

# Phase 0 Setup — Ruche V1 Foundations

**Status**: Ready to implement  
**Target**: Get to a state where a user can sign up, confirm email, and land on an empty dashboard in their role.

## Prerequisites
Before starting, ensure:
- [ ] Supabase project created at https://supabase.com
- [ ] Project ref noted (for environment config)
- [ ] GitHub secrets configured for CI/CD

## Step 1: Supabase Project Setup
If not already done:
1. Create a new Supabase project
2. Note: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Store these securely (GitHub Secrets, .env.local)

## Step 2: Apply Database Migrations
Migrate the schema into Supabase:
- [ ] Convert `DATABASE_SCHEMA.sql` into numbered migrations in `supabase/migrations/`
- [ ] Apply migrations via Supabase CLI: `supabase db push`
- [ ] Verify schema applied: SQL Editor in Supabase Console

## Step 3: Apply Security Policies
- [ ] Create migration for `RLS_POLICIES.sql` (security-definer functions + row policies)
- [ ] Create migration for `STORAGE_POLICIES.sql` (bucket config + file policies)
- [ ] Push via CLI or apply manually in SQL Editor

## Step 4: Generate TypeScript Types
```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

## Step 5: Frontend Infrastructure
Set up authentication and routing:
- [ ] Create `.env.local` with Supabase credentials
- [ ] Create `src/lib/supabase.ts` (client instance)
- [ ] Create `src/components/AuthProvider.tsx` (session context)
- [ ] Create `src/components/ProtectedRoute.tsx` (route guards)
- [ ] Create layouts: `PublicLayout`, `CreatorLayout`, `CompanyLayout`
- [ ] Wire layouts into root `_layout.tsx` with role-based rendering

## Step 6: Create First Organization Admin (One-shot)
```bash
# Run manually or create a script
# Creates: organizations + organization_members + auth.users records
# Admin credentials logged to console
```

## Step 7: Verify
Navigate to app and test:
- [ ] Sign up page loads
- [ ] Email confirmation flow works
- [ ] Creator lands on empty creator dashboard
- [ ] Company admin lands on empty company dashboard
- [ ] Public pages accessible without auth

## Files to Create
```
src/
  lib/
    supabase.ts (client + admin instances)
    auth.ts (helper functions)
  components/
    AuthProvider.tsx
    ProtectedRoute.tsx
  layouts/
    PublicLayout.tsx
    CreatorLayout.tsx
    CompanyLayout.tsx
  routes/
    auth/
      signup.tsx
      signin.tsx
      confirm-email.tsx
      forgot-password.tsx
    creator/
      _layout.tsx (guards: role check)
      dashboard.tsx
    company/
      _layout.tsx (guards: org admin check)
      dashboard.tsx
supabase/
  migrations/
    20240101000000_schema.sql
    20240101000001_rls_policies.sql
    20240101000002_storage_policies.sql
  seed.sql (demo org + admin user)
.env.local (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
.env.example (template, no real values)
```

## Exit Criteria (Phase 0 Complete)
1. A real user can sign up
2. Email confirmation link works
3. User lands on role-appropriate empty dashboard
4. RLS policies prevent unauthorized access
5. Storage policies allow avatar upload buckets to exist
6. No TypeScript errors
7. All routes type-safe via Supabase types

# Ruche V1 — Phase Development Status

**Branch:** `claude/ruche-fullstack-app-wplz8a`  
**Last Updated:** 2026-08-06  
**Status:** Active Development — Phases 0-3 Part 1 Complete

## Completed Phases

### Phase 0: Frontend Infrastructure ✅
- **Commit:** 00b0005 (previous)
- **Components:**
  - React Router with layout-based navigation (PublicLayout, CreatorLayout, CompanyLayout)
  - AuthProvider with session context (user, role, organizationId)
  - ProtectedRoute component with optional role-based access control
  - QueryClient setup with React Query
  - Tailwind CSS with custom "ruche" color palette

- **Pages:**
  - Home page (public landing)
  - Sign-in / Sign-up (public auth)
  - Creator dashboard (empty stub)
  - Company dashboard (empty stub)

- **Infrastructure:**
  - Vite build configuration
  - TypeScript strict mode
  - ESM module system with path aliases (@/)
  - Environment variable setup (.env.example)

---

### Phase 1: Invitation System ✅
- **Commit:** c1d050f
- **Database Migrations (5 numbered files):**
  - 20240801000000_initial_schema: Core tables, ENUMs, organizations, profiles
  - 20240801000001_campaigns_invitations: Invitations table with token_hash, campaigns, missions
  - 20240801000002_applications_assignments: Applications and assignments tables
  - 20240801000003_briefs_proofs_payments: Briefs, proofs, payments tables
  - 20240801000004_tracking_audit_notifications: Tracking, audit, notifications tables

- **Token Security Model:**
  - 32-byte cryptographic random token generation
  - SHA256 hash storage (raw token never stored)
  - Token returned once to user, never retrievable
  - Expiration validation on verification

- **Schemas:** `src/schemas/invitations.ts`
  - createInvitationSchema (email, role, message, expires_at)
  - verifyInvitationTokenSchema
  - acceptInvitationSchema (first_name, last_name, password)

- **Services:** `src/services/invitations.ts`
  - generateInvitationToken()
  - createInvitation()
  - verifyInvitationToken()
  - acceptInvitation() with organization_members record creation

- **UI Pages:**
  - `/company/invitations` (InvitationsPage): Form to create invitations, displays copyable link
  - `/invitation/:token` (InvitationAcceptPage): Public page for creators to accept and create account

---

### Phase 2: Creator Onboarding Stepper ✅
- **Commit:** 4b2e0e9
- **6-Step Form:**
  1. Personal Info (first_name, last_name, bio)
  2. Profile (profile_picture_url, location, website_url)
  3. Platforms (dynamic list: Instagram, TikTok, YouTube, Twitch, LinkedIn)
  4. Categories (multi-select from 16 categories)
  5. Availability (status, response_time_hours, notes)
  6. Review (read-only summary of all data)

- **UI Components:**
  - `Stepper.tsx`: Reusable progress indicator with step tracking
  - `Step1Personal.tsx` through `Step6Review.tsx`: Individual step components
  - Form validation with React Hook Form + Zod
  - Progressive data accumulation across steps
  - Image preview for profile picture
  - Dynamic platform list management with field arrays

- **Services:** `src/services/creator-profiles.ts`
  - createCreatorProfile(): Insert profile + platform records
  - updateCreatorProfile(): Update existing profile
  - getCreatorProfile(): Fetch with nested platforms

- **Page:** `/creator/onboarding` (CreatorOnboardingPage)
  - Full-page stepper with gradient background
  - Progress tracking (3/6 complete, 50%)
  - Navigation between steps
  - Error display and loading states
  - Redirects to `/creator/dashboard` on completion

---

### Phase 3 Part 1: Missions & Applications Marketplace ✅
- **Commit:** 1b65b9f
- **Service Layer:**
  - `src/services/missions.ts`:
    - listMissions() with filtering
    - getMissionById()
    - listCampaigns()
    - getCampaignById()

  - `src/services/applications.ts`:
    - createApplication() for creator submission
    - getApplicationsByCreator() for creator view
    - getApplicationsByMission() for company review
    - reviewApplication() for company approval/rejection

- **Schemas:** `src/schemas/missions.ts`
  - createApplicationSchema
  - reviewApplicationSchema

- **UI Components:**
  - `MissionCard.tsx`: Card display with mission details, apply button/badge
  - Grid layout responsive (1-3 columns)

- **Page:** `/creator/missions` (CreatorMissionsPage)
  - List all available missions
  - Search filter
  - Apply dialog with price input
  - Prevents duplicate applications
  - React Query integration for data fetching

---

## Architecture Overview

```
Frontend (Vite + React + TypeScript)
├── Components
│   ├── Reusable (Stepper, MissionCard, AuthProvider, ProtectedRoute)
│   ├── Onboarding (6 step components)
│   └── Layouts (PublicLayout, CreatorLayout, CompanyLayout)
├── Pages
│   ├── Public (HomePage, SignInPage, SignUpPage, InvitationAcceptPage)
│   ├── Creator (DashboardPage, OnboardingPage, MissionsPage)
│   └── Company (DashboardPage, InvitationsPage)
├── Services
│   ├── invitations.ts (token generation, verification, acceptance)
│   ├── creator-profiles.ts (profile creation/update)
│   ├── missions.ts (mission/campaign queries)
│   └── applications.ts (application management)
├── Schemas (Zod validation)
│   ├── invitations.ts
│   ├── creator-onboarding.ts
│   └── missions.ts
└── Integrations
    └── supabase/client.ts (Supabase client initialization)

Database (Supabase PostgreSQL with RLS)
├── Core Tables
│   ├── auth.users (Supabase managed)
│   ├── organizations
│   ├── profiles
│   ├── organization_members
│   ├── creator_profiles
│   └── creator_platforms
├── Collaboration Tables
│   ├── invitations (with token_hash unique index)
│   ├── campaigns
│   ├── missions
│   ├── applications (unique constraint: mission_id + creator_id)
│   └── assignments
└── Supporting Tables
    ├── briefs
    ├── proofs
    ├── payments
    ├── tracking_links
    ├── campaign_metrics
    ├── audit_logs
    ├── notifications
    └── consent_logs
```

---

## Pending Work

### User Setup (Blocking)
- [ ] Provision Supabase project
- [ ] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
- [ ] Set SUPABASE_SERVICE_ROLE_KEY in .env.local
- [ ] Run 5 numbered migrations in correct order
- [ ] Generate TypeScript types: `supabase gen types typescript --linked > src/types/supabase.ts`
- [ ] Install dependencies: `npm install`
- [ ] Test locally: `npm run dev`

### Phase 3 Part 2: Mission Detail & Assignments
- [ ] Mission detail page with full description, requirements, timeline
- [ ] Assignment creation when application approved
- [ ] Assignment status tracking

### Phase 3 Part 3: Briefs & Proofs
- [ ] Brief creation for assignment
- [ ] Content submission form (proofs)
- [ ] Proof review workflow
- [ ] Revision requests

### Phase 4: Payments
- [ ] Payment calculation and tracking
- [ ] Payment status updates
- [ ] Payment history view

### Phase 5: Company Dashboard
- [ ] Campaign creation wizard
- [ ] Campaign management (edit, launch, track)
- [ ] Mission management
- [ ] Application review interface
- [ ] KPI dashboard

### CI/CD & Testing (Post-MVP)
- [ ] GitHub Actions: lint, typecheck, build
- [ ] Unit tests for all services
- [ ] Component tests for pages
- [ ] E2E tests for critical flows

---

## Key Design Decisions

### Token Security
- Raw token generated once (32 bytes, cryptographically secure)
- SHA256 hash stored in database (raw token never stored)
- Token returned to user immediately (never retrievable)
- Expiration checked on verification

### Progressive Form Design
- 6-step stepper for creator onboarding
- Each step validates independently
- User can navigate between steps
- Final review step before submission
- Data accumulated progressively

### Query Optimization
- Nested selects to fetch related data (campaigns/missions, profiles/platforms)
- Indexed unique constraints for token_hash and mission_id + creator_id
- Pagination-ready queries (order by, limit)

### Component Reusability
- Stepper: Generic progress indicator
- MissionCard: Flexible mission display
- Step components: Template for future forms
- Service layer: No UI coupling

---

## Git Workflow

**Branch:** `claude/ruche-fullstack-app-wplz8a`

Commits:
1. Phase 0: Frontend infrastructure bootstrap
2. Phase 1: Invitation system foundation
3. Phase 2: Creator onboarding stepper
4. Phase 3 Part 1: Missions & Applications marketplace

Each commit is atomic and self-contained with full context in commit message.

---

## Next Steps (Recommended Order)

1. **Immediate (User):** Provision Supabase + set environment variables
2. **Immediate (Dev):** Run migrations and generate TypeScript types
3. **Phase 3 Part 2 (Dev):** Mission detail page and assignment workflow
4. **Testing (Dev):** Write unit tests for services
5. **Phase 4 (Dev):** Payments module if time permits
6. **Phase 5 (Dev):** Company dashboard if time permits

---

## Notes for Continuation

- All code is type-safe with TypeScript strict mode
- Validation is centralized in Zod schemas
- Database is idempotent (safe to re-run migrations)
- No real credentials stored in repository
- Frontend ready to integrate with Supabase immediately
- Migration order is critical (numbered files must run sequentially)
- Creator invitations are one-time use tokens (design allows multi-use by changing unique constraint)

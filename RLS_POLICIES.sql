-- ============================================================================
-- Ruche V1 — RLS_POLICIES.sql
-- À appliquer après DATABASE_SCHEMA.sql
-- Principe directeur : la permission d'interface n'est jamais une sécurité ;
-- toute règle listée dans PRODUCT_REQUIREMENTS.md §4 doit être vérifiable en
-- l'absence totale de code client (ex: via l'éditeur SQL Supabase avec un
-- rôle non-service).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Fonctions utilitaires (SECURITY DEFINER, pour éviter la récursion RLS)
-- ----------------------------------------------------------------------------

create or replace function auth_profile_role()
returns app_role
language sql stable security definer set search_path = public as $$
  select role from profiles where user_id = auth.uid();
$$;

create or replace function auth_organization_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select organization_id from organization_members
  where user_id = auth.uid() and status = 'active';
$$;

create or replace function auth_is_org_admin(org_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('organization_admin', 'super_admin')
  );
$$;

create or replace function auth_is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin');
$$;

create or replace function auth_creator_profile_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select id from creator_profiles where user_id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_self" on profiles
  for select using (user_id = auth.uid());

create policy "profiles_select_org_admin" on profiles
  for select using (
    exists (
      select 1 from organization_members om
      where om.user_id = profiles.user_id
        and om.organization_id in (select auth_organization_ids())
    )
    and auth_profile_role() in ('organization_admin', 'super_admin')
  );

create policy "profiles_update_self" on profiles
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and role = (select role from profiles p2 where p2.user_id = auth.uid()));
-- Le with check ci-dessus interdit à l'utilisateur de changer sa propre colonne `role`
-- (elle doit rester identique à la valeur déjà en base) : le rôle ne se change
-- jamais depuis le client, uniquement via une fonction admin dédiée (voir plus bas).

create or replace function admin_set_user_role(target_user_id uuid, new_role app_role)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not auth_is_super_admin() then
    raise exception 'not authorized';
  end if;
  update profiles set role = new_role where user_id = target_user_id;
  insert into audit_logs (actor_user_id, action, entity_type, entity_id, new_value)
    values (auth.uid(), 'role_changed', 'profiles', target_user_id, jsonb_build_object('role', new_role));
end;
$$;

-- ----------------------------------------------------------------------------
-- organizations / organization_members
-- ----------------------------------------------------------------------------
alter table organizations enable row level security;
alter table organization_members enable row level security;

create policy "organizations_select_member" on organizations
  for select using (id in (select auth_organization_ids()) or auth_is_super_admin());

create policy "organizations_update_admin" on organizations
  for update using (auth_is_org_admin(id));

create policy "org_members_select_same_org" on organization_members
  for select using (organization_id in (select auth_organization_ids()) or auth_is_super_admin());

create policy "org_members_write_admin" on organization_members
  for insert with check (auth_is_org_admin(organization_id));
create policy "org_members_update_admin" on organization_members
  for update using (auth_is_org_admin(organization_id));
create policy "org_members_delete_admin" on organization_members
  for delete using (auth_is_org_admin(organization_id));

-- ----------------------------------------------------------------------------
-- creator_profiles / creator_platforms
-- ----------------------------------------------------------------------------
alter table creator_profiles enable row level security;
alter table creator_platforms enable row level security;

create policy "creator_profiles_select_self" on creator_profiles
  for select using (user_id = auth.uid());

-- Un créateur ne voit jamais un autre créateur (exigence produit explicite).
-- Seule une organisation qui a une mission/candidature/assignment en commun
-- avec ce créateur (ou un admin) peut le consulter.
create policy "creator_profiles_select_org" on creator_profiles
  for select using (
    auth_profile_role() in ('organization_admin', 'organization_member', 'super_admin')
    and (
      exists (
        select 1 from applications a
        join missions m on m.id = a.mission_id
        join campaigns c on c.id = m.campaign_id
        where a.creator_id = creator_profiles.id
          and c.organization_id in (select auth_organization_ids())
      )
      or auth_is_super_admin()
    )
  );

create policy "creator_profiles_insert_self" on creator_profiles
  for insert with check (user_id = auth.uid());

create policy "creator_profiles_update_self" on creator_profiles
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and profile_status = (select profile_status from creator_profiles cp2 where cp2.id = creator_profiles.id));
-- Le créateur ne peut pas s'auto-valider : profile_status ne bouge pas via ce chemin.

create policy "creator_profiles_review_org_admin" on creator_profiles
  for update using (
    exists (
      select 1 from applications a
      join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id
      where a.creator_id = creator_profiles.id
        and auth_is_org_admin(c.organization_id)
    )
    or auth_is_super_admin()
  );

create policy "creator_platforms_self" on creator_platforms
  for all using (
    creator_profile_id in (select id from creator_profiles where user_id = auth.uid())
  ) with check (
    creator_profile_id in (select id from creator_profiles where user_id = auth.uid())
  );

create policy "creator_platforms_select_org" on creator_platforms
  for select using (
    creator_profile_id in (
      select cp.id from creator_profiles cp
      join applications a on a.creator_id = cp.id
      join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id
      where c.organization_id in (select auth_organization_ids())
    )
  );

-- ----------------------------------------------------------------------------
-- invitations
-- ----------------------------------------------------------------------------
alter table invitations enable row level security;

create policy "invitations_select_org" on invitations
  for select using (organization_id in (select auth_organization_ids()));

create policy "invitations_write_org_admin" on invitations
  for insert with check (auth_is_org_admin(organization_id));
create policy "invitations_update_org_admin" on invitations
  for update using (auth_is_org_admin(organization_id));

-- La vérification d'un jeton d'invitation par un utilisateur anonyme ne passe
-- JAMAIS par une lecture directe de cette table (le token_hash resterait
-- devinable via énumération). Elle passe par une RPC security definer dédiée :
create or replace function verify_invitation_token(raw_token text)
returns table (invitation_id uuid, organization_id uuid, invited_role app_role, email text)
language plpgsql security definer set search_path = public as $$
declare
  hashed text := encode(digest(raw_token, 'sha256'), 'hex');
begin
  return query
    select i.id, i.organization_id, i.invited_role, i.email
    from invitations i
    where i.token_hash = hashed
      and i.status in ('created', 'sent', 'opened')
      and i.expires_at > now();
end;
$$;

-- ----------------------------------------------------------------------------
-- campaigns / missions
-- ----------------------------------------------------------------------------
alter table campaigns enable row level security;
alter table missions enable row level security;

create policy "campaigns_select_org" on campaigns
  for select using (organization_id in (select auth_organization_ids()) or auth_is_super_admin());

create policy "campaigns_write_org_admin" on campaigns
  for insert with check (auth_is_org_admin(organization_id));
create policy "campaigns_update_org_admin" on campaigns
  for update using (auth_is_org_admin(organization_id));

create policy "missions_select_org" on missions
  for select using (
    campaign_id in (select id from campaigns where organization_id in (select auth_organization_ids()))
  );

-- Un créateur voit uniquement les missions publiées et ouvertes (jamais les
-- brouillons ni les missions réservées à d'autres organisations).
create policy "missions_select_creator" on missions
  for select using (
    publication_status in ('open', 'invitation_only')
    and auth_profile_role() = 'creator'
  );

create policy "missions_write_org_admin" on missions
  for insert with check (
    campaign_id in (select id from campaigns where auth_is_org_admin(organization_id))
  );
create policy "missions_update_org_admin" on missions
  for update using (
    campaign_id in (select id from campaigns where auth_is_org_admin(organization_id))
  );

-- ----------------------------------------------------------------------------
-- applications
-- ----------------------------------------------------------------------------
alter table applications enable row level security;

create policy "applications_select_self" on applications
  for select using (creator_id = auth_creator_profile_id());

create policy "applications_select_org" on applications
  for select using (
    mission_id in (
      select m.id from missions m
      join campaigns c on c.id = m.campaign_id
      where c.organization_id in (select auth_organization_ids())
    )
  );

create policy "applications_insert_self" on applications
  for insert with check (creator_id = auth_creator_profile_id());

create policy "applications_update_self_draft" on applications
  for update using (creator_id = auth_creator_profile_id() and status in ('draft', 'submitted'))
  with check (creator_id = auth_creator_profile_id());

create policy "applications_review_org_admin" on applications
  for update using (
    mission_id in (
      select m.id from missions m
      join campaigns c on c.id = m.campaign_id
      where auth_is_org_admin(c.organization_id)
    )
  );

-- ----------------------------------------------------------------------------
-- assignments / briefs / proofs / payments
-- Accès créateur strictement limité à SES PROPRES lignes (creator_id = soi).
-- ----------------------------------------------------------------------------
alter table assignments enable row level security;
alter table briefs enable row level security;
alter table proofs enable row level security;
alter table payments enable row level security;

create policy "assignments_select_self" on assignments
  for select using (creator_id = auth_creator_profile_id());
create policy "assignments_select_org" on assignments
  for select using (
    mission_id in (select m.id from missions m join campaigns c on c.id = m.campaign_id
      where c.organization_id in (select auth_organization_ids()))
  );
create policy "assignments_write_org_admin" on assignments
  for insert with check (
    mission_id in (select m.id from missions m join campaigns c on c.id = m.campaign_id
      where auth_is_org_admin(c.organization_id))
  );
create policy "assignments_update_org_admin" on assignments
  for update using (
    mission_id in (select m.id from missions m join campaigns c on c.id = m.campaign_id
      where auth_is_org_admin(c.organization_id))
  );

create policy "briefs_select_self" on briefs
  for select using (
    assignment_id in (select id from assignments where creator_id = auth_creator_profile_id())
  );
create policy "briefs_select_org" on briefs
  for select using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where c.organization_id in (select auth_organization_ids())
    )
  );
create policy "briefs_write_org_admin" on briefs
  for all using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where auth_is_org_admin(c.organization_id)
    )
  );

create policy "proofs_select_self" on proofs
  for select using (creator_id = auth_creator_profile_id());
create policy "proofs_select_org" on proofs
  for select using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where c.organization_id in (select auth_organization_ids())
    )
  );
create policy "proofs_insert_self" on proofs
  for insert with check (creator_id = auth_creator_profile_id());
create policy "proofs_update_self_draft" on proofs
  for update using (creator_id = auth_creator_profile_id() and status in ('draft', 'correction_requested'))
  with check (creator_id = auth_creator_profile_id());
create policy "proofs_review_org_admin" on proofs
  for update using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where auth_is_org_admin(c.organization_id)
    )
  );

create policy "payments_select_self" on payments
  for select using (creator_id = auth_creator_profile_id());
create policy "payments_select_org" on payments
  for select using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where c.organization_id in (select auth_organization_ids())
    )
  );
-- Le créateur ne peut jamais écrire sur payments (lecture seule) — cohérent
-- avec "aucun paiement automatique / suivi uniquement".
create policy "payments_write_org_admin" on payments
  for all using (
    assignment_id in (
      select a.id from assignments a join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id where auth_is_org_admin(c.organization_id)
    )
  );

-- Garde-fou métier porté en base (et pas seulement en UI) : un paiement ne
-- peut passer à ready_to_pay/paid que si une preuve approuvée existe pour
-- le même assignment.
create or replace function enforce_payment_requires_approved_proof()
returns trigger language plpgsql as $$
begin
  if new.status in ('ready_to_pay', 'paid') and old.status not in ('ready_to_pay', 'paid', 'payment_sent') then
    if not exists (
      select 1 from proofs where assignment_id = new.assignment_id and status = 'approved'
    ) then
      raise exception 'Paiement refusé : aucune preuve approuvée pour cet assignment';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_payments_require_proof
  before update on payments
  for each row execute function enforce_payment_requires_approved_proof();

-- ----------------------------------------------------------------------------
-- tracking_links / campaign_metrics
-- ----------------------------------------------------------------------------
alter table tracking_links enable row level security;
alter table campaign_metrics enable row level security;

create policy "tracking_links_select_org" on tracking_links
  for select using (campaign_id in (select id from campaigns where organization_id in (select auth_organization_ids())));
create policy "tracking_links_select_self" on tracking_links
  for select using (creator_id = auth_creator_profile_id());
create policy "tracking_links_write_org_admin" on tracking_links
  for all using (campaign_id in (select id from campaigns where auth_is_org_admin(organization_id)));

create policy "campaign_metrics_select_org" on campaign_metrics
  for select using (campaign_id in (select id from campaigns where organization_id in (select auth_organization_ids())));
create policy "campaign_metrics_write_org_admin" on campaign_metrics
  for all using (campaign_id in (select id from campaigns where auth_is_org_admin(organization_id)));
-- Les créateurs n'ont explicitement AUCUN accès à campaign_metrics
-- (résultats détaillés d'autres créateurs / données Admissions internes).

-- ----------------------------------------------------------------------------
-- audit_logs — lecture admin uniquement, écriture uniquement via fonctions
-- SECURITY DEFINER (jamais d'insert direct depuis le client)
-- ----------------------------------------------------------------------------
alter table audit_logs enable row level security;

create policy "audit_logs_select_org_admin" on audit_logs
  for select using (auth_is_org_admin(organization_id) or auth_is_super_admin());
-- Pas de policy INSERT/UPDATE/DELETE pour authenticated : toute écriture
-- passe par des fonctions security definer dédiées (ex: admin_set_user_role
-- ci-dessus, ou une fonction record_audit_log() appelée depuis les triggers
-- de validation profil / candidature / preuve).

-- ----------------------------------------------------------------------------
-- notifications / consent_logs
-- ----------------------------------------------------------------------------
alter table notifications enable row level security;
alter table consent_logs enable row level security;

create policy "notifications_select_self" on notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_self" on notifications
  for update using (user_id = auth.uid());

create policy "consent_logs_select_self" on consent_logs
  for select using (user_id = auth.uid());
create policy "consent_logs_insert_self" on consent_logs
  for insert with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Séparation Démo / Réel — non contournable côté client
-- ----------------------------------------------------------------------------
-- Le champ is_demo sur campaigns/missions/creator_profiles n'est PAS
-- filtré par une policy RLS séparée : il est filtré par une vue applicative
-- (ex: vue `campaigns_live` / `campaigns_demo`) ou par un paramètre de
-- session résolu côté serveur (JWT claim `org_mode` défini à l'authentification,
-- jamais par un query param lu par le client). Toute tentative de lire des
-- données is_demo=true depuis une organisation réelle (et inversement) doit
-- rester possible en lecture (utile pour l'admin qui compare), mais
-- l'AFFICHAGE ne doit jamais mélanger les deux sans bannière — c'est une
-- règle produit, appliquée dans la couche `features/*` (voir ARCHITECTURE.md),
-- pas une règle RLS en tant que telle car is_demo n'est pas une frontière
-- de confidentialité, c'est une frontière d'exactitude des données affichées.

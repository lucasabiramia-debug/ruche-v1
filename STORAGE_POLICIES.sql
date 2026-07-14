-- ============================================================================
-- Ruche V1 — STORAGE_POLICIES.sql
-- Buckets Supabase Storage + policies. Tous les buckets métier sont privés :
-- aucune preuve, statistique ou avatar n'est servi par une URL publique
-- permanente. Toute lecture passe par une URL signée à durée limitée.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/png','image/jpeg','image/webp']),
  ('creator-statistics', 'creator-statistics', false, 10485760, array['image/png','image/jpeg','application/pdf']),
  ('proofs', 'proofs', false, 52428800, array['image/png','image/jpeg','video/mp4','video/quicktime','application/pdf']),
  ('proof-statistics', 'proof-statistics', false, 10485760, array['image/png','image/jpeg','application/pdf']),
  ('org-documents', 'org-documents', false, 10485760, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

-- Convention de chemin obligatoire (appliquée par les policies ci-dessous) :
--   avatars/{user_id}/{filename}
--   creator-statistics/{creator_profile_id}/{filename}
--   proofs/{assignment_id}/{filename}
--   proof-statistics/{assignment_id}/{filename}
--   org-documents/{organization_id}/{filename}
-- Le premier segment du chemin identifie toujours le propriétaire logique,
-- ce qui permet des policies simples basées sur storage.foldername(name)[1].

-- ----------------------------------------------------------------------------
-- avatars — le propriétaire lit/écrit le sien ; toute personne authentifiée
-- dans la même organisation ou ayant une candidature en commun peut lire
-- (nécessaire pour afficher les fiches créateurs côté Entreprise)
-- ----------------------------------------------------------------------------
create policy "avatars_owner_write" on storage.objects
  for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_authenticated_read" on storage.objects
  for select
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- creator-statistics — privé au créateur + organisations liées par une
-- candidature/assignment (jamais public, contrairement à un avatar)
-- ----------------------------------------------------------------------------
create policy "creator_stats_owner_write" on storage.objects
  for all
  using (
    bucket_id = 'creator-statistics'
    and (storage.foldername(name))[1] in (select id::text from creator_profiles where user_id = auth.uid())
  )
  with check (
    bucket_id = 'creator-statistics'
    and (storage.foldername(name))[1] in (select id::text from creator_profiles where user_id = auth.uid())
  );

create policy "creator_stats_org_read" on storage.objects
  for select
  using (
    bucket_id = 'creator-statistics'
    and (storage.foldername(name))[1] in (
      select cp.id::text from creator_profiles cp
      join applications a on a.creator_id = cp.id
      join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id
      where c.organization_id in (select auth_organization_ids())
    )
  );

-- ----------------------------------------------------------------------------
-- proofs / proof-statistics — accès strictement au créateur propriétaire de
-- l'assignment et à l'organisation propriétaire de la mission correspondante.
-- Jamais d'accès public, jamais d'accès à un autre créateur.
-- ----------------------------------------------------------------------------
create policy "proofs_owner_write" on storage.objects
  for all
  using (
    bucket_id in ('proofs', 'proof-statistics')
    and (storage.foldername(name))[1] in (
      select id::text from assignments where creator_id = auth_creator_profile_id()
    )
  )
  with check (
    bucket_id in ('proofs', 'proof-statistics')
    and (storage.foldername(name))[1] in (
      select id::text from assignments where creator_id = auth_creator_profile_id()
    )
  );

create policy "proofs_org_read" on storage.objects
  for select
  using (
    bucket_id in ('proofs', 'proof-statistics')
    and (storage.foldername(name))[1] in (
      select a.id::text from assignments a
      join missions m on m.id = a.mission_id
      join campaigns c on c.id = m.campaign_id
      where c.organization_id in (select auth_organization_ids())
    )
  );

-- ----------------------------------------------------------------------------
-- org-documents — réservé aux membres de l'organisation
-- ----------------------------------------------------------------------------
create policy "org_documents_read" on storage.objects
  for select
  using (
    bucket_id = 'org-documents'
    and (storage.foldername(name))[1] in (select auth_organization_ids()::text)
  );

create policy "org_documents_write_admin" on storage.objects
  for all
  using (
    bucket_id = 'org-documents'
    and auth_is_org_admin((storage.foldername(name))[1]::uuid)
  );

-- ----------------------------------------------------------------------------
-- Notes d'implémentation
-- ----------------------------------------------------------------------------
-- 1. Toute URL exposée au client pour un fichier de ces buckets doit être
--    générée via `supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds)`
--    côté service (edge function ou hook serveur), jamais une URL publique
--    stockée telle quelle dans une colonne (file_path/statistics_file_path
--    stockent le CHEMIN, pas une URL).
-- 2. Le service worker de la PWA ne doit précacher AUCUNE ressource de ces
--    5 buckets (voir ARCHITECTURE.md §5) : exclusion explicite par pattern
--    d'URL dans la config Workbox.
-- 3. La validation de taille/format est appliquée deux fois : côté client
--    (UX, message d'erreur immédiat) et côté bucket (file_size_limit /
--    allowed_mime_types ci-dessus) — ne jamais faire confiance uniquement
--    au contrôle client.

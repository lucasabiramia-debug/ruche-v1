import { supabase } from '@/integrations/supabase/client'

export async function createApplication(
  missionId: string,
  creatorId: string,
  proposedPrice: number,
) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      mission_id: missionId,
      creator_id: creatorId,
      status: 'submitted',
      proposed_price: proposedPrice,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getApplicationsByCreator(creatorId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      mission_id,
      status,
      proposed_price,
      submitted_at,
      reviewed_at,
      rejection_reason,
      missions (
        id,
        title,
        campaign_id,
        campaigns (
          id,
          title,
          status,
          is_demo
        )
      )
    `,
    )
    .eq('creator_id', creatorId)
    .order('submitted_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getApplicationByMissionAndCreator(
  missionId: string,
  creatorId: string,
) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('mission_id', missionId)
    .eq('creator_id', creatorId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || null
}

// All applications visible to the caller (RLS scopes to their organization)
export async function listApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      mission_id,
      creator_id,
      status,
      proposed_price,
      submitted_at,
      reviewed_at,
      rejection_reason,
      missions (
        id,
        title,
        campaigns (
          id,
          title,
          objective,
          target_audience
        )
      ),
      creator_profiles (
        id,
        bio,
        location,
        profile_picture_url
      )
    `,
    )
    .order('submitted_at', { ascending: false })

  if (error) throw error

  // Nested relations are single objects at runtime; the untyped select-string
  // parser infers them as arrays, so the cast lets callers type the real shape
  return data as any[]
}

export async function getApplicationsByMission(missionId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      mission_id,
      creator_id,
      status,
      proposed_price,
      submitted_at,
      reviewed_at,
      rejection_reason,
      creator_profiles (
        id,
        bio,
        location,
        profile_picture_url
      )
    `,
    )
    .eq('mission_id', missionId)
    .order('submitted_at', { ascending: false })

  if (error) throw error

  // Nested relations are single objects at runtime; the untyped select-string
  // parser infers them as arrays, so the cast lets callers type the real shape
  return data as any[]
}

export async function reviewApplication(
  applicationId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
) {
  const updateData: any = {
    status,
    reviewed_at: new Date().toISOString(),
  }

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw error

  return data
}

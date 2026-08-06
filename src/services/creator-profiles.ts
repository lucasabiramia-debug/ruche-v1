import { supabase } from '@/integrations/supabase/client'
import type { CreatorProfileComplete } from '@/schemas/creator-onboarding'

export async function createCreatorProfile(userId: string, data: CreatorProfileComplete) {
  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .insert({
      user_id: userId,
      bio: data.bio,
      profile_picture_url: data.profile_picture_url || null,
      location: data.location,
      website_url: data.website_url || null,
      availability_status: data.availability_status,
      response_time_hours: data.response_time_hours,
      notes: data.availability_notes || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) throw error

  // Create platform records
  if (data.platforms.length > 0) {
    const platformRecords = data.platforms.map((platform) => ({
      creator_id: profile.id,
      platform_name: platform.platform_name,
      handle: platform.handle,
      follower_count: platform.follower_count,
      engagement_rate: platform.engagement_rate || null,
    }))

    const { error: platformError } = await supabase
      .from('creator_platforms')
      .insert(platformRecords)

    if (platformError) throw platformError
  }

  return profile
}

export async function updateCreatorProfile(creatorId: string, data: Partial<CreatorProfileComplete>) {
  const updateData: any = {}

  if (data.bio) updateData.bio = data.bio
  if (data.profile_picture_url !== undefined) updateData.profile_picture_url = data.profile_picture_url || null
  if (data.location) updateData.location = data.location
  if (data.website_url !== undefined) updateData.website_url = data.website_url || null
  if (data.availability_status) updateData.availability_status = data.availability_status
  if (data.response_time_hours) updateData.response_time_hours = data.response_time_hours
  if (data.availability_notes !== undefined) updateData.notes = data.availability_notes || null

  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .update(updateData)
    .eq('id', creatorId)
    .select()
    .single()

  if (error) throw error

  // Update platforms if provided
  if (data.platforms) {
    // Delete old platforms
    await supabase.from('creator_platforms').delete().eq('creator_id', creatorId)

    // Create new ones
    const platformRecords = data.platforms.map((platform) => ({
      creator_id: creatorId,
      platform_name: platform.platform_name,
      handle: platform.handle,
      follower_count: platform.follower_count,
      engagement_rate: platform.engagement_rate || null,
    }))

    const { error: platformError } = await supabase
      .from('creator_platforms')
      .insert(platformRecords)

    if (platformError) throw platformError
  }

  return profile
}

export async function getCreatorProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .select(
      `
      *,
      creator_platforms(*)
    `,
    )
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return profile
}

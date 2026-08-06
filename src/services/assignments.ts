import { supabase } from '@/integrations/supabase/client'

export async function createAssignment(
  missionId: string,
  creatorId: string,
  applicationId: string,
  agreedBudget: number,
) {
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      mission_id: missionId,
      creator_id: creatorId,
      application_id: applicationId,
      agreed_budget: agreedBudget,
      assignment_status: 'active',
      accepted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getAssignmentsByCreator(creatorId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      id,
      mission_id,
      agreed_budget,
      assignment_status,
      accepted_at,
      completed_at,
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
    .order('accepted_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getAssignmentsByMission(missionId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      id,
      creator_id,
      agreed_budget,
      assignment_status,
      accepted_at,
      completed_at,
      creator_profiles (
        id,
        bio,
        location,
        profile_picture_url
      )
    `,
    )
    .eq('mission_id', missionId)

  if (error) throw error

  return data
}

export async function getAssignmentById(assignmentId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(
      `
      id,
      mission_id,
      creator_id,
      agreed_budget,
      assignment_status,
      accepted_at,
      completed_at,
      missions (
        id,
        title,
        campaign_id,
        campaigns (
          id,
          title,
          description,
          objective,
          status,
          is_demo
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
    .eq('id', assignmentId)
    .single()

  if (error) throw error

  return data
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'active' | 'in_progress' | 'completed' | 'cancelled',
) {
  const updateData: any = { assignment_status: status }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) throw error

  return data
}

import { supabase } from '@/integrations/supabase/client'

export interface CreateMissionInput {
  campaignId: string
  title: string
  eligibilityRules?: string[]
}

export async function createMission(input: CreateMissionInput) {
  const { data, error } = await supabase
    .from('missions')
    .insert({
      campaign_id: input.campaignId,
      title: input.title,
      publication_status: 'draft',
      eligibility_rules: input.eligibilityRules || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateMission(
  missionId: string,
  updates: Partial<CreateMissionInput>,
) {
  const updateData: any = {}

  if (updates.title) updateData.title = updates.title
  if (updates.eligibilityRules !== undefined)
    updateData.eligibility_rules = updates.eligibilityRules

  const { data, error } = await supabase
    .from('missions')
    .update(updateData)
    .eq('id', missionId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function publishMission(missionId: string) {
  const { data, error } = await supabase
    .from('missions')
    .update({ publication_status: 'published' })
    .eq('id', missionId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function archiveMission(missionId: string) {
  const { data, error } = await supabase
    .from('missions')
    .update({ publication_status: 'archived' })
    .eq('id', missionId)
    .select()
    .single()

  if (error) throw error

  return data
}

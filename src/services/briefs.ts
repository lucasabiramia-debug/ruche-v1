import { supabase } from '@/integrations/supabase/client'

export interface CreateBriefInput {
  assignmentId: string
  title: string
  instructions: string
  mandatoryMentions?: string[]
  prohibitedClaims?: string[]
  trackingCode?: string
  trackingUrl?: string
  usageRights?: string
}

export async function createBrief(input: CreateBriefInput) {
  const { data, error } = await supabase
    .from('briefs')
    .insert({
      assignment_id: input.assignmentId,
      title: input.title,
      instructions: input.instructions,
      mandatory_mentions: input.mandatoryMentions || null,
      prohibited_claims: input.prohibitedClaims || null,
      tracking_code: input.trackingCode || null,
      tracking_url: input.trackingUrl || null,
      usage_rights: input.usageRights || null,
      validation_status: 'pending',
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getBriefByAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('assignment_id', assignmentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || null
}

export async function updateBrief(briefId: string, updates: Partial<CreateBriefInput>) {
  const updateData: any = {}

  if (updates.title) updateData.title = updates.title
  if (updates.instructions) updateData.instructions = updates.instructions
  if (updates.mandatoryMentions !== undefined) updateData.mandatory_mentions = updates.mandatoryMentions
  if (updates.prohibitedClaims !== undefined) updateData.prohibited_claims = updates.prohibitedClaims
  if (updates.trackingCode !== undefined) updateData.tracking_code = updates.trackingCode
  if (updates.trackingUrl !== undefined) updateData.tracking_url = updates.trackingUrl
  if (updates.usageRights !== undefined) updateData.usage_rights = updates.usageRights

  const { data, error } = await supabase
    .from('briefs')
    .update(updateData)
    .eq('id', briefId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function validateBrief(briefId: string, isValid: boolean) {
  const { data, error } = await supabase
    .from('briefs')
    .update({
      validation_status: isValid ? 'approved' : 'rejected',
    })
    .eq('id', briefId)
    .select()
    .single()

  if (error) throw error

  return data
}

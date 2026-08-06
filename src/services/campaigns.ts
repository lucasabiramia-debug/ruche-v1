import { supabase } from '@/integrations/supabase/client'

export interface CreateCampaignInput {
  title: string
  description?: string
  objective?: string
  targetAudience?: string
  budgetCeiling?: number
  isDemo?: boolean
}

export async function createCampaign(
  organizationId: string,
  createdBy: string,
  input: CreateCampaignInput,
) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      organization_id: organizationId,
      title: input.title,
      description: input.description || null,
      objective: input.objective || null,
      target_audience: input.targetAudience || null,
      budget_ceiling: input.budgetCeiling || null,
      status: 'draft',
      mode: 'standard',
      is_demo: input.isDemo || false,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<CreateCampaignInput> & { status?: string },
) {
  const updateData: any = {}

  if (updates.title) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.objective !== undefined) updateData.objective = updates.objective
  if (updates.targetAudience !== undefined) updateData.target_audience = updates.targetAudience
  if (updates.budgetCeiling !== undefined) updateData.budget_ceiling = updates.budgetCeiling
  if (updates.status) updateData.status = updates.status

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function launchCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: 'active' })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function archiveCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status: 'archived' })
    .eq('id', campaignId)
    .select()
    .single()

  if (error) throw error

  return data
}

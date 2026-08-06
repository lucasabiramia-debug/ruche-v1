import { supabase } from '@/integrations/supabase/client'

export interface MissionFilter {
  campaignId?: string
  status?: string
  search?: string
  categoryFilter?: string[]
}

export async function listMissions(filters?: MissionFilter) {
  let query = supabase
    .from('missions')
    .select(
      `
      id,
      title,
      campaign_id,
      publication_status,
      eligibility_rules,
      campaigns (
        id,
        title,
        description,
        objective,
        target_audience,
        budget_ceiling,
        status,
        is_demo,
        created_by,
        created_at
      )
    `,
    )

  if (filters?.campaignId) {
    query = query.eq('campaign_id', filters.campaignId)
  }

  if (filters?.status) {
    query = query.eq('publication_status', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error

  return data
}

export async function getMissionById(missionId: string) {
  const { data, error } = await supabase
    .from('missions')
    .select(
      `
      id,
      title,
      campaign_id,
      publication_status,
      eligibility_rules,
      campaigns (
        id,
        title,
        description,
        objective,
        target_audience,
        budget_ceiling,
        status,
        is_demo,
        created_by,
        created_at
      )
    `,
    )
    .eq('id', missionId)
    .single()

  if (error) throw error

  return data
}

export async function listCampaigns(filters?: { status?: string; search?: string }) {
  let query = supabase
    .from('campaigns')
    .select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getCampaignById(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      `
      *,
      missions (
        id,
        title,
        publication_status
      )
    `,
    )
    .eq('id', campaignId)
    .single()

  if (error) throw error

  return data
}

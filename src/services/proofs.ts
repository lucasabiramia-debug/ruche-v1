import { supabase } from '@/integrations/supabase/client'

export interface CreateProofInput {
  assignmentId: string
  creatorId: string
  proofType: 'video' | 'image' | 'article' | 'social_post' | 'other'
  publicContentUrl?: string
  filePath?: string
  statisticsFilePath?: string
}

export async function submitProof(input: CreateProofInput) {
  const { data, error } = await supabase
    .from('proofs')
    .insert({
      assignment_id: input.assignmentId,
      creator_id: input.creatorId,
      proof_type: input.proofType,
      public_content_url: input.publicContentUrl || null,
      file_path: input.filePath || null,
      statistics_file_path: input.statisticsFilePath || null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getProofsByAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('proofs')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getProofById(proofId: string) {
  const { data, error } = await supabase
    .from('proofs')
    .select('*')
    .eq('id', proofId)
    .single()

  if (error) throw error

  return data
}

export async function reviewProof(
  proofId: string,
  status: 'approved' | 'rejected' | 'needs_revision',
  reviewedBy?: string,
) {
  const { data, error } = await supabase
    .from('proofs')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy || null,
    })
    .eq('id', proofId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateProofStatus(proofId: string, status: string) {
  const { data, error } = await supabase
    .from('proofs')
    .update({ status })
    .eq('id', proofId)
    .select()
    .single()

  if (error) throw error

  return data
}

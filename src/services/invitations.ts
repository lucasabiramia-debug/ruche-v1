import { supabase } from '@/integrations/supabase/client'
import type { CreateInvitationInput } from '@/schemas/invitations'

// Web Crypto (browser-safe) — the Node 'crypto' module is not available in Vite builds
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return toHex(new Uint8Array(digest))
}

export async function generateInvitationToken(): Promise<{ token: string; token_hash: string }> {
  // Generate cryptographically secure random token
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)))
  const token_hash = await sha256Hex(token)
  return { token, token_hash }
}

export async function createInvitation(
  organizationId: string,
  input: CreateInvitationInput,
  invitedByUserId: string,
) {
  const { token, token_hash } = await generateInvitationToken()

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email: input.email,
      invited_role: input.invited_role,
      token_hash,
      status: 'created',
      expires_at: input.expires_at,
      invited_by: invitedByUserId,
      message: input.message,
    })
    .select()
    .single()

  if (error) throw error

  return { invitation: data, token }
}

export async function verifyInvitationToken(token: string) {
  const token_hash = await sha256Hex(token)

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token_hash', token_hash)
    .single()

  if (error || !data) throw new Error('Invitation invalide ou expirée')

  // Check expiration
  if (new Date(data.expires_at) < new Date()) {
    throw new Error('Invitation expirée')
  }

  return data
}

export async function acceptInvitation(token: string, userId: string) {
  const token_hash = await sha256Hex(token)

  const { data, error } = await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('token_hash', token_hash)
    .select()
    .single()

  if (error) throw error

  // Create organization_member record
  const { error: memberError } = await supabase.from('organization_members').insert({
    organization_id: data.organization_id,
    user_id: userId,
    role: data.invited_role,
    status: 'active',
  })

  if (memberError) throw memberError

  return data
}

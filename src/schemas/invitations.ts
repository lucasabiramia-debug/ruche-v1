import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().email('Email invalide'),
  invited_role: z.enum(['creator', 'organization_member', 'organization_admin']),
  message: z.string().optional(),
  expires_at: z.string().datetime(),
})

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>

export const verifyInvitationTokenSchema = z.object({
  token: z.string().min(1, 'Jeton invalide'),
})

export type VerifyInvitationTokenInput = z.infer<typeof verifyInvitationTokenSchema>

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Jeton invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

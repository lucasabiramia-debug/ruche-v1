import { z } from 'zod'

export const createBriefSchema = z.object({
  title: z.string().min(5, 'Titre minimum 5 caractères').max(200, 'Titre max 200 caractères'),
  instructions: z.string().min(20, 'Instructions minimum 20 caractères').max(5000, 'Max 5000 caractères'),
  mandatoryMentions: z.array(z.string()).optional(),
  prohibitedClaims: z.array(z.string()).optional(),
  trackingCode: z.string().optional(),
  trackingUrl: z.string().url('URL valide requise').optional().or(z.literal('')),
  usageRights: z.string().optional(),
})

export const submitProofSchema = z.object({
  proofType: z.enum(['video', 'image', 'article', 'social_post', 'other']),
  publicContentUrl: z.string().url('URL valide requise').optional().or(z.literal('')),
  filePath: z.string().optional(),
  statisticsFilePath: z.string().optional(),
})

export const reviewProofSchema = z.object({
  status: z.enum(['approved', 'rejected', 'needs_revision']),
})

export type CreateBriefInput = z.infer<typeof createBriefSchema>
export type SubmitProofInput = z.infer<typeof submitProofSchema>
export type ReviewProofInput = z.infer<typeof reviewProofSchema>

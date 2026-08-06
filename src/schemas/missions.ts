import { z } from 'zod'

export const createApplicationSchema = z.object({
  mission_id: z.string().uuid('ID de mission invalide'),
  proposed_price: z.number().min(0, 'Le prix doit être positif'),
})

export const reviewApplicationSchema = z.object({
  application_id: z.string().uuid('ID application invalide'),
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>

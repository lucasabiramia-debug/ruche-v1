import { z } from 'zod'

export const creatorProfileStep1Schema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  bio: z.string().min(10, 'Bio minimale 10 caractères').max(500, 'Bio max 500 caractères'),
})

export const creatorProfileStep2Schema = z.object({
  profile_picture_url: z.string().url('URL valide requise').optional().or(z.literal('')),
  location: z.string().min(2, 'Localisation requise'),
  website_url: z.string().url('URL valide requise').optional().or(z.literal('')),
})

export const platformSchema = z.object({
  platform_name: z.enum(['instagram', 'tiktok', 'youtube', 'twitch', 'linkedin']),
  handle: z.string().min(1, 'Handle requis'),
  follower_count: z.number().int().min(0, 'Nombre positif requis'),
  engagement_rate: z.number().min(0).max(100, 'Entre 0 et 100%').optional(),
})

export const creatorProfileStep3Schema = z.object({
  platforms: z.array(platformSchema).min(1, 'Au moins une plateforme requise'),
})

export const creatorProfileStep4Schema = z.object({
  categories: z.array(z.string()).min(1, 'Au moins une catégorie requise'),
})

export const creatorProfileStep5Schema = z.object({
  availability_status: z.enum(['available', 'semi_available', 'unavailable']),
  availability_notes: z.string().optional(),
  response_time_hours: z.number().int().min(1, 'Temps minimum 1h'),
})

export const creatorProfileCompleteSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  bio: z.string().min(10).max(500),
  profile_picture_url: z.string().url().optional().or(z.literal('')),
  location: z.string().min(2),
  website_url: z.string().url().optional().or(z.literal('')),
  platforms: z.array(platformSchema).min(1),
  categories: z.array(z.string()).min(1),
  availability_status: z.enum(['available', 'semi_available', 'unavailable']),
  availability_notes: z.string().optional(),
  response_time_hours: z.number().int().min(1),
})

export type CreatorProfileStep1 = z.infer<typeof creatorProfileStep1Schema>
export type CreatorProfileStep2 = z.infer<typeof creatorProfileStep2Schema>
export type CreatorProfileStep3 = z.infer<typeof creatorProfileStep3Schema>
export type CreatorProfileStep4 = z.infer<typeof creatorProfileStep4Schema>
export type CreatorProfileStep5 = z.infer<typeof creatorProfileStep5Schema>
export type CreatorProfileComplete = z.infer<typeof creatorProfileCompleteSchema>

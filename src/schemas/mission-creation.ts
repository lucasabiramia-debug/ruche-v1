import { z } from 'zod'

export const createMissionSchema = z.object({
  title: z.string().min(5, 'Titre minimum 5 caractères').max(200, 'Titre max 200 caractères'),
  eligibility_rules: z.array(z.string()).optional(),
})

export const updateMissionSchema = createMissionSchema.partial()

export type CreateMissionInput = z.infer<typeof createMissionSchema>
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>

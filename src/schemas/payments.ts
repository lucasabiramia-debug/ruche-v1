import { z } from 'zod'

export const markPaymentAsPaidSchema = z.object({
  paymentId: z.string().uuid('Payment ID invalide'),
  paymentReference: z.string().min(1, 'Référence de paiement requise'),
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid('Payment ID invalide'),
  status: z.enum(['pending', 'processing', 'paid', 'failed']),
})

export type MarkPaymentAsPaidInput = z.infer<typeof markPaymentAsPaidSchema>
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>

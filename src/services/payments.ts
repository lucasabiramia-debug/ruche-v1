import { supabase } from '@/integrations/supabase/client'

export interface CreatePaymentInput {
  assignmentId: string
  creatorId: string
  agreedAmount: number
  payableAmount: number
}

export async function createPayment(input: CreatePaymentInput) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      assignment_id: input.assignmentId,
      creator_id: input.creatorId,
      agreed_amount: input.agreedAmount,
      payable_amount: input.payableAmount,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getPaymentsByCreator(creatorId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(
      `
      id,
      assignment_id,
      agreed_amount,
      payable_amount,
      status,
      paid_at,
      payment_reference,
      assignments (
        id,
        mission_id,
        missions (
          id,
          title,
          campaigns (
            id,
            title
          )
        )
      )
    `,
    )
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getPaymentsByAssignment(assignmentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('assignment_id', assignmentId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || null
}

export async function markPaymentAsPaid(
  paymentId: string,
  paymentReference: string,
) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_reference: paymentReference,
    })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'processing' | 'paid' | 'failed',
) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getPaymentSummary(creatorId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('status, payable_amount')
    .eq('creator_id', creatorId)

  if (error) throw error

  const summary = {
    total_earned: 0,
    total_paid: 0,
    total_pending: 0,
    payment_count: data.length,
  }

  data.forEach((payment) => {
    summary.total_earned += payment.payable_amount
    if (payment.status === 'paid') {
      summary.total_paid += payment.payable_amount
    } else if (payment.status === 'pending' || payment.status === 'processing') {
      summary.total_pending += payment.payable_amount
    }
  })

  return summary
}

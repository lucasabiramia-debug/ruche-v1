import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getPaymentsByCreator, getPaymentSummary } from '@/services/payments'

interface Payment {
  id: string
  agreed_amount: number
  payable_amount: number
  status: string
  paid_at?: string
  payment_reference?: string
  assignments?: {
    id: string
    mission_id: string
    missions?: {
      id: string
      title: string
      campaigns?: {
        id: string
        title: string
      }
    }
  }
}

export function CreatorEarningsPage() {
  const { user } = useAuth()

  const paymentsQuery = useQuery({
    queryKey: ['creator-payments'],
    queryFn: () => (user ? getPaymentsByCreator(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const summaryQuery = useQuery({
    queryKey: ['creator-payment-summary'],
    queryFn: () => (user ? getPaymentSummary(user.id) : Promise.resolve(null)),
    enabled: !!user,
  })

  const summary = summaryQuery.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      paid: 'Payé',
      failed: 'Échoué',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes revenus</h1>
        <p className="mt-2 text-gray-600">Suivi de vos paiements et earnings</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Total gagné</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              €{summary.total_earned.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Déjà payé</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              €{summary.total_paid.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">En attente</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              €{summary.total_pending.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Payments History */}
      <div>
        <h2 className="text-xl font-bold">Historique des paiements</h2>

        {paymentsQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : paymentsQuery.error ? (
          <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-800">
            Erreur lors du chargement des paiements
          </div>
        ) : paymentsQuery.data && paymentsQuery.data.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Mission</th>
                  <th className="px-4 py-3 text-left font-semibold">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentsQuery.data.map((payment: Payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.assignments?.missions?.title || 'Mission sans titre'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payment.assignments?.missions?.campaigns?.title || 'Campagne inconnue'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      €{payment.payable_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">Aucun paiement pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

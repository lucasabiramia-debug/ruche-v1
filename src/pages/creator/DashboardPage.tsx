import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getApplicationsByCreator } from '@/services/applications'
import { getAssignmentsByCreator } from '@/services/assignments'
import { getPaymentSummary } from '@/services/payments'
import { getCreatorProfile } from '@/services/creator-profiles'
import { computeCreatorStats } from '@/lib/dashboard-stats'
import { computeCreatorNextAction } from '@/lib/next-action'
import { CopilotCard } from '@/components/CopilotCard'
import { StatStrip } from '@/components/StatStrip'

export function CreatorDashboardPage() {
  const { user } = useAuth()

  const profileQuery = useQuery({
    queryKey: ['creator-profile'],
    queryFn: () => getCreatorProfile(user!.id),
    enabled: !!user,
  })

  const applicationsQuery = useQuery({
    queryKey: ['creator-applications'],
    queryFn: () => getApplicationsByCreator(user!.id),
    enabled: !!user,
  })

  const assignmentsQuery = useQuery({
    queryKey: ['creator-assignments'],
    queryFn: () => getAssignmentsByCreator(user!.id),
    enabled: !!user,
  })

  const paymentSummaryQuery = useQuery({
    queryKey: ['creator-payment-summary'],
    queryFn: () => getPaymentSummary(user!.id),
    enabled: !!user,
  })

  const isLoading =
    profileQuery.isLoading ||
    applicationsQuery.isLoading ||
    assignmentsQuery.isLoading ||
    paymentSummaryQuery.isLoading

  const stats = computeCreatorStats({
    applications: applicationsQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    paymentSummary: paymentSummaryQuery.data ?? null,
  })

  const nextAction = computeCreatorNextAction({
    hasProfile: !!profileQuery.data,
    pendingApplications: stats.pendingApplications,
    activeAssignments: stats.activeAssignments,
    completedAssignments: stats.completedAssignments,
    totalPending: stats.totalPending,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour 👋</h1>

      <CopilotCard action={nextAction} isLoading={isLoading} />

      <StatStrip
        isLoading={isLoading}
        items={[
          {
            label: 'Candidatures en attente',
            value: stats.pendingApplications,
            to: '/creator/missions',
          },
          {
            label: 'Missions en cours',
            value: stats.activeAssignments,
            to: '/creator/assignments',
          },
          {
            label: 'Missions terminées',
            value: stats.completedAssignments,
            to: '/creator/assignments',
          },
          {
            label: 'Revenus totaux',
            value: `€${stats.totalEarned.toLocaleString()}`,
            to: '/creator/earnings',
          },
        ]}
      />
    </div>
  )
}

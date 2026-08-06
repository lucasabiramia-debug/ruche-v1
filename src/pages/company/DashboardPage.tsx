import { useQuery } from '@tanstack/react-query'
import { listCampaigns } from '@/services/missions'
import { computeCompanyStats } from '@/lib/dashboard-stats'
import { computeCompanyNextAction } from '@/lib/next-action'
import { CopilotCard } from '@/components/CopilotCard'
import { StatStrip } from '@/components/StatStrip'

export function CompanyDashboardPage() {
  const campaignsQuery = useQuery({
    queryKey: ['company-campaigns'],
    queryFn: () => listCampaigns(),
  })

  const stats = computeCompanyStats(campaignsQuery.data ?? [])

  const nextAction = computeCompanyNextAction({
    totalCampaigns: stats.totalCampaigns,
    activeCampaigns: stats.activeCampaigns,
    draftCampaigns: stats.draftCampaigns,
    totalMissions: stats.totalMissions,
    publishedMissions: stats.publishedMissions,
  })

  if (campaignsQuery.error) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg bg-red-100 p-4 text-red-800">
        Erreur lors du chargement — réessaie dans un instant.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour 👋</h1>

      <CopilotCard action={nextAction} isLoading={campaignsQuery.isLoading} />

      <StatStrip
        isLoading={campaignsQuery.isLoading}
        items={[
          {
            label: 'Campagnes actives',
            value: stats.activeCampaigns,
            to: '/company/campaigns',
          },
          {
            label: 'Missions publiées',
            value: `${stats.publishedMissions}/${stats.totalMissions}`,
            to: '/company/campaigns',
          },
          {
            label: 'Brouillons',
            value: stats.draftCampaigns,
            to: '/company/campaigns',
          },
          {
            label: 'Budget engagé',
            value: `€${stats.totalBudget.toLocaleString()}`,
            to: '/company/campaigns',
          },
        ]}
      />
    </div>
  )
}

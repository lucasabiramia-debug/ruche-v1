import { useNavigate } from 'react-router-dom'
import type { NextAction } from '@/lib/next-action'

interface CopilotCardProps {
  action: NextAction
  isLoading?: boolean
}

// The one thing to do next, front and center.
export function CopilotCard({ action, isLoading }: CopilotCardProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="h-44 animate-pulse rounded-2xl bg-ruche-100"></div>
  }

  return (
    <section className="rounded-2xl border border-ruche-200 bg-gradient-to-br from-ruche-50 to-white p-6 sm:p-8">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ruche-700">
        <span aria-hidden>✨</span> Copilote Ruche — ta prochaine étape
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span aria-hidden className="text-4xl">{action.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{action.title}</h2>
            <p className="mt-1 max-w-xl text-gray-600">{action.reason}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(action.to)}
          className="shrink-0 rounded-lg bg-ruche-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-ruche-600 transition-colors"
        >
          {action.cta} →
        </button>
      </div>
    </section>
  )
}

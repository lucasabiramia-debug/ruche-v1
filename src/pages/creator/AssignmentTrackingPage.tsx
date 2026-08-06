import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAssignmentById } from '@/services/assignments'
import { getBriefByAssignment } from '@/services/briefs'
import { getProofsByAssignment } from '@/services/proofs'
import { getPaymentsByAssignment } from '@/services/payments'
import { computeCollaborationTracking } from '@/lib/collaboration-tracker'

export function AssignmentTrackingPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()

  const assignmentQuery = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => getAssignmentById(assignmentId!),
    enabled: !!assignmentId,
  })

  const briefQuery = useQuery({
    queryKey: ['assignment-brief', assignmentId],
    queryFn: () => getBriefByAssignment(assignmentId!),
    enabled: !!assignmentId,
  })

  const proofsQuery = useQuery({
    queryKey: ['assignment-proofs', assignmentId],
    queryFn: () => getProofsByAssignment(assignmentId!),
    enabled: !!assignmentId,
  })

  const paymentQuery = useQuery({
    queryKey: ['assignment-payment', assignmentId],
    queryFn: () => getPaymentsByAssignment(assignmentId!),
    enabled: !!assignmentId,
  })

  const isLoading =
    assignmentQuery.isLoading ||
    briefQuery.isLoading ||
    proofsQuery.isLoading ||
    paymentQuery.isLoading

  const assignment = assignmentQuery.data as any

  if (!assignmentId) {
    return <div>Assignment ID missing</div>
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-200"></div>
      </div>
    )
  }

  if (assignmentQuery.error || !assignment) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-red-100 p-4 text-red-800">
        Mission introuvable
      </div>
    )
  }

  const tracking = computeCollaborationTracking({
    assignmentStatus: assignment.assignment_status,
    hasBrief: !!briefQuery.data,
    proofStatuses: ((proofsQuery.data as any[]) ?? []).map((p) => p.status),
    paymentStatus: (paymentQuery.data as any)?.status ?? null,
  })

  const actionTarget = {
    brief: `/creator/assignments/${assignmentId}/brief`,
    proof: `/creator/assignments/${assignmentId}/proof`,
    earnings: '/creator/earnings',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/creator/assignments')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Mes missions
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {assignment.missions?.title ?? 'Ma mission'}
        </h1>
        <p className="mt-1 text-gray-600">
          {assignment.missions?.campaigns?.title
            ? `Campagne ${assignment.missions.campaigns.title} · `
            : ''}
          €{assignment.agreed_budget?.toLocaleString()}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Avancement</span>
          <span className="font-semibold text-ruche-700">{tracking.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-ruche-500 transition-all"
            style={{ width: `${tracking.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Uber-style timeline */}
      <ol className="relative space-y-0">
        {tracking.steps.map((step, index) => (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector line */}
            {index < tracking.steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 h-full w-0.5 ${
                  step.state === 'done' ? 'bg-ruche-400' : 'bg-gray-200'
                }`}
              ></span>
            )}

            {/* Dot */}
            <span
              aria-hidden
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step.state === 'done'
                  ? 'bg-ruche-500 text-white'
                  : step.state === 'current'
                    ? 'border-2 border-ruche-500 bg-white text-ruche-600 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]'
                    : 'border-2 border-gray-200 bg-white text-gray-400'
              }`}
            >
              {step.state === 'done' ? '✓' : index + 1}
            </span>

            {/* Content */}
            <div className={step.state === 'upcoming' ? 'opacity-50' : ''}>
              <p
                className={`font-semibold ${
                  step.state === 'current' ? 'text-ruche-800' : 'text-gray-900'
                }`}
              >
                {step.label}
                {step.state === 'current' && (
                  <span className="ml-2 rounded-full bg-ruche-100 px-2 py-0.5 text-xs font-medium text-ruche-800">
                    En cours
                  </span>
                )}
              </p>
              {step.state === 'current' && (
                <p className="mt-1 text-sm text-gray-600">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* The one next action */}
      {tracking.nextAction && (
        <button
          onClick={() => navigate(actionTarget[tracking.nextAction!.targetKey])}
          className="w-full rounded-lg bg-ruche-500 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-ruche-600 transition-colors"
        >
          {tracking.nextAction.label} →
        </button>
      )}

      {tracking.progress === 100 && (
        <div className="rounded-2xl bg-gradient-to-br from-ruche-50 to-white border border-ruche-200 p-6 text-center">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 font-semibold text-gray-900">Collaboration terminée et payée !</p>
          <button
            onClick={() => navigate('/creator/missions')}
            className="mt-4 rounded-lg bg-ruche-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ruche-600"
          >
            Trouver ma prochaine mission
          </button>
        </div>
      )}
    </div>
  )
}

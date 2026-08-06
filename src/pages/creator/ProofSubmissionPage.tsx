import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getAssignmentById } from '@/services/assignments'
import { submitProof } from '@/services/proofs'
import { ProofSubmissionForm } from '@/components/ProofSubmissionForm'
import type { SubmitProofInput } from '@/schemas/collaboration'

interface Assignment {
  id: string
  mission_id: string
  agreed_budget: number
  assignment_status: string
  missions?: {
    id: string
    title: string
  }
}

export function ProofSubmissionPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const assignmentQuery = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => getAssignmentById(assignmentId!),
    enabled: !!assignmentId,
  })

  const submitMutation = useMutation({
    mutationFn: (data: SubmitProofInput) =>
      submitProof({
        assignmentId: assignmentId!,
        creatorId: user!.id,
        proofType: data.proofType,
        publicContentUrl: data.publicContentUrl || undefined,
        filePath: data.filePath || undefined,
        statisticsFilePath: data.statisticsFilePath || undefined,
      }),
    onSuccess: () => {
      navigate('/creator/assignments')
    },
  })

  if (!assignmentId) {
    return <div>Assignment ID missing</div>
  }

  const assignment = assignmentQuery.data as Assignment | undefined

  if (assignmentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-64 rounded bg-gray-200 animate-pulse"></div>
      </div>
    )
  }

  if (assignmentQuery.error || !assignment) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-red-800">
        Mission assignée non trouvée
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Soumettre du contenu</h1>
        <p className="mt-2 text-gray-600">
          Mission: <strong>{assignment.missions?.title}</strong>
        </p>
      </div>

      {/* Mission Info Card */}
      <div className="rounded-lg bg-blue-50 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">Statut de la mission</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {assignment.assignment_status.replace('_', ' ').charAt(0).toUpperCase() +
                assignment.assignment_status.replace('_', ' ').slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget convenu</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              €{assignment.agreed_budget.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Détails de la preuve</h2>
        <ProofSubmissionForm
          assignmentId={assignmentId}
          onSubmit={async (data) => {
            await submitMutation.mutateAsync(data)
          }}
          isLoading={submitMutation.isPending}
        />
        {submitMutation.error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
            Erreur lors de la soumission de la preuve
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        <p className="font-medium">Conseils pour la soumission:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Assurez-vous que le contenu est conforme au brief fourni</li>
          <li>Incluez tous les codes de suivi obligatoires</li>
          <li>Vérifiez que le contenu contient toutes les mentions obligatoires</li>
          <li>Évitez les affirmations interdites</li>
        </ul>
      </div>
    </div>
  )
}

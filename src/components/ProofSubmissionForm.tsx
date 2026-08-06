import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { submitProofSchema, type SubmitProofInput } from '@/schemas/collaboration'

interface ProofSubmissionFormProps {
  assignmentId: string
  onSubmit: (data: SubmitProofInput) => Promise<void>
  isLoading?: boolean
}

export function ProofSubmissionForm({ onSubmit, isLoading }: ProofSubmissionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubmitProofInput>({
    resolver: zodResolver(submitProofSchema),
  })

  const proofType = watch('proofType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Type de preuve</label>
        <select
          {...register('proofType')}
          className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
          disabled={isLoading}
        >
          <option value="">Sélectionnez un type</option>
          <option value="video">Vidéo</option>
          <option value="image">Image</option>
          <option value="article">Article</option>
          <option value="social_post">Publication sur réseau social</option>
          <option value="other">Autre</option>
        </select>
        {errors.proofType && <p className="mt-1 text-sm text-red-600">{errors.proofType.message}</p>}
      </div>

      {proofType && (
        <>
          <div>
            <label className="block text-sm font-medium">
              URL publique {proofType === 'video' ? '(YouTube, Vimeo, etc.)' : ''}
            </label>
            <input
              {...register('publicContentUrl')}
              type="url"
              className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
              placeholder="https://..."
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lien vers le contenu (vidéo YouTube, article, post Instagram, etc.)
            </p>
            {errors.publicContentUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.publicContentUrl.message}</p>
            )}
          </div>

          {proofType !== 'social_post' && (
            <div>
              <label className="block text-sm font-medium">Fichier (optionnel)</label>
              <input
                {...register('filePath')}
                type="text"
                className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
                placeholder="ex: s3://bucket/video.mp4 ou chemin local"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Chemin d'accès au fichier brut (si différent de l'URL publique)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Statistiques (optionnel)</label>
            <input
              {...register('statisticsFilePath')}
              type="text"
              className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
              placeholder="ex: fichier CSV avec vues, engagement, etc."
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Feuille de données CSV ou PDF avec les statistiques (vues, engagement, clics, etc.)
            </p>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading || !proofType}
        className="w-full rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Envoi...' : 'Soumettre la preuve'}
      </button>
    </form>
  )
}

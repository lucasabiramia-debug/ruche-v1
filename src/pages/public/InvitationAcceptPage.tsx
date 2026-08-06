import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptInvitationSchema } from '@/schemas/invitations'
import { verifyInvitationToken, acceptInvitation } from '@/services/invitations'
import { supabase } from '@/integrations/supabase/client'

export function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [invitationData, setInvitationData] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [verifyError, setVerifyError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(acceptInvitationSchema),
  })

  // Verify invitation token on mount
  useEffect(() => {
    if (!token) {
      setVerifyError('Lien d\'invitation invalide')
      setIsVerifying(false)
      return
    }

    verifyInvitationToken(token)
      .then((data) => {
        setInvitationData(data)
        setIsVerifying(false)
      })
      .catch((err) => {
        setVerifyError(err.message || 'Lien d\'invitation invalide ou expiré')
        setIsVerifying(false)
      })
  }, [token])

  const onSubmit = async (data: any) => {
    if (!token) return

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Accept invitation and create organization_member
      await acceptInvitation(token, authData.user.id)

      // Redirect to dashboard
      navigate('/creator/dashboard')
    } catch (err: any) {
      setVerifyError(err.message || 'Erreur lors de l\'acceptation')
    }
  }

  if (isVerifying) {
    return <div className="flex h-screen items-center justify-center">Vérification...</div>
  }

  if (verifyError) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-lg bg-red-100 p-4 text-red-800">{verifyError}</div>
        <a href="/" className="text-blue-600 hover:underline">
          Retourner à l'accueil
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créer mon compte</h1>
        <p className="mt-2 text-gray-600">Invitation pour: {invitationData?.email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <input
            {...register('first_name')}
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isSubmitting}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input
            {...register('last_name')}
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isSubmitting}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 w-full rounded border border-gray-300 px-4 py-2"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}

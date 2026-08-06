import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMutation } from '@tanstack/react-query'
import { createInvitation } from '@/services/invitations'
import { createInvitationSchema } from '@/schemas/invitations'

export function InvitationsPage() {
  const { user, organizationId } = useAuth()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('creator')
  const [expiresIn, setExpiresIn] = useState('7') // days
  const [error, setError] = useState('')
  const [successToken, setSuccessToken] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!organizationId || !user) throw new Error('Not authenticated')

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn))

      const result = await createInvitation(
        organizationId,
        {
          email,
          invited_role: role as any,
          expires_at: expiresAt.toISOString(),
        },
        user.id,
      )

      setSuccessToken(result.token)
      setEmail('')
      return result
    },
    onError: (err: any) => {
      setError(err.message || 'Erreur lors de l\'invitation')
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inviter un créateur</h1>

      <div className="rounded-lg border border-gray-200 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError('')
            mutation.mutate()
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-red-800">{error}</div>
          )}

          {successToken && (
            <div className="rounded-lg bg-green-100 p-4 text-green-800">
              <p className="font-semibold">Invitation créée ! 🎉</p>
              <p className="mt-2 text-sm">Partage ce lien avec le créateur:</p>
              <code className="mt-2 block break-all rounded bg-gray-100 p-2 text-xs">
                {window.location.origin}/invitation/{successToken}
              </code>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
              disabled={mutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              disabled={mutation.isPending}
            >
              <option value="creator">Créateur</option>
              <option value="organization_member">Collaborateur</option>
              <option value="organization_admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Expire dans (jours)</label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              min="1"
              max="365"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              disabled={mutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Envoi...' : 'Créer l\'invitation'}
          </button>
        </form>
      </div>
    </div>
  )
}

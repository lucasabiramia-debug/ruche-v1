import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/components/AuthProvider'

const ROLES: Array<{
  value: Exclude<UserRole, 'admin'>
  emoji: string
  title: string
  description: string
}> = [
  {
    value: 'creator',
    emoji: '🎨',
    title: 'Créateur de contenu',
    description: 'Je crée du contenu et je veux collaborer avec des marques',
  },
  {
    value: 'company',
    emoji: '🏢',
    title: 'Organisation',
    description: 'Je représente une marque, une école ou une entreprise',
  },
]

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [role, setRole] = useState<Exclude<UserRole, 'admin'> | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!role) {
      setError('Choisis d’abord ton profil ci-dessus')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, role)
      toast.success('Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.')
      navigate('/auth/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Rejoindre la ruche 🐝</h1>
        <p className="mt-2 text-gray-600">Deux minutes, et c’est parti.</p>
      </div>

      {/* Role picker — the first, most important choice */}
      <div className="grid gap-3">
        {ROLES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
              role === option.value
                ? 'border-ruche-500 bg-ruche-50'
                : 'border-gray-200 bg-white hover:border-ruche-300'
            }`}
          >
            <span aria-hidden className="text-3xl">{option.emoji}</span>
            <span>
              <span className="block font-semibold text-gray-900">{option.title}</span>
              <span className="mt-0.5 block text-sm text-gray-600">{option.description}</span>
            </span>
            <span
              aria-hidden
              className={`ml-auto mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${
                role === option.value ? 'border-ruche-500 bg-ruche-500' : 'border-gray-300'
              }`}
            >
              {role === option.value && <span className="block text-center text-xs leading-4 text-white">✓</span>}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg bg-red-100 p-4 text-sm text-red-800">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-ruche-500 focus:outline-none"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-ruche-500 focus:outline-none"
            required
            minLength={8}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">8 caractères minimum</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-ruche-500 focus:outline-none"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-ruche-500 px-4 py-3 font-semibold text-white hover:bg-ruche-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Déjà un compte ?{' '}
        <Link to="/auth/signin" className="font-semibold text-ruche-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const role = await signIn(email, password)
      // Route each role to its own home
      navigate(role === 'company' ? '/company/dashboard' : '/creator/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Bon retour 🐝</h1>
        <p className="mt-2 text-gray-600">Connecte-toi à ton espace Ruche.</p>
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
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-ruche-500 px-4 py-3 font-semibold text-white hover:bg-ruche-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/auth/signup" className="font-semibold text-ruche-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

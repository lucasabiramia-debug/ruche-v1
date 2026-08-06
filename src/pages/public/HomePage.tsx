import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">Ruche</h1>
        <p className="mt-4 text-xl text-gray-600">
          La plateforme qui connecte les créateurs aux organisations
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          to="/auth/signup"
          className="rounded-lg border-2 border-blue-600 p-6 text-center hover:bg-blue-50"
        >
          <h2 className="text-2xl font-bold text-blue-600">Devenir créateur</h2>
          <p className="mt-2 text-gray-600">Rejoins notre plateforme et gagne en collaborant</p>
        </Link>

        <Link
          to="/auth/signin"
          className="rounded-lg border-2 border-gray-300 p-6 text-center hover:bg-gray-50"
        >
          <h2 className="text-2xl font-bold text-gray-900">Se connecter</h2>
          <p className="mt-2 text-gray-600">Accès à ton compte Ruche</p>
        </Link>
      </section>
    </div>
  )
}

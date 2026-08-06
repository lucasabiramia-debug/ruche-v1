import { Link } from 'react-router-dom'

const STEPS = [
  {
    emoji: '📢',
    title: 'La marque publie',
    text: 'Une campagne avec des missions claires : brief, budget, critères.',
  },
  {
    emoji: '✋',
    title: 'Le créateur postule',
    text: 'Avec son tarif, en quelques clics, sur les missions qui lui correspondent.',
  },
  {
    emoji: '🎬',
    title: 'Le contenu est créé',
    text: 'Brief détaillé, mentions obligatoires, codes de suivi : tout est cadré.',
  },
  {
    emoji: '💸',
    title: 'Le paiement suit',
    text: 'Preuve validée, paiement tracé. Chacun voit où il en est.',
  },
]

export function HomePage() {
  return (
    <div className="space-y-20 py-8">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="inline-block rounded-full bg-ruche-100 px-4 py-1 text-sm font-semibold text-ruche-800">
          🐝 Créateurs × Organisations
        </p>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
          Des collaborations qui
          <span className="text-ruche-600"> rapportent</span>, sans friction
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          Ruche connecte les créateurs de contenu aux marques : missions cadrées, briefs
          clairs, preuves validées, paiements suivis.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth/signup"
            className="rounded-lg bg-ruche-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-ruche-600 transition-colors"
          >
            Commencer gratuitement
          </Link>
          <Link
            to="/auth/signin"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Two audiences */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-ruche-200 bg-ruche-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">🎨 Vous créez du contenu ?</h2>
          <ul className="mt-4 space-y-3 text-gray-700">
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Des missions adaptées à votre profil et vos plateformes
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Vous proposez votre tarif, la marque valide
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Briefs clairs : vous savez exactement quoi produire
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Suivi transparent de vos revenus
            </li>
          </ul>
          <Link
            to="/auth/signup"
            className="mt-6 inline-block rounded-lg bg-ruche-500 px-5 py-2.5 font-semibold text-white hover:bg-ruche-600 transition-colors"
          >
            Devenir créateur
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-bold text-gray-900">🏢 Vous êtes une organisation ?</h2>
          <ul className="mt-4 space-y-3 text-gray-700">
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Lancez des campagnes avec budget maîtrisé
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Recevez des candidatures qualifiées avec tarifs
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Cadrez le contenu : mentions, interdictions, droits
            </li>
            <li className="flex gap-2">
              <span className="text-ruche-600">✓</span> Validez les preuves avant tout paiement
            </li>
          </ul>
          <Link
            to="/auth/signin"
            className="mt-6 inline-block rounded-lg border border-gray-400 px-5 py-2.5 font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Accéder à mon espace
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-center text-3xl font-bold text-gray-900">Comment ça marche</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative rounded-xl border border-gray-200 bg-white p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-ruche-500 px-2.5 py-0.5 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-3xl">{step.emoji}</p>
              <h3 className="mt-3 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-2xl bg-ruche-500 p-10 text-center">
        <h2 className="text-3xl font-bold text-white">Prêt à rejoindre la ruche ?</h2>
        <p className="mt-3 text-ruche-50">
          Créez votre compte en deux minutes, la première mission n'attend que vous.
        </p>
        <Link
          to="/auth/signup"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-ruche-700 hover:bg-ruche-50 transition-colors"
        >
          Créer mon compte
        </Link>
      </section>
    </div>
  )
}

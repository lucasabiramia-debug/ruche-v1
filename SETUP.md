# Guide de démarrage — Ruche V1

Checklist pour passer du code à une application qui tourne. Compte 20–30 minutes.

## 1. Créer le projet Supabase (~5 min)

1. Va sur [supabase.com/dashboard](https://supabase.com/dashboard) et connecte-toi
2. **New project** → choisis un nom (ex. `ruche-v1`), un mot de passe base de données solide (note-le), et la région **West EU (Paris)**
3. Attends que le projet finisse de se provisionner (~2 min)

## 2. Configurer les variables d'environnement (~2 min)

```bash
cp .env.example .env.local
```

Dans le dashboard Supabase : **Settings → API**, puis recopie dans `.env.local` :

- `VITE_SUPABASE_URL` = Project URL (ex. `https://abcdefgh.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` = la clé `anon public`
- `SUPABASE_SERVICE_ROLE_KEY` = la clé `service_role` (utile plus tard pour les seeds — ne jamais la mettre côté client)

`.env.local` est ignoré par git : les clés ne partiront jamais dans le dépôt.

## 3. Exécuter les migrations (~5 min)

Les 5 fichiers sont dans `supabase/migrations/`, à exécuter **dans l'ordre** :

1. `20240801000000_initial_schema.sql`
2. `20240801000001_campaigns_invitations.sql`
3. `20240801000002_applications_assignments.sql`
4. `20240801000003_briefs_proofs_payments.sql`
5. `20240801000004_tracking_audit_notifications.sql`

**Option A — SQL Editor (le plus simple)** : dans le dashboard, **SQL Editor → New query**, colle le contenu du premier fichier, **Run**, puis répète pour les 4 suivants.

**Option B — CLI Supabase** :

```bash
npx supabase login
npx supabase link --project-ref <ton-project-ref>
npx supabase db push
```

## 4. Générer les types TypeScript (~2 min)

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

Puis dans `src/integrations/supabase/client.ts`, réactive le typage fort (le commentaire dans le fichier indique quoi faire) :

```ts
import type { Database } from '@/types/supabase'
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

Vérifie que tout compile encore : `npm run type-check`. S'il y a des erreurs, c'est que le schéma réel et le code divergent quelque part — c'est justement l'intérêt de cette étape.

## 5. Lancer en local (~1 min)

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173

## 6. Parcours de test conseillé

1. **Inscription** : crée un compte via `/auth/signup`
2. **Côté entreprise** : `/company/campaigns` → crée une campagne → ouvre-la → ajoute une mission → publie-la
3. **Côté créateur** : `/creator/onboarding` (profil en 6 étapes) → `/creator/missions` → postule à la mission avec un tarif
4. **Retour entreprise** : `/company/applications` → approuve la candidature
5. **Retour créateur** : `/creator/assignments` → consulte le brief → soumets une preuve
6. **Paiements** : `/creator/earnings` pour le suivi côté créateur

## Commandes utiles

| Commande             | Effet                          |
| -------------------- | ------------------------------ |
| `npm run dev`        | Serveur de développement       |
| `npm run build`      | Build de production            |
| `npm run type-check` | Vérification TypeScript        |
| `npm run lint`       | ESLint                         |
| `npm test`           | Tests unitaires (vitest)       |

La CI GitHub Actions (`.github/workflows/ci.yml`) exécute lint + type-check + tests + build sur chaque push/PR.

## En cas de problème

- **« Missing Supabase environment variables »** au lancement → `.env.local` absent ou clés vides (étape 2)
- **Erreurs 401/403 sur les requêtes** → RLS actif sans session : vérifie que tu es bien connecté, ou que les policies des migrations sont passées (étape 3)
- **`relation "..." does not exist`** → une migration a été sautée ou exécutée dans le désordre (étape 3)

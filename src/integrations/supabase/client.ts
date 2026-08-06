import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please check .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

// Untyped until real types are generated from the provisioned project:
//   supabase gen types typescript --linked > src/types/supabase.ts
// then restore: createClient<Database>(supabaseUrl, supabaseAnonKey)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

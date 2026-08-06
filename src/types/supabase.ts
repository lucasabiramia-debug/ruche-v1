// Generated types from Supabase schema
// Run: supabase gen types typescript --linked > src/types/supabase.ts
// https://supabase.com/docs/guides/cli/managing-types

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          is_demo_org: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      creator_profiles: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          bio: string | null
          avatar_url: string | null
          profile_status: 'incomplete' | 'pending_review' | 'verified' | 'changes_requested' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['creator_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['creator_profiles']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          status: 'draft' | 'active' | 'paused' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

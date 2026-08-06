import React, { createContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'creator' | 'company' | 'admin'

export interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  role: UserRole | null
  organizationId: string | null
  signUp: (email: string, password: string, role: UserRole) => Promise<void>
  signIn: (email: string, password: string) => Promise<UserRole | null>
  signOut: () => Promise<void>
}

function roleFromUser(user: User | null): UserRole | null {
  const role = user?.user_metadata?.role
  return role === 'creator' || role === 'company' || role === 'admin' ? role : null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(roleFromUser(session?.user ?? null))
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(roleFromUser(session?.user ?? null))
      setIsLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, role: UserRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Role travels in user metadata so the app can route immediately
        data: { role },
      },
    })
    if (error) throw error
  }

  const signIn = async (email: string, password: string): Promise<UserRole | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return roleFromUser(data.user)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setRole(null)
    setOrganizationId(null)
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    role,
    organizationId,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

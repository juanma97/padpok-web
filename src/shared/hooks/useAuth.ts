'use client'

import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/infrastructure/database/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({ ...prev, error, loading: false }))
          return
        }

        console.log('Initial session:', session?.user?.email || 'No user')
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        })
      } catch (err) {
        console.error('Unexpected error getting session:', err)
        setAuthState(prev => ({ 
          ...prev, 
          error: err as AuthError, 
          loading: false 
        }))
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'No user')
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Función para iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setAuthState(prev => ({ ...prev, error, loading: false }))
      return { user: null, error }
    }

    return { user: data.user, error: null }
  }

  // Función para registrarse
  const signUp = async (email: string, password: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      setAuthState(prev => ({ ...prev, error, loading: false }))
      return { user: null, error }
    }

    return { user: data.user, error: null }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthState(prev => ({ ...prev, error, loading: false }))
      return { error }
    }

    setAuthState({
      user: null,
      session: null,
      loading: false,
      error: null
    })

    return { error: null }
  }

  // Función para resetear contraseña
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    return { error }
  }

  // Función para actualizar contraseña
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    return { error }
  }

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      setAuthState(prev => ({ ...prev, error, loading: false }))
      return { error }
    }

    return { data, error: null }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    isAuthenticated: !!authState.user
  }
}

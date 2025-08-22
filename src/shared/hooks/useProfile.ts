'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/infrastructure/database/supabase'
import { Profile, ProfileInsert } from '@/shared/types/database'
import { useAuth } from './useAuth'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null
}

export const useProfile = () => {
  const { user } = useAuth()
  const [profileState, setProfileState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
    } else {
      setProfileState({ profile: null, loading: false, error: null })
    }
  }, [user])

  const fetchProfile = async (userId: string) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        setProfileState({
          profile: null,
          loading: false,
          error: error.message
        })
        return
      }

      setProfileState({
        profile: data,
        loading: false,
        error: null
      })
    } catch (err) {
      setProfileState({
        profile: null,
        loading: false,
        error: 'Error inesperado al cargar el perfil'
      })
    }
  }

  const createProfile = async (profileData: ProfileInsert) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { profile: null, error: error.message }
      }

      setProfileState({
        profile: data,
        loading: false,
        error: null
      })

      return { profile: data, error: null }
    } catch (err) {
      const errorMessage = 'Error inesperado al crear el perfil'
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { profile: null, error: errorMessage }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { profile: null, error: 'Usuario no autenticado' }
    }

    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { profile: null, error: error.message }
      }

      setProfileState({
        profile: data,
        loading: false,
        error: null
      })

      return { profile: data, error: null }
    } catch (err) {
      const errorMessage = 'Error inesperado al actualizar el perfil'
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { profile: null, error: errorMessage }
    }
  }

  const deleteProfile = async () => {
    if (!user) {
      return { error: 'Usuario no autenticado' }
    }

    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) {
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
        return { error: error.message }
      }

      setProfileState({
        profile: null,
        loading: false,
        error: null
      })

      return { error: null }
    } catch (err) {
      const errorMessage = 'Error inesperado al eliminar el perfil'
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { error: errorMessage }
    }
  }

  return {
    ...profileState,
    createProfile,
    updateProfile,
    deleteProfile,
    refetch: () => user ? fetchProfile(user.id) : null
  }
}

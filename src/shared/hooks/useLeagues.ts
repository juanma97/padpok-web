'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { LeagueService } from '@/backend/leagueService'
import { UserService } from '@/backend/userService'
import type { League } from '@/backend/database'

interface LeaguesState {
  leagues: League[]
  loading: boolean
  error: string | null
}

export const useLeagues = () => {
  const { user } = useAuth()
  const [state, setState] = useState<LeaguesState>({
    leagues: [],
    loading: false,
    error: null
  })

  const loadUserLeagues = useCallback(async () => {
    if (!user) {
      setState({ leagues: [], loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Obtener el ID del usuario en nuestra tabla
      const { user: userRecord, error: userError } = await UserService.getUserByAuthId(user.id)
      
      if (userError || !userRecord) {
        setState({ leagues: [], loading: false, error: 'No se pudo encontrar el perfil del usuario' })
        return
      }

      // Obtener las ligas del usuario
      const { leagues, error: leaguesError } = await LeagueService.getUserLeagues(userRecord.id)

      if (leaguesError) {
        setState({ leagues: [], loading: false, error: leaguesError })
        return
      }

      setState({ leagues: leagues as League[], loading: false, error: null })
    } catch (err) {
      console.error('Error loading user leagues:', err)
      setState({ leagues: [], loading: false, error: 'Error inesperado al cargar las ligas' })
    }
  }, [user])

  // Cargar ligas cuando el usuario cambie
  useEffect(() => {
    loadUserLeagues()
  }, [loadUserLeagues])

  // Función para recargar las ligas manualmente
  const refetchLeagues = () => {
    loadUserLeagues()
  }

  // Función para obtener estadísticas de las ligas
  const getLeagueStats = () => {
    const totalLeagues = state.leagues.length
    const activeLeagues = state.leagues.filter(league => league.status === 'active').length
    const draftLeagues = state.leagues.filter(league => league.status === 'draft').length
    const completedLeagues = state.leagues.filter(league => league.status === 'completed').length
    
    // Calcular total de jugadores (sumando jugadores de todas las ligas)
    const totalPlayers = state.leagues.reduce((total, league) => {
      return total + (Array.isArray(league.players) ? league.players.length : 0)
    }, 0)

    return {
      totalLeagues,
      activeLeagues,
      draftLeagues,
      completedLeagues,
      totalPlayers
    }
  }

  // Función para obtener las ligas más recientes
  const getRecentLeagues = (limit: number = 3) => {
    return state.leagues
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  // Función para obtener ligas por estado
  const getLeaguesByStatus = (status: 'draft' | 'active' | 'completed' | 'cancelled') => {
    return state.leagues.filter(league => league.status === status)
  }

  return {
    ...state,
    refetchLeagues,
    getLeagueStats,
    getRecentLeagues,
    getLeaguesByStatus
  }
}

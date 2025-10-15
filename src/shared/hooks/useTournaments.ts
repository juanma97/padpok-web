'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { TournamentService } from '@/backend/tournamentService'
import { UserService } from '@/backend/userService'
interface TournamentRecord {
  id: string
  creator_id: string
  title: string
  description?: string | null
  date: string
  time: string
  location: string
  format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  player_management: 'manual' | 'link'
  players: any[]
  courts: any[]
  games_per_round: number
  ranking_criteria: 'points' | 'wins'
  sit_out_points: number
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  matches?: any
}

interface TournamentsState {
  tournaments: TournamentRecord[]
  loading: boolean
  error: string | null
}

export const useTournaments = () => {
  const { user } = useAuth()
  const [state, setState] = useState<TournamentsState>({
    tournaments: [],
    loading: false,
    error: null
  })

  const loadUserTournaments = async () => {
    if (!user) {
      setState({ tournaments: [], loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Obtener el ID del usuario en nuestra tabla
      const { user: userRecord, error: userError } = await UserService.getUserByAuthId(user.id)
      
      if (userError || !userRecord) {
        setState({ tournaments: [], loading: false, error: 'No se pudo encontrar el perfil del usuario' })
        return
      }

      // Obtener los torneos del usuario
      const { tournaments, error: tournamentsError } = await TournamentService.getUserTournaments(userRecord.id)

      if (tournamentsError) {
        setState({ tournaments: [], loading: false, error: tournamentsError })
        return
      }

      setState({ tournaments, loading: false, error: null })
    } catch (err) {
      console.error('Error loading user tournaments:', err)
      setState({ tournaments: [], loading: false, error: 'Error inesperado al cargar los torneos' })
    }
  }

  // Cargar torneos cuando el usuario cambie
  useEffect(() => {
    loadUserTournaments()
  }, [user])

  // Función para recargar los torneos manualmente
  const refetchTournaments = () => {
    loadUserTournaments()
  }

  // Función para obtener estadísticas de los torneos
  const getTournamentStats = () => {
    const totalTournaments = state.tournaments.length
    const activeTournaments = state.tournaments.filter(tournament => tournament.status === 'active').length
    const draftTournaments = state.tournaments.filter(tournament => tournament.status === 'draft').length
    const completedTournaments = state.tournaments.filter(tournament => tournament.status === 'completed').length
    
    // Calcular total de jugadores (sumando jugadores de todos los torneos)
    const totalPlayers = state.tournaments.reduce((total, tournament) => {
      return total + (Array.isArray(tournament.players) ? tournament.players.length : 0)
    }, 0)

    return {
      totalTournaments,
      activeTournaments,
      draftTournaments,
      completedTournaments,
      totalPlayers
    }
  }

  // Función para obtener los torneos más recientes
  const getRecentTournaments = (limit: number = 3) => {
    return state.tournaments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  // Función para obtener torneos por estado
  const getTournamentsByStatus = (status: 'draft' | 'active' | 'completed' | 'cancelled') => {
    return state.tournaments.filter(tournament => tournament.status === status)
  }

  return {
    ...state,
    refetchTournaments,
    getTournamentStats,
    getRecentTournaments,
    getTournamentsByStatus
  }
}

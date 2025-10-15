import { supabase } from './supabase'

interface TournamentData {
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
  matches?: any // Cuadro del torneo generado automáticamente
}

interface TournamentRecord extends TournamentData {
  id: string
  created_at: string
  updated_at: string
}

export class TournamentService {
  /**
   * Función auxiliar para parsear JSON de forma segura
   */
  private static safeJsonParse(jsonString: any, defaultValue: any = []): any {
    if (!jsonString || jsonString === '' || jsonString === 'null' || jsonString === '{}') {
      return defaultValue
    }
    
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.warn('Error parsing JSON, using default value:', error)
      return defaultValue
    }
  }
  /**
   * Crea un nuevo torneo en la base de datos
   */
  static async createTournament(tournamentData: TournamentData): Promise<{ tournament: TournamentRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('tournaments')
        .insert({
          ...tournamentData,
          status: tournamentData.status || 'draft',
          players: JSON.stringify(tournamentData.players),
          courts: JSON.stringify(tournamentData.courts),
          matches: tournamentData.matches ? JSON.stringify(tournamentData.matches) : '[]',
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating tournament:', error)
        return { tournament: null, error: error.message }
      }

      // Parsear los campos JSON de vuelta
      const tournament = {
        ...data,
        players: this.safeJsonParse(data.players, []),
        courts: this.safeJsonParse(data.courts, []),
        matches: this.safeJsonParse(data.matches, [])
      } as TournamentRecord

      return { tournament, error: null }
    } catch (err) {
      console.error('Unexpected error creating tournament:', err)
      return { tournament: null, error: 'Error inesperado al crear el torneo' }
    }
  }

  /**
   * Obtiene un torneo por su ID
   */
  static async getTournamentById(id: string): Promise<{ tournament: TournamentRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { tournament: null, error: null }
        }
        console.error('Error fetching tournament by ID:', error)
        return { tournament: null, error: error.message }
      }

      // Parsear los campos JSON
      const tournament = {
        ...data,
        players: this.safeJsonParse(data.players, []),
        courts: this.safeJsonParse(data.courts, []),
        matches: this.safeJsonParse(data.matches, [])
      } as TournamentRecord

      return { tournament, error: null }
    } catch (err) {
      console.error('Unexpected error fetching tournament:', err)
      return { tournament: null, error: 'Error inesperado al obtener el torneo' }
    }
  }

  /**
   * Obtiene todos los torneos de un usuario
   */
  static async getUserTournaments(creatorId: string): Promise<{ tournaments: TournamentRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('tournaments')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user tournaments:', error)
        return { tournaments: [], error: error.message }
      }

      // Parsear los campos JSON para cada torneo
      const tournaments = (data || []).map((tournament: any) => ({
        ...tournament,
        players: this.safeJsonParse(tournament.players, []),
        courts: this.safeJsonParse(tournament.courts, []),
        matches: this.safeJsonParse(tournament.matches, [])
      })) as TournamentRecord[]

      return { tournaments, error: null }
    } catch (err) {
      console.error('Unexpected error fetching user tournaments:', err)
      return { tournaments: [], error: 'Error inesperado al obtener los torneos' }
    }
  }

  /**
   * Actualiza un torneo existente
   */
  static async updateTournament(id: string, updates: Partial<TournamentData>): Promise<{ tournament: TournamentRecord | null; error: string | null }> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      // Convertir arrays a JSON si están presentes
      if (updates.players) {
        updateData.players = JSON.stringify(updates.players)
      }
      if (updates.courts) {
        updateData.courts = JSON.stringify(updates.courts)
      }
      if (updates.matches) {
        updateData.matches = JSON.stringify(updates.matches)
      }

      const { data, error } = await (supabase as any)
        .from('tournaments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating tournament:', error)
        return { tournament: null, error: error.message }
      }

      // Parsear los campos JSON
      const tournament = {
        ...data,
        players: this.safeJsonParse(data.players, []),
        courts: this.safeJsonParse(data.courts, []),
        matches: this.safeJsonParse(data.matches, [])
      } as TournamentRecord

      return { tournament, error: null }
    } catch (err) {
      console.error('Unexpected error updating tournament:', err)
      return { tournament: null, error: 'Error inesperado al actualizar el torneo' }
    }
  }

  /**
   * Elimina un torneo
   */
  static async deleteTournament(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await (supabase as any)
        .from('tournaments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting tournament:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error deleting tournament:', err)
      return { success: false, error: 'Error inesperado al eliminar el torneo' }
    }
  }

  /**
   * Obtiene torneos por estado
   */
  static async getTournamentsByStatus(
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<{ tournaments: TournamentRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('tournaments')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tournaments by status:', error)
        return { tournaments: [], error: error.message }
      }

      // Parsear los campos JSON para cada torneo
      const tournaments = (data || []).map((tournament: any) => ({
        ...tournament,
        players: this.safeJsonParse(tournament.players, []),
        courts: this.safeJsonParse(tournament.courts, []),
        matches: this.safeJsonParse(tournament.matches, [])
      })) as TournamentRecord[]

      return { tournaments, error: null }
    } catch (err) {
      console.error('Unexpected error fetching tournaments by status:', err)
      return { tournaments: [], error: 'Error inesperado al obtener los torneos' }
    }
  }

  /**
   * Cambia el estado de un torneo
   */
  static async updateTournamentStatus(
    id: string,
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<{ tournament: TournamentRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('tournaments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating tournament status:', error)
        return { tournament: null, error: error.message }
      }

      // Parsear los campos JSON
      const tournament = {
        ...data,
        players: this.safeJsonParse(data.players, []),
        courts: this.safeJsonParse(data.courts, []),
        matches: this.safeJsonParse(data.matches, [])
      } as TournamentRecord

      return { tournament, error: null }
    } catch (err) {
      console.error('Unexpected error updating tournament status:', err)
      return { tournament: null, error: 'Error inesperado al actualizar el estado del torneo' }
    }
  }

  /**
   * Obtiene estadísticas de torneos
   */
  static async getTournamentStats(creatorId: string): Promise<{
    totalTournaments: number;
    activeTournaments: number;
    draftTournaments: number;
    completedTournaments: number;
    totalPlayers: number;
  }> {
    try {
      const { tournaments } = await this.getUserTournaments(creatorId)
      
      const totalTournaments = tournaments.length
      const activeTournaments = tournaments.filter(t => t.status === 'active').length
      const draftTournaments = tournaments.filter(t => t.status === 'draft').length
      const completedTournaments = tournaments.filter(t => t.status === 'completed').length
      
      // Calcular total de jugadores (sumando jugadores de todos los torneos)
      const totalPlayers = tournaments.reduce((total, tournament) => {
        return total + (Array.isArray(tournament.players) ? tournament.players.length : 0)
      }, 0)

      return {
        totalTournaments,
        activeTournaments,
        draftTournaments,
        completedTournaments,
        totalPlayers
      }
    } catch (err) {
      console.error('Error calculating tournament stats:', err)
      return {
        totalTournaments: 0,
        activeTournaments: 0,
        draftTournaments: 0,
        completedTournaments: 0,
        totalPlayers: 0
      }
    }
  }
}

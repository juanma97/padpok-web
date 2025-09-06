import { supabase } from './supabase'

interface LeagueData {
  creator_id: string
  title: string
  description?: string | null
  date: string
  time: string
  location: string
  format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
  player_management: 'manual' | 'link'
  players: any[]
  courts: any[]
  scoring_system: '3-1-0' | 'sets'
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  matches?: any[]
}

interface LeagueRecord extends LeagueData {
  id: string
  created_at: string
  updated_at: string
}

export class LeagueService {
  
  /**
   * Parsea campos JSON de forma segura
   */
  private static parseJSONField(field: any, defaultValue: any = []): any {
    if (!field) return defaultValue
    
    // Si ya es el tipo correcto, devolverlo directamente
    if (Array.isArray(field) || (typeof field === 'object' && field !== null)) {
      return field
    }
    
    // Si es string, intentar parsearlo
    if (typeof field === 'string') {
      try {
        // Casos especiales para strings vacíos o inválidos
        if (field === '' || field === 'null' || field === 'undefined') {
          return defaultValue
        }
        if (field === '[]' || field === '{}') {
          return defaultValue
        }
        
        // Intentar parsear JSON válido
        const parsed = JSON.parse(field)
        return parsed !== null ? parsed : defaultValue
      } catch (error) {
        console.warn('Error parsing JSON field:', field, error)
        return defaultValue
      }
    }
    
    return defaultValue
  }

  /**
   * Crea una nueva liga en la base de datos
   */
  static async createLeague(leagueData: LeagueData): Promise<{ league: LeagueRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('leagues')
        .insert({
          ...leagueData,
          status: leagueData.status || 'draft',
          players: JSON.stringify(leagueData.players),
          courts: JSON.stringify(leagueData.courts),
          matches: JSON.stringify(leagueData.matches || []),
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating league:', error)
        return { league: null, error: error.message }
      }

      // Parsear los campos JSON de vuelta
      const league = {
        ...data,
        players: this.parseJSONField(data.players, []),
        courts: this.parseJSONField(data.courts, []),
      } as LeagueRecord

      return { league, error: null }
    } catch (err) {
      console.error('Unexpected error creating league:', err)
      return { league: null, error: 'Error inesperado al crear la liga' }
    }
  }

  /**
   * Obtiene una liga por su ID
   */
  static async getLeagueById(id: string): Promise<{ league: LeagueRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('leagues')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { league: null, error: null }
        }
        console.error('Error fetching league by ID:', error)
        return { league: null, error: error.message }
      }

      console.log('data', data);
      // Parsear los campos JSON
      const league = {
        ...data,
        players: this.parseJSONField(data.players, []),
        courts: this.parseJSONField(data.courts, []),
        matches: this.parseJSONField(data.matches, [])
      } as LeagueRecord

      return { league, error: null }
    } catch (err) {
      console.error('Unexpected error fetching league:', err)
      return { league: null, error: 'Error inesperado al obtener la liga' }
    }
  }

  /**
   * Obtiene todas las ligas de un usuario
   */
  static async getUserLeagues(creatorId: string): Promise<{ leagues: LeagueRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('leagues')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user leagues:', error)
        return { leagues: [], error: error.message }
      }

      // Parsear los campos JSON para cada liga con manejo de errores individual
      const leagues = (data || []).map((league: any) => {
        try {
          return {
            ...league,
            players: this.parseJSONField(league.players, []),
            courts: this.parseJSONField(league.courts, []),
            matches: this.parseJSONField(league.matches, [])
          }
        } catch (error) {
          console.error('Error parsing league:', league.id, {
            players: league.players,
            courts: league.courts,
            matches: league.matches,
            error
          })
          // Devolver liga con campos vacíos si hay error
          return {
            ...league,
            players: [],
            courts: [],
            matches: []
          }
        }
      }) as LeagueRecord[]

      return { leagues, error: null }
    } catch (err) {
      console.error('Unexpected error fetching user leagues:', err)
      return { leagues: [], error: 'Error inesperado al obtener las ligas' }
    }
  }

  /**
   * Actualiza una liga existente
   */
  static async updateLeague(id: string, updates: Partial<LeagueData>): Promise<{ league: LeagueRecord | null; error: string | null }> {
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
        .from('leagues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating league:', error)
        return { league: null, error: error.message }
      }

      // Parsear los campos JSON
      const league = {
        ...data,
        players: this.parseJSONField(data.players, []),
        courts: this.parseJSONField(data.courts, []),
        matches: this.parseJSONField(data.matches, [])
      } as LeagueRecord

      return { league, error: null }
    } catch (err) {
      console.error('Unexpected error updating league:', err)
      return { league: null, error: 'Error inesperado al actualizar la liga' }
    }
  }

  /**
   * Elimina una liga
   */
  static async deleteLeague(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await (supabase as any)
        .from('leagues')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting league:', error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error deleting league:', err)
      return { success: false, error: 'Error inesperado al eliminar la liga' }
    }
  }

  /**
   * Obtiene ligas por estado
   */
  static async getLeaguesByStatus(
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<{ leagues: LeagueRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('leagues')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leagues by status:', error)
        return { leagues: [], error: error.message }
      }

      // Parsear los campos JSON para cada liga
      const leagues = (data || []).map((league: any) => ({
        ...league,
        players: this.parseJSONField(league.players, []),
        courts: this.parseJSONField(league.courts, []),
        matches: this.parseJSONField(league.matches, [])
      })) as LeagueRecord[]

      return { leagues, error: null }
    } catch (err) {
      console.error('Unexpected error fetching leagues by status:', err)
      return { leagues: [], error: 'Error inesperado al obtener las ligas' }
    }
  }

  /**
   * Cambia el estado de una liga
   */
  static async updateLeagueStatus(
    id: string,
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  ): Promise<{ league: LeagueRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('leagues')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating league status:', error)
        return { league: null, error: error.message }
      }

      // Parsear los campos JSON
      const league = {
        ...data,
        players: this.parseJSONField(data.players, []),
        courts: this.parseJSONField(data.courts, []),
        matches: this.parseJSONField(data.matches, [])
      } as LeagueRecord

      return { league, error: null }
    } catch (err) {
      console.error('Unexpected error updating league status:', err)
      return { league: null, error: 'Error inesperado al actualizar el estado de la liga' }
    }
  }
}

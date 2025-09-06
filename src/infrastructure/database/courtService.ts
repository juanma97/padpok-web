import { supabase } from './supabase'

interface CourtData {
  user_id: string
  name: string
  number: string
}

interface CourtRecord extends CourtData {
  id: string
  created_at: string
  updated_at: string
}

export class CourtService {
  /**
   * Crea una nueva pista en la base de datos
   */
  static async createCourt(courtData: CourtData): Promise<{ court: CourtRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('courts')
        .insert({
          ...courtData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating court:', error)
        return { court: null, error: error.message }
      }

      return { court: data as CourtRecord, error: null }
    } catch (err) {
      console.error('Unexpected error creating court:', err)
      return { court: null, error: 'Error inesperado al crear pista' }
    }
  }

  /**
   * Obtiene todas las pistas de un usuario
   */
  static async getUserCourts(userId: string): Promise<{ courts: CourtRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('courts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user courts:', error)
        return { courts: [], error: error.message }
      }

      return { courts: data as CourtRecord[] || [], error: null }
    } catch (err) {
      console.error('Unexpected error fetching user courts:', err)
      return { courts: [], error: 'Error inesperado al obtener las pistas' }
    }
  }

  /**
   * Obtiene una pista por su ID
   */
  static async getCourtById(id: string): Promise<{ court: CourtRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('courts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { court: null, error: null }
        }
        console.error('Error fetching court by ID:', error)
        return { court: null, error: error.message }
      }

      return { court: data as CourtRecord, error: null }
    } catch (err) {
      console.error('Unexpected error fetching court:', err)
      return { court: null, error: 'Error inesperado al obtener pista' }
    }
  }

  /**
   * Actualiza una pista existente
   */
  static async updateCourt(id: string, updates: Partial<Omit<CourtData, 'user_id'>>): Promise<{ court: CourtRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('courts')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating court:', error)
        return { court: null, error: error.message }
      }

      return { court: data as CourtRecord, error: null }
    } catch (err) {
      console.error('Unexpected error updating court:', err)
      return { court: null, error: 'Error inesperado al actualizar pista' }
    }
  }

  /**
   * Elimina una pista
   */
  static async deleteCourt(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await (supabase as any)
        .from('courts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting court:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected error deleting court:', err)
      return { error: 'Error inesperado al eliminar pista' }
    }
  }

  /**
   * Verifica si un nombre y número ya están en uso por otra pista del usuario
   */
  static async isCourtNameTaken(userId: string, name: string, number: string, excludeId?: string): Promise<{ isTaken: boolean; error: string | null }> {
    try {
      let query = (supabase as any)
        .from('courts')
        .select('id')
        .eq('user_id', userId)
        .eq('name', name)
        .eq('number', number)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking court name:', error)
        return { isTaken: false, error: error.message }
      }

      return { isTaken: (data || []).length > 0, error: null }
    } catch (err) {
      console.error('Unexpected error checking court name:', err)
      return { isTaken: false, error: 'Error inesperado al verificar nombre de pista' }
    }
  }
}
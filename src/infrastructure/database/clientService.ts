import { supabase } from './supabase'

interface ClientData {
  user_id: string
  name: string
  phone: string
  email: string
}

interface ClientRecord extends ClientData {
  id: string
  created_at: string
  updated_at: string
}

export class ClientService {
  /**
   * Crea un nuevo cliente en la base de datos
   */
  static async createClient(clientData: ClientData): Promise<{ client: ClientRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('clients')
        .insert({
          ...clientData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating client:', error)
        return { client: null, error: error.message }
      }

      return { client: data as ClientRecord, error: null }
    } catch (err) {
      console.error('Unexpected error creating client:', err)
      return { client: null, error: 'Error inesperado al crear cliente' }
    }
  }

  /**
   * Obtiene todos los clientes de un usuario
   */
  static async getUserClients(userId: string): Promise<{ clients: ClientRecord[]; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user clients:', error)
        return { clients: [], error: error.message }
      }

      return { clients: data as ClientRecord[] || [], error: null }
    } catch (err) {
      console.error('Unexpected error fetching user clients:', err)
      return { clients: [], error: 'Error inesperado al obtener los clientes' }
    }
  }

  /**
   * Obtiene un cliente por su ID
   */
  static async getClientById(id: string): Promise<{ client: ClientRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { client: null, error: null }
        }
        console.error('Error fetching client by ID:', error)
        return { client: null, error: error.message }
      }

      return { client: data as ClientRecord, error: null }
    } catch (err) {
      console.error('Unexpected error fetching client:', err)
      return { client: null, error: 'Error inesperado al obtener cliente' }
    }
  }

  /**
   * Actualiza un cliente existente
   */
  static async updateClient(id: string, updates: Partial<Omit<ClientData, 'user_id'>>): Promise<{ client: ClientRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await (supabase as any)
        .from('clients')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating client:', error)
        return { client: null, error: error.message }
      }

      return { client: data as ClientRecord, error: null }
    } catch (err) {
      console.error('Unexpected error updating client:', err)
      return { client: null, error: 'Error inesperado al actualizar cliente' }
    }
  }

  /**
   * Elimina un cliente
   */
  static async deleteClient(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await (supabase as any)
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting client:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      console.error('Unexpected error deleting client:', err)
      return { error: 'Error inesperado al eliminar cliente' }
    }
  }

  /**
   * Verifica si un email ya está en uso por otro cliente del usuario
   */
  static async isEmailTaken(userId: string, email: string, excludeId?: string): Promise<{ isTaken: boolean; error: string | null }> {
    try {
      let query = (supabase as any)
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .eq('email', email)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking email:', error)
        return { isTaken: false, error: error.message }
      }

      return { isTaken: (data || []).length > 0, error: null }
    } catch (err) {
      console.error('Unexpected error checking email:', err)
      return { isTaken: false, error: 'Error inesperado al verificar email' }
    }
  }
}

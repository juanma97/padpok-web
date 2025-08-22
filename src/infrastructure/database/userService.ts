import { supabase } from './supabase'

interface UserData {
  auth_user_id: string
  email: string
  name: string
  address: string
  phone: string
  contact_email: string
  instagram?: string | null
}

interface UserRecord extends UserData {
  id: string
  registered_at: string
}

export class UserService {
  /**
   * Crea un nuevo usuario en la base de datos
   */
  static async createUser(userData: UserData): Promise<{ user: UserRecord | null; error: string | null }> {
    try {
      const now = new Date().toISOString()
      
      // Usar el cliente no tipado para evitar errores de TypeScript
      const { data, error } = await (supabase as any)
        .from('users')
        .insert({
          ...userData,
          registered_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return { user: null, error: error.message }
      }

      return { user: data as UserRecord, error: null }
    } catch (err) {
      console.error('Unexpected error creating user:', err)
      return { user: null, error: 'Error inesperado al crear usuario' }
    }
  }

  /**
   * Obtiene un usuario por su ID de autenticación de Supabase
   */
  static async getUserByAuthId(authUserId: string): Promise<{ user: UserRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el usuario
          return { user: null, error: null }
        }
        console.error('Error fetching user by auth ID:', error)
        return { user: null, error: error.message }
      }

      return { user: data as UserRecord, error: null }
    } catch (err) {
      console.error('Unexpected error fetching user:', err)
      return { user: null, error: 'Error inesperado al obtener usuario' }
    }
  }

  /**
   * Obtiene un usuario por su ID interno
   */
  static async getUserById(id: string): Promise<{ user: UserRecord | null; error: string | null }> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { user: null, error: null }
        }
        console.error('Error fetching user by ID:', error)
        return { user: null, error: error.message }
      }

      return { user: data as UserRecord, error: null }
    } catch (err) {
      console.error('Unexpected error fetching user:', err)
      return { user: null, error: 'Error inesperado al obtener usuario' }
    }
  }

  /**
   * Verifica si un usuario existe por su ID de autenticación
   */
  static async userExists(authUserId: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single()

      return !error && !!data
    } catch (err) {
      console.error('Error checking if user exists:', err)
      return false
    }
  }
}
// Tipos de base de datos para Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          name: string
          address: string
          phone: string
          contact_email: string
          instagram: string | null
          registered_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          name: string
          address: string
          phone: string
          contact_email: string
          instagram: string | null
          registered_at: string
        }
        Update: {
          id?: string
          auth_user_id: string
          email: string
          name: string
          address: string
          phone: string
          contact_email: string
          instagram: string | null
          registered_at: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {}
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de utilidad para trabajar con las tablas
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Tipos específicos de las tablas
export type User = Tables<'users'>

// Tipos para insertar datos
export type UserInsert = Inserts<'users'>

// Tipos para actualizar datos
export type UserUpdate = Updates<'users'>

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
      leagues: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          date: string
          time: string
          location: string
          format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
          player_management: 'manual' | 'link'
          players: Json
          courts: Json
          scoring_system: '3-1-0' | 'sets'
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          date: string
          time: string
          location: string
          format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
          player_management: 'manual' | 'link'
          players: Json
          courts: Json
          scoring_system: '3-1-0' | 'sets'
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string
          format?: 'all-vs-all' | 'box-league' | 'groups-playoffs'
          player_management?: 'manual' | 'link'
          players?: Json
          courts?: Json
          scoring_system?: '3-1-0' | 'sets'
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tournaments: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          date: string
          time: string
          location: string
          format: 'classic-americano' | 'mixed-americano' | 'team-americano'
          player_management: 'manual' | 'link'
          players: Json
          courts: Json
          games_per_round: number
          ranking_criteria: 'points' | 'wins'
          sit_out_points: number
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          date: string
          time: string
          location: string
          format: 'classic-americano' | 'mixed-americano' | 'team-americano'
          player_management: 'manual' | 'link'
          players: Json
          courts: Json
          games_per_round: number
          ranking_criteria: 'points' | 'wins'
          sit_out_points: number
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string
          format?: 'classic-americano' | 'mixed-americano' | 'team-americano'
          player_management?: 'manual' | 'link'
          players?: Json
          courts?: Json
          games_per_round?: number
          ranking_criteria?: 'points' | 'wins'
          sit_out_points?: number
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      league_format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
      league_status: 'draft' | 'active' | 'completed' | 'cancelled'
      scoring_system: '3-1-0' | 'sets'
      player_management: 'manual' | 'link'
      tournament_format: 'classic-americano' | 'mixed-americano' | 'team-americano'
      tournament_status: 'draft' | 'active' | 'completed' | 'cancelled'
      ranking_criteria: 'points' | 'wins'
    }
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
export type League = Tables<'leagues'>
export type Tournament = Tables<'tournaments'>

// Tipos para insertar datos
export type UserInsert = Inserts<'users'>
export type LeagueInsert = Inserts<'leagues'>
export type TournamentInsert = Inserts<'tournaments'>

// Tipos para actualizar datos
export type UserUpdate = Updates<'users'>
export type LeagueUpdate = Updates<'leagues'>
export type TournamentUpdate = Updates<'tournaments'>

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
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'player' | 'organizer' | 'admin'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'player' | 'organizer' | 'admin'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'player' | 'organizer' | 'admin'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string
          start_date: string
          end_date: string
          max_players: number
          price: number
          payment_type: 'free' | 'online' | 'in_person'
          status: 'draft' | 'published' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id: string
          format: 'single' | 'double' | 'mixed'
          rules: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location: string
          start_date: string
          end_date: string
          max_players: number
          price: number
          payment_type?: 'free' | 'online' | 'in_person'
          status?: 'draft' | 'published' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id: string
          format: 'single' | 'double' | 'mixed'
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string
          start_date?: string
          end_date?: string
          max_players?: number
          price?: number
          payment_type?: 'free' | 'online' | 'in_person'
          status?: 'draft' | 'published' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id?: string
          format?: 'single' | 'double' | 'mixed'
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string
          start_date: string
          end_date: string
          max_players: number
          price: number
          payment_type: 'free' | 'online' | 'in_person'
          status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id: string
          format: 'single' | 'double' | 'mixed'
          rules: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location: string
          start_date: string
          end_date: string
          max_players: number
          price: number
          payment_type?: 'free' | 'online' | 'in_person'
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id: string
          format: 'single' | 'double' | 'mixed'
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string
          start_date?: string
          end_date?: string
          max_players?: number
          price?: number
          payment_type?: 'free' | 'online' | 'in_person'
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
          organizer_id?: string
          format?: 'single' | 'double' | 'mixed'
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          tournament_id: string | null
          league_id: string | null
          partner_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: 'online' | 'in_person' | 'free' | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id?: string | null
          league_id?: string | null
          partner_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: 'online' | 'in_person' | 'free' | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tournament_id?: string | null
          league_id?: string | null
          partner_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: 'online' | 'in_person' | 'free' | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string | null
          league_id: string | null
          player1_id: string
          player2_id: string
          player3_id: string | null
          player4_id: string | null
          round: number
          score: string | null
          winner_id: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time: string | null
          court: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id?: string | null
          league_id?: string | null
          player1_id: string
          player2_id: string
          player3_id?: string | null
          player4_id?: string | null
          round: number
          score?: string | null
          winner_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time?: string | null
          court?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string | null
          league_id?: string | null
          player1_id?: string
          player2_id?: string
          player3_id?: string | null
          player4_id?: string | null
          round?: number
          score?: string | null
          winner_id?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_time?: string | null
          court?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'match_reminder' | 'payment_reminder' | 'tournament_update' | 'general'
          read: boolean
          sent_via: 'email' | 'sms' | 'whatsapp' | 'in_app'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'match_reminder' | 'payment_reminder' | 'tournament_update' | 'general'
          read?: boolean
          sent_via?: 'email' | 'sms' | 'whatsapp' | 'in_app'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'match_reminder' | 'payment_reminder' | 'tournament_update' | 'general'
          read?: boolean
          sent_via?: 'email' | 'sms' | 'whatsapp' | 'in_app'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos derivados para facilitar el uso
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type League = Database['public']['Tables']['leagues']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
export type LeagueInsert = Database['public']['Tables']['leagues']['Insert']
export type RegistrationInsert = Database['public']['Tables']['registrations']['Insert']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']
export type LeagueUpdate = Database['public']['Tables']['leagues']['Update']
export type RegistrationUpdate = Database['public']['Tables']['registrations']['Update']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

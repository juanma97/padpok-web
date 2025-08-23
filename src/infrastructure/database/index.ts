// Exportar cliente principal de Supabase
export { supabase, createServerClient } from './supabase'

// Exportar servicios de base de datos
export { UserService } from './userService'
export { LeagueService } from './leagueService'

// Exportar tipos de base de datos
export * from '@/shared/types/database'

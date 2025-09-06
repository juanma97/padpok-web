// Tipos relacionados con partidos y calendarios de liga

export interface Player {
  id: string
  name: string
  email: string
  phone: string
}

export interface Court {
  id: string
  name: string
  number: string
}

export interface Pair {
  id: string
  player1: Player
  player2: Player
}

export interface Match {
  id: string
  round: number
  pair1: Pair
  pair2: Pair
  court: Court
  status: 'pending' | 'completed' | 'cancelled'
  result?: {
    winner: 'pair1' | 'pair2'
    score: string
    sets?: {
      pair1: number
      pair2: number
    }
  }
}

export interface Round {
  roundNumber: number
  matches: Match[]
}

export interface LeagueCalendar {
  leagueId: string
  rounds: Round[]
  totalMatches: number
  totalRounds: number
}

// Tipos para la generación del calendario
export interface CalendarGenerationParams {
  players: Player[]
  courts: Court[]
  leagueId: string
}

export interface CalendarGenerationResult {
  success: boolean
  calendar?: LeagueCalendar
  error?: string
}

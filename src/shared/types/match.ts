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

// Tipos específicos para torneos
export interface TournamentMatch extends Match {
  gameNumber?: number // Para identificar el juego dentro de la ronda
  sitOutPlayers?: Player[] // Jugadores que descansan en esta ronda
}

export interface TournamentRound {
  roundNumber: number
  matches: TournamentMatch[]
  sitOutPlayers: Player[] // Jugadores que descansan en esta ronda completa
}

export interface TournamentCalendar {
  tournamentId: string
  rounds: TournamentRound[]
  totalMatches: number
  totalRounds: number
  gamesPerRound: number
  format: 'classic-americano' | 'mixed-americano' | 'team-americano'
}

// Parámetros para la generación de torneos
export interface TournamentGenerationParams {
  players: Player[]
  courts: Court[]
  tournamentId: string
  gamesPerRound: number
  format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  sitOutPoints: number
}

export interface TournamentGenerationResult {
  success: boolean
  calendar?: TournamentCalendar
  error?: string
}

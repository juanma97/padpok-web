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
  result?: MatchResult
}

export interface MatchResult {
  winner: 'pair1' | 'pair2' | 'draw'
  score_pair1: number
  score_pair2: number
  sets?: MatchSet[]
  completed_at?: string
  notes?: string
}

export interface MatchSet {
  set_number: number
  pair1_games: number
  pair2_games: number
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

export interface TournamentMatch extends Match {
  gameNumber?: number
  sitOutPlayers?: Player[]
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

// Tipos para el sistema de ranking
export interface PlayerRanking {
  playerId: string
  playerName: string
  position: number
  points: number
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  matchesDrawn: number
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
  winPercentage: number
}

export interface LeagueRanking {
  leagueId: string
  rankingType: 'points' | 'win-percentage' | 'sets-difference'
  players: PlayerRanking[]
  lastUpdated: string
}

// Tipos para actualización de resultados
export interface UpdateMatchResultParams {
  matchId: string
  leagueId: string
  result: MatchResult
}

export interface UpdateMatchResultResponse {
  success: boolean
  updatedMatch?: Match
  updatedRanking?: LeagueRanking
  error?: string
}

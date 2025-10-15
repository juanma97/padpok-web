// Servicio para generar cuadros de torneo Classic Americano
// El formato americano se caracteriza por rotación de parejas y múltiples juegos por ronda

import { 
  Player, 
  Court, 
  TournamentMatch, 
  TournamentRound, 
  Pair 
} from '@/shared/types/match'

export interface IAmericanoTournamentGeneratorService {
  generateAmericanoTournament(
    players: Player[], 
    courts: Court[], 
    tournamentId: string,
    gamesPerRound: number
  ): TournamentRound[]
  calculateOptimalRounds(playerCount: number, gamesPerRound: number): number
  validatePlayerCount(playerCount: number): boolean
  calculateSitOutPlayers(players: Player[], roundIndex: number): Player[]
}

export class AmericanoTournamentGeneratorService implements IAmericanoTournamentGeneratorService {

  /**
   * Genera un cuadro completo de torneo Classic Americano
   * @param players Lista de jugadores
   * @param courts Lista de pistas disponibles
   * @param tournamentId ID del torneo
   * @param gamesPerRound Número de juegos por ronda
   * @returns Lista de rondas del torneo
   */
  generateAmericanoTournament(
    players: Player[], 
    courts: Court[], 
    tournamentId: string,
    gamesPerRound: number
  ): TournamentRound[] {
    if (!this.validatePlayerCount(players.length)) {
      throw new Error('El número de jugadores debe ser par y mínimo 4 para torneo americano')
    }

    const totalRounds = this.calculateOptimalRounds(players.length, gamesPerRound)
    const rounds: TournamentRound[] = []
    
    // Generar cada ronda del torneo
    for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
      const roundMatches = this.generateRoundMatches(
        players, 
        roundIndex, 
        courts, 
        tournamentId, 
        gamesPerRound
      )
      
      const sitOutPlayers = this.calculateSitOutPlayers(players, roundIndex)
      
      rounds.push({
        roundNumber: roundIndex + 1,
        matches: roundMatches,
        sitOutPlayers
      })
    }

    return rounds
  }

  /**
   * Calcula el número óptimo de rondas para un torneo americano
   * @param playerCount Número de jugadores
   * @param gamesPerRound Juegos por ronda
   * @returns Número óptimo de rondas
   */
  calculateOptimalRounds(playerCount: number, gamesPerRound: number): number {
    // En torneo americano, queremos que cada jugador juegue con diferentes compañeros
    // El número de rondas depende de cuántas combinaciones de parejas queremos generar
    
    if (playerCount === 4) {
      return Math.max(1, gamesPerRound) // Con 4 jugadores, solo hay una combinación
    }
    
    if (playerCount === 6) {
      // Con 6 jugadores: 15 combinaciones posibles de parejas
      // Pero en cada ronda solo juegan 4 (2 parejas), 2 descansan
      return Math.min(5, Math.max(3, gamesPerRound))
    }
    
    if (playerCount === 8) {
      // Con 8 jugadores: más combinaciones, 2 partidos simultáneos
      return Math.min(7, Math.max(4, gamesPerRound))
    }
    
    // Para otros números, usar fórmula general
    const maxPossibleRounds = Math.floor((playerCount * (playerCount - 1)) / 8)
    return Math.min(maxPossibleRounds, Math.max(3, gamesPerRound))
  }

  /**
   * Valida que el número de jugadores sea adecuado para torneo americano
   * @param playerCount Número de jugadores
   * @returns true si es válido
   */
  validatePlayerCount(playerCount: number): boolean {
    // Los torneos americanos funcionan mejor con números pares
    // Mínimo 4 jugadores, máximo razonable 16
    return playerCount >= 4 && playerCount <= 16 && playerCount % 2 === 0
  }

  /**
   * Calcula qué jugadores descansan en una ronda específica
   * @param players Lista de jugadores
   * @param roundIndex Índice de la ronda
   * @returns Lista de jugadores que descansan
   */
  calculateSitOutPlayers(players: Player[], roundIndex: number): Player[] {
    const playerCount = players.length
    
    // Si el número de jugadores es múltiplo de 4, nadie descansa
    if (playerCount % 4 === 0) {
      return []
    }
    
    // Si hay 6 jugadores, 2 descansan por ronda (rotando)
    if (playerCount === 6) {
      const sitOutIndex1 = (roundIndex * 2) % playerCount
      const sitOutIndex2 = (roundIndex * 2 + 1) % playerCount
      return [players[sitOutIndex1], players[sitOutIndex2]]
    }
    
    // Para otros casos, calcular dinámicamente
    const playersPerMatch = 4
    const maxPlayingPlayers = Math.floor(playerCount / playersPerMatch) * playersPerMatch
    const sitOutCount = playerCount - maxPlayingPlayers
    
    const sitOutPlayers: Player[] = []
    for (let i = 0; i < sitOutCount; i++) {
      const sitOutIndex = (roundIndex + i) % playerCount
      sitOutPlayers.push(players[sitOutIndex])
    }
    
    return sitOutPlayers
  }

  /**
   * Genera los partidos para una ronda específica
   * @param players Lista de jugadores
   * @param roundIndex Índice de la ronda
   * @param courts Lista de pistas
   * @param tournamentId ID del torneo
   * @param gamesPerRound Juegos por ronda
   * @returns Lista de partidos para la ronda
   */
  private generateRoundMatches(
    players: Player[], 
    roundIndex: number, 
    courts: Court[], 
    tournamentId: string,
    gamesPerRound: number
  ): TournamentMatch[] {
    const matches: TournamentMatch[] = []
    const sitOutPlayers = this.calculateSitOutPlayers(players, roundIndex)
    
    // Obtener jugadores que van a jugar en esta ronda
    const playingPlayers = players.filter(player => 
      !sitOutPlayers.some(sitOut => sitOut.id === player.id)
    )
    
    // Generar rotación de parejas para esta ronda
    const roundPairs = this.generateRoundPairs(playingPlayers, roundIndex)
    
    // Crear partidos con las parejas generadas
    for (let i = 0; i < roundPairs.length; i += 2) {
      if (i + 1 < roundPairs.length) {
        const pair1 = roundPairs[i]
        const pair2 = roundPairs[i + 1]
        
        const match: TournamentMatch = {
          id: this.generateMatchId(pair1, pair2, roundIndex, Math.floor(i / 2)),
          round: roundIndex + 1,
          pair1,
          pair2,
          court: courts[Math.floor(i / 2) % courts.length],
          status: 'pending',
          gameNumber: Math.floor(i / 2) + 1,
          sitOutPlayers: sitOutPlayers
        }
        
        matches.push(match)
      }
    }
    
    return matches
  }

  /**
   * Genera las parejas para una ronda específica usando rotación
   * @param players Jugadores que van a jugar
   * @param roundIndex Índice de la ronda
   * @returns Lista de parejas para la ronda
   */
  private generateRoundPairs(players: Player[], roundIndex: number): Pair[] {
    const pairs: Pair[] = []
    const playerCount = players.length
    
    if (playerCount === 4) {
      return this.generate4PlayerPairs(players, roundIndex)
    } else if (playerCount === 6) {
      return this.generate6PlayerPairs(players, roundIndex)
    } else if (playerCount === 8) {
      return this.generate8PlayerPairs(players, roundIndex)
    } else {
      return this.generateGeneralPairs(players, roundIndex)
    }
  }

  /**
   * Genera parejas para 4 jugadores
   */
  private generate4PlayerPairs(players: Player[], roundIndex: number): Pair[] {
    // Con 4 jugadores solo hay una forma de hacer parejas
    const pair1: Pair = {
      id: this.generatePairId(players[0], players[1]),
      player1: players[0],
      player2: players[1]
    }
    
    const pair2: Pair = {
      id: this.generatePairId(players[2], players[3]),
      player1: players[2],
      player2: players[3]
    }
    
    return [pair1, pair2]
  }

  /**
   * Genera parejas para 6 jugadores (4 juegan, 2 descansan)
   */
  private generate6PlayerPairs(players: Player[], roundIndex: number): Pair[] {
    // Rotaciones predefinidas para 6 jugadores
    const rotations = [
      [0, 1, 2, 3], // Ronda 1: A-B vs C-D (E,F descansan)
      [0, 2, 1, 4], // Ronda 2: A-C vs B-E (D,F descansan)
      [0, 3, 1, 5], // Ronda 3: A-D vs B-F (C,E descansan)
      [0, 4, 2, 5], // Ronda 4: A-E vs C-F (B,D descansan)
      [0, 5, 3, 4]  // Ronda 5: A-F vs D-E (B,C descansan)
    ]
    
    if (roundIndex >= rotations.length) {
      return []
    }
    
    const rotation = rotations[roundIndex]
    
    const pair1: Pair = {
      id: this.generatePairId(players[rotation[0]], players[rotation[1]]),
      player1: players[rotation[0]],
      player2: players[rotation[1]]
    }
    
    const pair2: Pair = {
      id: this.generatePairId(players[rotation[2]], players[rotation[3]]),
      player1: players[rotation[2]],
      player2: players[rotation[3]]
    }
    
    return [pair1, pair2]
  }

  /**
   * Genera parejas para 8 jugadores (2 partidos simultáneos)
   */
  private generate8PlayerPairs(players: Player[], roundIndex: number): Pair[] {
    // Algoritmo de rotación para 8 jugadores
    const rotatedPlayers = [...players]
    
    // Rotar jugadores según la ronda
    for (let i = 0; i < roundIndex; i++) {
      const temp = rotatedPlayers.shift()
      if (temp) rotatedPlayers.push(temp)
    }
    
    // Crear 4 parejas (2 partidos)
    const pairs: Pair[] = []
    
    for (let i = 0; i < 8; i += 2) {
      const pair: Pair = {
        id: this.generatePairId(rotatedPlayers[i], rotatedPlayers[i + 1]),
        player1: rotatedPlayers[i],
        player2: rotatedPlayers[i + 1]
      }
      pairs.push(pair)
    }
    
    return pairs
  }

  /**
   * Genera parejas para otros números de jugadores
   */
  private generateGeneralPairs(players: Player[], roundIndex: number): Pair[] {
    const pairs: Pair[] = []
    const rotatedPlayers = [...players]
    
    // Aplicar rotación básica
    for (let i = 0; i < roundIndex; i++) {
      const temp = rotatedPlayers.shift()
      if (temp) rotatedPlayers.push(temp)
    }
    
    // Crear parejas de forma secuencial
    for (let i = 0; i < rotatedPlayers.length; i += 2) {
      if (i + 1 < rotatedPlayers.length) {
        const pair: Pair = {
          id: this.generatePairId(rotatedPlayers[i], rotatedPlayers[i + 1]),
          player1: rotatedPlayers[i],
          player2: rotatedPlayers[i + 1]
        }
        pairs.push(pair)
      }
    }
    
    return pairs
  }

  /**
   * Genera un ID único para una pareja
   */
  private generatePairId(player1: Player, player2: Player): string {
    const sortedIds = [player1.id, player2.id].sort()
    return `tournament_pair_${sortedIds[0]}_${sortedIds[1]}`
  }

  /**
   * Genera un ID único para un partido de torneo
   */
  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number, gameNumber: number): string {
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `tournament_match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}_g${gameNumber + 1}`
  }
}

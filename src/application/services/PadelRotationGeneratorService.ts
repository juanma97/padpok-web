// Servicio para generar rotaciones de parejas en pádel "Todos vs Todos"
// Cada jugador debe jugar CON todos los demás y CONTRA todos los demás

import { Player, Match, Round, Court, Pair } from '@/shared/types/match'

export interface IPadelRotationGeneratorService {
  generatePadelRotation(players: Player[], courts: Court[], leagueId: string): Round[]
  calculateOptimalRounds(playerCount: number): number
  validatePlayerCount(playerCount: number): boolean
}

export class PadelRotationGeneratorService implements IPadelRotationGeneratorService {

  /**
   * Genera un calendario de rotación completo para pádel "Todos vs Todos"
   * Cada jugador juega con diferentes compañeros y contra diferentes oponentes
   * @param players Lista de jugadores
   * @param courts Lista de pistas disponibles
   * @param leagueId ID de la liga
   * @returns Lista de rondas con rotación de parejas
   */
  generatePadelRotation(players: Player[], courts: Court[], leagueId: string): Round[] {
    if (!this.validatePlayerCount(players.length)) {
      throw new Error('El número de jugadores debe ser múltiplo de 4 para rotación completa de pádel')
    }

    const n = players.length
    const rounds: Round[] = []
    const totalRounds = this.calculateOptimalRounds(n)
    
    // Generar rotaciones usando algoritmo específico para pádel
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches = this.generateRoundRotation(players, round, courts, leagueId)
      
      if (roundMatches.length > 0) {
        rounds.push({
          roundNumber: round + 1,
          matches: roundMatches
        })
      }
    }

    return rounds
  }

  /**
   * Calcula el número óptimo de rondas para que todos jueguen con y contra todos
   * @param playerCount Número de jugadores
   * @returns Número óptimo de rondas
   */
  calculateOptimalRounds(playerCount: number): number {
    // Para N jugadores en pádel (grupos de 4):
    // Cada jugador debe jugar con (N-1) compañeros diferentes
    // Como cada partido involucra 2 compañeros, necesitamos (N-1)/1 rondas como mínimo
    // Pero para asegurar que todos jueguen contra todos, usamos más rondas
    
    if (playerCount === 4) return 1 // Solo un partido posible
    if (playerCount === 6) return 5 // Rotación completa para 6 jugadores
    if (playerCount === 8) return 7 // Rotación completa para 8 jugadores
    
    // Fórmula general: (N * (N-1)) / 6 redondeado hacia arriba
    return Math.ceil((playerCount * (playerCount - 1)) / 6)
  }

  /**
   * Valida que el número de jugadores sea adecuado para rotación de pádel
   * @param playerCount Número de jugadores
   * @returns true si es válido
   */
  validatePlayerCount(playerCount: number): boolean {
    // Para pádel, necesitamos múltiplos de 4 para rotación completa
    // Pero podemos manejar casos especiales como 6 jugadores
    return playerCount >= 4 && playerCount % 2 === 0
  }

  /**
   * Genera las parejas y partidos para una ronda específica usando rotación
   * @param players Lista de jugadores
   * @param roundIndex Índice de la ronda (0-based)
   * @param courts Lista de pistas
   * @param leagueId ID de la liga
   * @returns Lista de partidos para la ronda
   */
  private generateRoundRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    const n = players.length
    const matches: Match[] = []
    
    // Algoritmo de rotación específico según número de jugadores
    if (n === 4) {
      return this.generate4PlayerRotation(players, roundIndex, courts, leagueId)
    } else if (n === 6) {
      return this.generate6PlayerRotation(players, roundIndex, courts, leagueId)
    } else if (n === 8) {
      return this.generate8PlayerRotation(players, roundIndex, courts, leagueId)
    } else {
      // Para otros números, usar algoritmo general
      return this.generateGeneralRotation(players, roundIndex, courts, leagueId)
    }
  }

  /**
   * Rotación para 4 jugadores (solo un partido posible)
   */
  private generate4PlayerRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    if (roundIndex > 0) return [] // Solo hay una combinación posible
    
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

    const match: Match = {
      id: this.generateMatchId(pair1, pair2, roundIndex),
      round: roundIndex + 1,
      pair1,
      pair2,
      court: courts[0],
      status: 'pending'
    }

    return [match]
  }

  /**
   * Rotación para 6 jugadores (3 parejas, rotación completa)
   */
  private generate6PlayerRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    // Matrices de rotación predefinidas para 6 jugadores
    const rotations = [
      [[0,1], [2,3], [4,5]], // Ronda 1: A-B vs C-D, E-F descansa
      [[0,2], [1,4], [3,5]], // Ronda 2: A-C vs B-E, D-F descansa  
      [[0,3], [1,5], [2,4]], // Ronda 3: A-D vs B-F, C-E descansa
      [[0,4], [1,3], [2,5]], // Ronda 4: A-E vs B-D, C-F descansa
      [[0,5], [1,2], [3,4]]  // Ronda 5: A-F vs B-C, D-E descansa
    ]

    if (roundIndex >= rotations.length) return []
    
    const roundRotation = rotations[roundIndex]
    const matches: Match[] = []

    // Crear un partido con las dos primeras parejas
    const pair1: Pair = {
      id: this.generatePairId(players[roundRotation[0][0]], players[roundRotation[0][1]]),
      player1: players[roundRotation[0][0]],
      player2: players[roundRotation[0][1]]
    }
    
    const pair2: Pair = {
      id: this.generatePairId(players[roundRotation[1][0]], players[roundRotation[1][1]]),
      player1: players[roundRotation[1][0]],
      player2: players[roundRotation[1][1]]
    }

    const match: Match = {
      id: this.generateMatchId(pair1, pair2, roundIndex),
      round: roundIndex + 1,
      pair1,
      pair2,
      court: courts[0],
      status: 'pending'
    }

    matches.push(match)
    return matches
  }

  /**
   * Rotación para 8 jugadores (4 parejas, 2 partidos simultáneos)
   */
  private generate8PlayerRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    // Algoritmo más complejo para 8 jugadores con rotación completa
    // Esta es una implementación simplificada
    const matches: Match[] = []
    
    // Por ahora, implementamos rotación básica
    // TODO: Implementar algoritmo completo de rotación para 8 jugadores
    const rotation = this.getSimple8PlayerRotation(roundIndex)
    
    if (!rotation) return []

    for (let i = 0; i < rotation.length; i += 4) {
      if (i + 3 < rotation.length) {
        const pair1: Pair = {
          id: this.generatePairId(players[rotation[i]], players[rotation[i+1]]),
          player1: players[rotation[i]],
          player2: players[rotation[i+1]]
        }
        
        const pair2: Pair = {
          id: this.generatePairId(players[rotation[i+2]], players[rotation[i+3]]),
          player1: players[rotation[i+2]],
          player2: players[rotation[i+3]]
        }

        const match: Match = {
          id: this.generateMatchId(pair1, pair2, roundIndex),
          round: roundIndex + 1,
          pair1,
          pair2,
          court: courts[Math.floor(matches.length) % courts.length],
          status: 'pending'
        }

        matches.push(match)
      }
    }

    return matches
  }

  /**
   * Rotación general para otros números de jugadores
   */
  private generateGeneralRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    // Implementación simplificada - rotar parejas básicamente
    const matches: Match[] = []
    const n = players.length
    const playersInRound = [...players]
    
    // Rotar jugadores según el índice de ronda
    for (let i = 0; i < roundIndex; i++) {
      const temp = playersInRound.shift()
      if (temp) playersInRound.push(temp)
    }
    
    // Crear partidos con jugadores rotados
    for (let i = 0; i < playersInRound.length; i += 4) {
      if (i + 3 < playersInRound.length) {
        const pair1: Pair = {
          id: this.generatePairId(playersInRound[i], playersInRound[i+1]),
          player1: playersInRound[i],
          player2: playersInRound[i+1]
        }
        
        const pair2: Pair = {
          id: this.generatePairId(playersInRound[i+2], playersInRound[i+3]),
          player1: playersInRound[i+2],
          player2: playersInRound[i+3]
        }

        const match: Match = {
          id: this.generateMatchId(pair1, pair2, roundIndex),
          round: roundIndex + 1,
          pair1,
          pair2,
          court: courts[matches.length % courts.length],
          status: 'pending'
        }

        matches.push(match)
      }
    }

    return matches
  }

  /**
   * Obtiene rotación simple para 8 jugadores
   */
  private getSimple8PlayerRotation(roundIndex: number): number[] | null {
    const rotations = [
      [0,1,2,3,4,5,6,7], // Ronda 1
      [0,2,1,4,3,6,5,7], // Ronda 2
      [0,3,1,5,2,7,4,6], // Ronda 3
      [0,4,1,6,2,5,3,7], // Ronda 4
      [0,5,1,7,2,4,3,6], // Ronda 5
      [0,6,1,3,2,7,4,5], // Ronda 6
      [0,7,1,2,3,4,5,6]  // Ronda 7
    ]

    return rotations[roundIndex] || null
  }

  /**
   * Genera un ID único para una pareja
   */
  private generatePairId(player1: Player, player2: Player): string {
    const sortedIds = [player1.id, player2.id].sort()
    return `pair_${sortedIds[0]}_${sortedIds[1]}`
  }

  /**
   * Genera un ID único para un partido
   */
  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number): string {
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}`
  }
}

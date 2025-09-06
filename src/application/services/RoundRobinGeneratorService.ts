// Servicio para generar calendarios Round Robin
// Principio de Responsabilidad Única: Se encarga solo del algoritmo Round Robin

import { Pair, Match, Round, Court } from '@/shared/types/match'

export interface IRoundRobinGeneratorService {
  generateRoundRobinMatches(pairs: Pair[], courts: Court[], leagueId: string): Round[]
  calculateTotalMatches(pairCount: number): number
  calculateTotalRounds(pairCount: number): number
  validateCourtsForPairs(pairs: Pair[], courts: Court[]): boolean
}

export class RoundRobinGeneratorService implements IRoundRobinGeneratorService {

  /**
   * Genera un calendario Round Robin completo para las parejas
   * @param pairs Lista de parejas
   * @param courts Lista de pistas disponibles
   * @param leagueId ID de la liga
   * @returns Lista de rondas con sus partidos
   */
  generateRoundRobinMatches(pairs: Pair[], courts: Court[], leagueId: string): Round[] {
    if (!this.validateCourtsForPairs(pairs, courts)) {
      throw new Error('No hay suficientes pistas para el número de parejas')
    }

    const n = pairs.length
    const rounds: Round[] = []
    
    // Algoritmo de Round Robin circular
    // Para n parejas necesitamos n-1 rondas (si n es par) o n rondas (si n es impar)
    const totalRounds = n % 2 === 0 ? n - 1 : n
    
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches = this.generateRoundMatches(pairs, round, courts, leagueId)
      rounds.push({
        roundNumber: round + 1,
        matches: roundMatches
      })
    }

    return rounds
  }

  /**
   * Calcula el número total de partidos para un número dado de parejas
   * @param pairCount Número de parejas
   * @returns Número total de partidos
   */
  calculateTotalMatches(pairCount: number): number {
    return (pairCount * (pairCount - 1)) / 2
  }

  /**
   * Calcula el número total de rondas para un número dado de parejas
   * @param pairCount Número de parejas
   * @returns Número total de rondas
   */
  calculateTotalRounds(pairCount: number): number {
    return pairCount % 2 === 0 ? pairCount - 1 : pairCount
  }

  /**
   * Valida que haya suficientes pistas para el número de parejas
   * @param pairs Lista de parejas
   * @param courts Lista de pistas
   * @returns true si es válido, false en caso contrario
   */
  validateCourtsForPairs(pairs: Pair[], courts: Court[]): boolean {
    const simultaneousMatches = Math.floor(pairs.length / 2)
    return courts.length >= simultaneousMatches
  }

  /**
   * Genera los partidos para una ronda específica
   * @param pairs Lista de parejas
   * @param roundIndex Índice de la ronda (0-based)
   * @param courts Lista de pistas disponibles
   * @param leagueId ID de la liga
   * @returns Lista de partidos para la ronda
   */
  private generateRoundMatches(pairs: Pair[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    const n = pairs.length
    const matches: Match[] = []
    const usedPairs = new Set<number>()

    // Algoritmo Round Robin: cada pareja juega contra todas las demás exactamente una vez
    for (let i = 0; i < n && matches.length < Math.floor(n / 2); i++) {
      if (usedPairs.has(i)) continue

      // Calcular el oponente usando el algoritmo circular
      const opponentIndex = this.calculateOpponent(i, roundIndex, n)
      
      if (opponentIndex !== -1 && !usedPairs.has(opponentIndex)) {
        const match: Match = {
          id: this.generateMatchId(pairs[i], pairs[opponentIndex], roundIndex),
          round: roundIndex + 1,
          pair1: pairs[i],
          pair2: pairs[opponentIndex],
          court: this.assignCourt(courts, matches.length),
          status: 'pending'
        }

        matches.push(match)
        usedPairs.add(i)
        usedPairs.add(opponentIndex)
      }
    }

    return matches
  }

  /**
   * Calcula el oponente para una pareja en una ronda específica
   * @param pairIndex Índice de la pareja
   * @param roundIndex Índice de la ronda
   * @param totalPairs Número total de parejas
   * @returns Índice del oponente
   */
  private calculateOpponent(pairIndex: number, roundIndex: number, totalPairs: number): number {
    if (totalPairs % 2 === 1 && pairIndex === totalPairs - 1) {
      // Si hay número impar de parejas, la última descansa en esta ronda
      return -1
    }

    if (pairIndex === 0) {
      // La primera pareja siempre juega contra la pareja en posición roundIndex + 1
      return roundIndex + 1 < totalPairs ? roundIndex + 1 : -1
    }

    // Para las demás parejas, usar fórmula circular
    const opponent = (pairIndex + roundIndex) % (totalPairs - 1)
    return opponent === pairIndex ? totalPairs - 1 : opponent
  }

  /**
   * Asigna una pista a un partido
   * @param courts Lista de pistas disponibles
   * @param matchIndex Índice del partido en la ronda
   * @returns Pista asignada
   */
  private assignCourt(courts: Court[], matchIndex: number): Court {
    // Rotación circular de pistas
    return courts[matchIndex % courts.length]
  }

  /**
   * Genera un ID único para un partido
   * @param pair1 Primera pareja
   * @param pair2 Segunda pareja
   * @param roundIndex Índice de la ronda
   * @returns ID único del partido
   */
  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number): string {
    // Ordenar IDs de parejas alfabéticamente para consistencia
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}`
  }
}

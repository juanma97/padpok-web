// Servicio para generar parejas aleatorias
// Principio de Responsabilidad Única: Se encarga solo de generar parejas

import { Player, Pair } from '@/shared/types/match'

export interface IPairGeneratorService {
  generateRandomPairs(players: Player[]): Pair[]
  validatePlayerCount(playerCount: number): boolean
}

export class PairGeneratorService implements IPairGeneratorService {
  
  /**
   * Genera parejas aleatorias a partir de una lista de jugadores
   * @param players Lista de jugadores
   * @returns Lista de parejas generadas aleatoriamente
   */
  generateRandomPairs(players: Player[]): Pair[] {
    if (!this.validatePlayerCount(players.length)) {
      throw new Error('El número de jugadores debe ser par y mayor a 2')
    }

    // Crear una copia del array para no mutar el original
    const shuffledPlayers = [...players]
    this.shuffleArray(shuffledPlayers)

    const pairs: Pair[] = []
    
    // Generar parejas tomando jugadores de 2 en 2
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      const pair: Pair = {
        id: this.generatePairId(shuffledPlayers[i], shuffledPlayers[i + 1]),
        player1: shuffledPlayers[i],
        player2: shuffledPlayers[i + 1]
      }
      pairs.push(pair)
    }

    return pairs
  }

  /**
   * Valida que el número de jugadores sea adecuado para formar parejas
   * @param playerCount Número de jugadores
   * @returns true si es válido, false en caso contrario
   */
  validatePlayerCount(playerCount: number): boolean {
    return playerCount >= 4 && playerCount % 2 === 0
  }

  /**
   * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
   * @param array Array a mezclar (se modifica in-place)
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }

  /**
   * Genera un ID único para una pareja
   * @param player1 Primer jugador
   * @param player2 Segundo jugador
   * @returns ID único de la pareja
   */
  private generatePairId(player1: Player, player2: Player): string {
    // Ordenar IDs alfabéticamente para consistencia
    const sortedIds = [player1.id, player2.id].sort()
    return `pair_${sortedIds[0]}_${sortedIds[1]}`
  }
}

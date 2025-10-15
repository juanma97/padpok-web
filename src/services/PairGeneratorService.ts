import { Player, Pair } from '@/shared/types/match'

export interface IPairGeneratorService {
  generateRandomPairs(players: Player[]): Pair[]
  validatePlayerCount(playerCount: number): boolean
}

export class PairGeneratorService implements IPairGeneratorService {
  
  generateRandomPairs(players: Player[]): Pair[] {
    if (!this.validatePlayerCount(players.length)) {
      throw new Error('El número de jugadores debe ser par y mayor a 2')
    }

    const shuffledPlayers = [...players]
    this.shuffleArray(shuffledPlayers)

    const pairs: Pair[] = []
    
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

  validatePlayerCount(playerCount: number): boolean {
    return playerCount >= 4 && playerCount % 2 === 0
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }

  private generatePairId(player1: Player, player2: Player): string {
    const sortedIds = [player1.id, player2.id].sort()
    return `pair_${sortedIds[0]}_${sortedIds[1]}`
  }
}

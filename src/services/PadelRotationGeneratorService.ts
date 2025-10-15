import { Player, Match, Round, Court, Pair } from '@/shared/types/match'

export interface IPadelRotationGeneratorService {
  generatePadelRotation(players: Player[], courts: Court[], leagueId: string): Round[]
  calculateOptimalRounds(playerCount: number): number
  validatePlayerCount(playerCount: number): boolean
}

export class PadelRotationGeneratorService implements IPadelRotationGeneratorService {

  generatePadelRotation(players: Player[], courts: Court[], leagueId: string): Round[] {
    if (!this.validatePlayerCount(players.length)) {
      throw new Error('El número de jugadores debe ser múltiplo de 4 para rotación completa de pádel')
    }

    const n = players.length
    const rounds: Round[] = []
    const totalRounds = this.calculateOptimalRounds(n)
    
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

  calculateOptimalRounds(playerCount: number): number { 
    return Math.ceil((playerCount * (playerCount - 1)) / 6)
  }

  validatePlayerCount(playerCount: number): boolean {
    return playerCount >= 4 && playerCount % 2 === 0
  }

  private generateRoundRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    return this.generateGeneralRotation(players, roundIndex, courts, leagueId)
    
  }

  private generateGeneralRotation(players: Player[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    const matches: Match[] = []
    const playersInRound = [...players]
    
    for (let i = 0; i < roundIndex; i++) {
      const temp = playersInRound.shift()
      if (temp) playersInRound.push(temp)
    }
    
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

  private generatePairId(player1: Player, player2: Player): string {
    const sortedIds = [player1.id, player2.id].sort()
    return `pair_${sortedIds[0]}_${sortedIds[1]}`
  }

  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number): string {
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}`
  }
}

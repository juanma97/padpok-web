import { Pair, Match, Round, Court } from '@/shared/types/match'

export interface IRoundRobinGeneratorService {
  generateRoundRobinMatches(pairs: Pair[], courts: Court[], leagueId: string): Round[]
  calculateTotalMatches(pairCount: number): number
  calculateTotalRounds(pairCount: number): number
  validateCourtsForPairs(pairs: Pair[], courts: Court[]): boolean
}

export class RoundRobinGeneratorService implements IRoundRobinGeneratorService {

  generateRoundRobinMatches(pairs: Pair[], courts: Court[], leagueId: string): Round[] {
    if (!this.validateCourtsForPairs(pairs, courts)) {
      throw new Error('No hay suficientes pistas para el número de parejas')
    }

    const n = pairs.length
    const rounds: Round[] = []
    
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

  calculateTotalMatches(pairCount: number): number {
    return (pairCount * (pairCount - 1)) / 2
  }

  calculateTotalRounds(pairCount: number): number {
    return pairCount % 2 === 0 ? pairCount - 1 : pairCount
  }

  validateCourtsForPairs(pairs: Pair[], courts: Court[]): boolean {
    const simultaneousMatches = Math.floor(pairs.length / 2)
    return courts.length >= simultaneousMatches
  }

  private generateRoundMatches(pairs: Pair[], roundIndex: number, courts: Court[], leagueId: string): Match[] {
    const n = pairs.length
    const matches: Match[] = []
    const usedPairs = new Set<number>()

    for (let i = 0; i < n && matches.length < Math.floor(n / 2); i++) {
      if (usedPairs.has(i)) continue

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

  private calculateOpponent(pairIndex: number, roundIndex: number, totalPairs: number): number {
    const opponent = (pairIndex + roundIndex) % (totalPairs - 1)
    return opponent === pairIndex ? totalPairs - 1 : opponent
  }

  private assignCourt(courts: Court[], matchIndex: number): Court {
    return courts[matchIndex % courts.length]
  }

  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number): string {
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}`
  }
}

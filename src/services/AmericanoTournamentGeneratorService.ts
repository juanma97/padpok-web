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
    
    for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
      const roundMatches = this.generateRoundMatches(
        players, 
        roundIndex, 
        courts,
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

  calculateOptimalRounds(playerCount: number, gamesPerRound: number): number {
    const maxPossibleRounds = Math.floor((playerCount * (playerCount - 1)) / 8)
    return Math.min(maxPossibleRounds, Math.max(3, gamesPerRound))
  }

  validatePlayerCount(playerCount: number): boolean {
    return playerCount >= 4 && playerCount <= 16 && playerCount % 2 === 0
  }

  calculateSitOutPlayers(players: Player[], roundIndex: number): Player[] {
    const playerCount = players.length
    
    if (playerCount % 4 === 0) {
      return []
    }
    
    if (playerCount === 6) {
      const sitOutIndex1 = (roundIndex * 2) % playerCount
      const sitOutIndex2 = (roundIndex * 2 + 1) % playerCount
      return [players[sitOutIndex1], players[sitOutIndex2]]
    }
    
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


  private generateRoundMatches(
    players: Player[], 
    roundIndex: number, 
    courts: Court[], 
  ): TournamentMatch[] {
    const matches: TournamentMatch[] = []
    const sitOutPlayers = this.calculateSitOutPlayers(players, roundIndex)
    
    const playingPlayers = players.filter(player => 
      !sitOutPlayers.some(sitOut => sitOut.id === player.id)
    )
    
    const roundPairs = this.generateRoundPairs(playingPlayers, roundIndex)
    
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

  private generateRoundPairs(players: Player[], roundIndex: number): Pair[] {
    return this.generateGeneralPairs(players, roundIndex)
    
  }

  private generateGeneralPairs(players: Player[], roundIndex: number): Pair[] {
    const pairs: Pair[] = []
    const rotatedPlayers = [...players]
    
    for (let i = 0; i < roundIndex; i++) {
      const temp = rotatedPlayers.shift()
      if (temp) rotatedPlayers.push(temp)
    }
    
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

  private generatePairId(player1: Player, player2: Player): string {
    const sortedIds = [player1.id, player2.id].sort()
    return `tournament_pair_${sortedIds[0]}_${sortedIds[1]}`
  }

  private generateMatchId(pair1: Pair, pair2: Pair, roundIndex: number, gameNumber: number): string {
    const sortedPairIds = [pair1.id, pair2.id].sort()
    return `tournament_match_${sortedPairIds[0]}_${sortedPairIds[1]}_r${roundIndex + 1}_g${gameNumber + 1}`
  }
}

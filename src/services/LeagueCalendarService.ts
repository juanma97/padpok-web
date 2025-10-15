import { 
  Player, 
  Court, 
  LeagueCalendar, 
  CalendarGenerationParams, 
  CalendarGenerationResult 
} from '@/shared/types/match'
import { IPairGeneratorService } from './PairGeneratorService'
import { IRoundRobinGeneratorService } from './RoundRobinGeneratorService'
import { IPadelRotationGeneratorService } from './PadelRotationGeneratorService'

export interface ILeagueCalendarService {
  generateCalendar(params: CalendarGenerationParams): CalendarGenerationResult
  validateCalendarGeneration(players: Player[], courts: Court[]): { isValid: boolean; error?: string }
}

export class LeagueCalendarService implements ILeagueCalendarService {
  
  constructor(
    private pairGenerator: IPairGeneratorService,
    private roundRobinGenerator: IRoundRobinGeneratorService,
    private padelRotationGenerator: IPadelRotationGeneratorService
  ) {}

  generateCalendar(params: CalendarGenerationParams): CalendarGenerationResult {
    try {
      const validation = this.validateCalendarGeneration(params.players, params.courts)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      const rounds = this.padelRotationGenerator.generatePadelRotation(
        params.players,
        params.courts, 
        params.leagueId
      )

      const calendar: LeagueCalendar = {
        leagueId: params.leagueId,
        rounds,
        totalMatches: rounds.reduce((total, round) => total + round.matches.length, 0),
        totalRounds: rounds.length
      }

      return {
        success: true,
        calendar
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar el calendario'
      }
    }
  }

  validateCalendarGeneration(players: Player[], courts: Court[]): { isValid: boolean; error?: string } {
    if (players.length < 4) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 4 jugadores para crear una liga'
      }
    }

    if (!this.padelRotationGenerator.validatePlayerCount(players.length)) {
      return {
        isValid: false,
        error: 'El número de jugadores debe ser par y mínimo 4 para rotación de pádel'
      }
    }

    if (courts.length === 0) {
      return {
        isValid: false,
        error: 'Se necesita al menos una pista para crear una liga'
      }
    }

    const simultaneousMatches = Math.floor(players.length / 4)
    
    if (courts.length < simultaneousMatches) {
      return {
        isValid: false,
        error: `Se necesitan al menos ${simultaneousMatches} pistas para ${players.length} jugadores en rotación. Actualmente tienes ${courts.length} pista(s).`
      }
    }

    return { isValid: true }
  }
}

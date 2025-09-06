// Servicio principal para generar calendarios de liga
// Principio de Responsabilidad Única: Orquesta la generación completa del calendario
// Principio de Inversión de Dependencias: Depende de abstracciones, no de implementaciones concretas

import { 
  Player, 
  Court, 
  LeagueCalendar, 
  CalendarGenerationParams, 
  CalendarGenerationResult 
} from '@/shared/types/match'
import { IPairGeneratorService } from './PairGeneratorService'
import { IRoundRobinGeneratorService } from './RoundRobinGeneratorService'

export interface ILeagueCalendarService {
  generateCalendar(params: CalendarGenerationParams): CalendarGenerationResult
  validateCalendarGeneration(players: Player[], courts: Court[]): { isValid: boolean; error?: string }
}

export class LeagueCalendarService implements ILeagueCalendarService {
  
  constructor(
    private pairGenerator: IPairGeneratorService,
    private roundRobinGenerator: IRoundRobinGeneratorService
  ) {}

  /**
   * Genera un calendario completo para una liga
   * @param params Parámetros para la generación del calendario
   * @returns Resultado de la generación del calendario
   */
  generateCalendar(params: CalendarGenerationParams): CalendarGenerationResult {
    try {
      // Validar entrada
      const validation = this.validateCalendarGeneration(params.players, params.courts)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Generar parejas aleatorias
      const pairs = this.pairGenerator.generateRandomPairs(params.players)

      // Generar calendario Round Robin
      const rounds = this.roundRobinGenerator.generateRoundRobinMatches(
        pairs, 
        params.courts, 
        params.leagueId
      )

      // Crear el calendario completo
      const calendar: LeagueCalendar = {
        leagueId: params.leagueId,
        rounds,
        totalMatches: this.roundRobinGenerator.calculateTotalMatches(pairs.length),
        totalRounds: this.roundRobinGenerator.calculateTotalRounds(pairs.length)
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

  /**
   * Valida que los parámetros sean adecuados para generar un calendario
   * @param players Lista de jugadores
   * @param courts Lista de pistas
   * @returns Resultado de la validación
   */
  validateCalendarGeneration(players: Player[], courts: Court[]): { isValid: boolean; error?: string } {
    // Validar número mínimo de jugadores
    if (players.length < 4) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 4 jugadores para crear una liga'
      }
    }

    // Validar que el número de jugadores sea par
    if (!this.pairGenerator.validatePlayerCount(players.length)) {
      return {
        isValid: false,
        error: 'El número de jugadores debe ser par para formar parejas'
      }
    }

    // Validar número mínimo de pistas
    if (courts.length === 0) {
      return {
        isValid: false,
        error: 'Se necesita al menos una pista para crear una liga'
      }
    }

    // Validar que haya suficientes pistas para los partidos simultáneos
    const pairs = Math.floor(players.length / 2)
    const simultaneousMatches = Math.floor(pairs / 2)
    
    if (courts.length < simultaneousMatches) {
      return {
        isValid: false,
        error: `Se necesitan al menos ${simultaneousMatches} pistas para ${players.length} jugadores (${pairs} parejas). Actualmente tienes ${courts.length} pista(s).`
      }
    }

    return { isValid: true }
  }
}

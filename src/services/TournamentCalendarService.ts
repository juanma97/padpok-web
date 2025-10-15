// Servicio principal para generar calendarios de torneo
// Principio de Responsabilidad Única: Orquesta la generación completa del cuadro de torneo
// Principio de Inversión de Dependencias: Depende de abstracciones, no de implementaciones concretas

import { 
  Player, 
  Court, 
  TournamentCalendar, 
  TournamentGenerationParams, 
  TournamentGenerationResult 
} from '@/shared/types/match'
import { IAmericanoTournamentGeneratorService } from './AmericanoTournamentGeneratorService'

export interface ITournamentCalendarService {
  generateTournament(params: TournamentGenerationParams): TournamentGenerationResult
  validateTournamentGeneration(
    players: Player[], 
    courts: Court[], 
    format: string,
    gamesPerRound: number
  ): { isValid: boolean; error?: string }
  calculateTournamentStats(
    players: Player[], 
    gamesPerRound: number, 
    format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  ): {
    totalRounds: number
    totalMatches: number
    estimatedDuration: string
    maxSimultaneousMatches: number
  }
}

export class TournamentCalendarService implements ITournamentCalendarService {
  
  constructor(
    private americanoGenerator: IAmericanoTournamentGeneratorService
  ) {}

  /**
   * Genera un cuadro completo para un torneo
   * @param params Parámetros para la generación del torneo
   * @returns Resultado de la generación del cuadro
   */
  generateTournament(params: TournamentGenerationParams): TournamentGenerationResult {
    try {
      // Validar entrada
      const validation = this.validateTournamentGeneration(
        params.players, 
        params.courts, 
        params.format,
        params.gamesPerRound
      )
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      let rounds
      
      // Generar cuadro según el formato del torneo
      switch (params.format) {
        case 'classic-americano':
          rounds = this.americanoGenerator.generateAmericanoTournament(
            params.players,
            params.courts,
            params.tournamentId,
            params.gamesPerRound
          )
          break
          
        case 'mixed-americano':
          // TODO: Implementar generador para Mixed Americano
          throw new Error('El formato Mixed Americano aún no está implementado')
          
        case 'team-americano':
          // TODO: Implementar generador para Team Americano
          throw new Error('El formato Team Americano aún no está implementado')
          
        default:
          throw new Error(`Formato de torneo no soportado: ${params.format}`)
      }

      // Crear el calendario completo
      const calendar: TournamentCalendar = {
        tournamentId: params.tournamentId,
        rounds,
        totalMatches: rounds.reduce((total, round) => total + round.matches.length, 0),
        totalRounds: rounds.length,
        gamesPerRound: params.gamesPerRound,
        format: params.format
      }

      return {
        success: true,
        calendar
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar el cuadro del torneo'
      }
    }
  }

  /**
   * Valida que los parámetros sean adecuados para generar un torneo
   * @param players Lista de jugadores
   * @param courts Lista de pistas
   * @param format Formato del torneo
   * @param gamesPerRound Juegos por ronda
   * @returns Resultado de la validación
   */
  validateTournamentGeneration(
    players: Player[], 
    courts: Court[], 
    format: string,
    gamesPerRound: number
  ): { isValid: boolean; error?: string } {
    
    // Validar número mínimo de jugadores
    if (players.length < 4) {
      return {
        isValid: false,
        error: 'Se necesitan al menos 4 jugadores para crear un torneo'
      }
    }

    // Validar número máximo de jugadores para torneos
    if (players.length > 16) {
      return {
        isValid: false,
        error: 'Los torneos americanos están limitados a máximo 16 jugadores'
      }
    }

    // Validar que el número de jugadores sea par
    if (players.length % 2 !== 0) {
      return {
        isValid: false,
        error: 'El número de jugadores debe ser par para torneos americanos'
      }
    }

    // Validar número mínimo de pistas
    if (courts.length === 0) {
      return {
        isValid: false,
        error: 'Se necesita al menos una pista para crear un torneo'
      }
    }

    // Validar juegos por ronda
    if (gamesPerRound < 1 || gamesPerRound > 10) {
      return {
        isValid: false,
        error: 'El número de juegos por ronda debe estar entre 1 y 10'
      }
    }

    // Validaciones específicas por formato
    switch (format) {
      case 'classic-americano':
        return this.validateClassicAmericano(players, courts, gamesPerRound)
        
      case 'mixed-americano':
        return this.validateMixedAmericano(players, courts, gamesPerRound)
        
      case 'team-americano':
        return this.validateTeamAmericano(players, courts, gamesPerRound)
        
      default:
        return {
          isValid: false,
          error: `Formato de torneo no válido: ${format}`
        }
    }
  }

  /**
   * Validaciones específicas para Classic Americano
   */
  private validateClassicAmericano(
    players: Player[], 
    courts: Court[], 
    gamesPerRound: number
  ): { isValid: boolean; error?: string } {
    
    // Validar con el generador específico
    if (!this.americanoGenerator.validatePlayerCount(players.length)) {
      return {
        isValid: false,
        error: 'El número de jugadores no es válido para torneo Classic Americano'
      }
    }

    // Calcular partidos simultáneos máximos
    const maxSimultaneousMatches = Math.floor(players.length / 4)
    
    if (courts.length < maxSimultaneousMatches) {
      return {
        isValid: false,
        error: `Se necesitan al menos ${maxSimultaneousMatches} pistas para ${players.length} jugadores. Actualmente tienes ${courts.length} pista(s).`
      }
    }

    // Validar que el número de rondas sea razonable
    const optimalRounds = this.americanoGenerator.calculateOptimalRounds(players.length, gamesPerRound)
    
    if (gamesPerRound > optimalRounds * 2) {
      return {
        isValid: false,
        error: `El número de juegos por ronda es demasiado alto. Máximo recomendado: ${optimalRounds * 2}`
      }
    }

    return { isValid: true }
  }

  /**
   * Validaciones específicas para Mixed Americano
   */
  private validateMixedAmericano(
    players: Player[], 
    courts: Court[], 
    gamesPerRound: number
  ): { isValid: boolean; error?: string } {
    
    // TODO: Implementar validaciones específicas para Mixed Americano
    // Por ahora, usar las mismas validaciones que Classic Americano
    return this.validateClassicAmericano(players, courts, gamesPerRound)
  }

  /**
   * Validaciones específicas para Team Americano
   */
  private validateTeamAmericano(
    players: Player[], 
    courts: Court[], 
    gamesPerRound: number
  ): { isValid: boolean; error?: string } {
    
    // TODO: Implementar validaciones específicas para Team Americano
    // Por ahora, usar las mismas validaciones que Classic Americano
    return this.validateClassicAmericano(players, courts, gamesPerRound)
  }

  /**
   * Calcula estadísticas del torneo para información del usuario
   * @param players Lista de jugadores
   * @param gamesPerRound Juegos por ronda
   * @param format Formato del torneo
   * @returns Estadísticas del torneo
   */
  calculateTournamentStats(
    players: Player[], 
    gamesPerRound: number, 
    format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  ): {
    totalRounds: number
    totalMatches: number
    estimatedDuration: string
    maxSimultaneousMatches: number
  } {
    
    let totalRounds = 0
    
    switch (format) {
      case 'classic-americano':
        totalRounds = this.americanoGenerator.calculateOptimalRounds(players.length, gamesPerRound)
        break
      default:
        totalRounds = Math.max(3, gamesPerRound) // Estimación básica
    }
    
    const maxSimultaneousMatches = Math.floor(players.length / 4)
    const totalMatches = totalRounds * maxSimultaneousMatches
    
    // Estimar duración (asumiendo 20 minutos por partido + 5 minutos entre rondas)
    const matchDuration = 20 // minutos
    const breakBetweenRounds = 5 // minutos
    const totalMinutes = (totalRounds * matchDuration) + ((totalRounds - 1) * breakBetweenRounds)
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const estimatedDuration = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
    
    return {
      totalRounds,
      totalMatches,
      estimatedDuration,
      maxSimultaneousMatches
    }
  }
}

// Factory para crear instancias de TournamentCalendarService con sus dependencias
// Principio de Inversión de Dependencias: Facilita la inyección de dependencias

import { TournamentCalendarService, ITournamentCalendarService } from '../services/TournamentCalendarService'
import { AmericanoTournamentGeneratorService, IAmericanoTournamentGeneratorService } from '../services/AmericanoTournamentGeneratorService'

export class TournamentCalendarFactory {
  
  /**
   * Crea una instancia de TournamentCalendarService con todas sus dependencias
   * @returns Instancia configurada de TournamentCalendarService
   */
  static create(): ITournamentCalendarService {
    const americanoGenerator: IAmericanoTournamentGeneratorService = new AmericanoTournamentGeneratorService()
    
    return new TournamentCalendarService(americanoGenerator)
  }
  
  /**
   * Crea una instancia con dependencias personalizadas (útil para testing)
   * @param americanoGenerator Servicio generador de torneos americanos personalizado
   * @returns Instancia configurada de TournamentCalendarService
   */
  static createWithDependencies(
    americanoGenerator: IAmericanoTournamentGeneratorService
  ): ITournamentCalendarService {
    return new TournamentCalendarService(americanoGenerator)
  }
  
  /**
   * Crea una instancia específica para Classic Americano
   * @returns Instancia optimizada para torneos Classic Americano
   */
  static createForClassicAmericano(): ITournamentCalendarService {
    return TournamentCalendarFactory.create()
  }
}

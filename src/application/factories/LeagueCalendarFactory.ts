// Factory para crear instancias de LeagueCalendarService con sus dependencias
// Principio de Inversión de Dependencias: Facilita la inyección de dependencias

import { LeagueCalendarService, ILeagueCalendarService } from '../services/LeagueCalendarService'
import { PairGeneratorService, IPairGeneratorService } from '../services/PairGeneratorService'
import { RoundRobinGeneratorService, IRoundRobinGeneratorService } from '../services/RoundRobinGeneratorService'
import { PadelRotationGeneratorService, IPadelRotationGeneratorService } from '../services/PadelRotationGeneratorService'

export class LeagueCalendarFactory {
  
  /**
   * Crea una instancia de LeagueCalendarService con todas sus dependencias
   * @returns Instancia configurada de LeagueCalendarService
   */
  static create(): ILeagueCalendarService {
    const pairGenerator: IPairGeneratorService = new PairGeneratorService()
    const roundRobinGenerator: IRoundRobinGeneratorService = new RoundRobinGeneratorService()
    const padelRotationGenerator: IPadelRotationGeneratorService = new PadelRotationGeneratorService()
    
    return new LeagueCalendarService(pairGenerator, roundRobinGenerator, padelRotationGenerator)
  }
  
  /**
   * Crea una instancia con dependencias personalizadas (útil para testing)
   * @param pairGenerator Servicio generador de parejas personalizado
   * @param roundRobinGenerator Servicio Round Robin personalizado
   * @returns Instancia configurada de LeagueCalendarService
   */
  static createWithDependencies(
    pairGenerator: IPairGeneratorService,
    roundRobinGenerator: IRoundRobinGeneratorService,
    padelRotationGenerator: IPadelRotationGeneratorService
  ): ILeagueCalendarService {
    return new LeagueCalendarService(pairGenerator, roundRobinGenerator, padelRotationGenerator)
  }
}

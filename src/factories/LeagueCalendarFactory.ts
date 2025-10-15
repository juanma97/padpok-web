import { LeagueCalendarService, ILeagueCalendarService } from '../services/LeagueCalendarService'
import { PairGeneratorService, IPairGeneratorService } from '../services/PairGeneratorService'
import { RoundRobinGeneratorService, IRoundRobinGeneratorService } from '../services/RoundRobinGeneratorService'
import { PadelRotationGeneratorService, IPadelRotationGeneratorService } from '../services/PadelRotationGeneratorService'

export class LeagueCalendarFactory {
  
  static create(): ILeagueCalendarService {
    const pairGenerator: IPairGeneratorService = new PairGeneratorService()
    const roundRobinGenerator: IRoundRobinGeneratorService = new RoundRobinGeneratorService()
    const padelRotationGenerator: IPadelRotationGeneratorService = new PadelRotationGeneratorService()
    
    return new LeagueCalendarService(pairGenerator, roundRobinGenerator, padelRotationGenerator)
  }
  
  static createWithDependencies(
    pairGenerator: IPairGeneratorService,
    roundRobinGenerator: IRoundRobinGeneratorService,
    padelRotationGenerator: IPadelRotationGeneratorService
  ): ILeagueCalendarService {
    return new LeagueCalendarService(pairGenerator, roundRobinGenerator, padelRotationGenerator)
  }
}

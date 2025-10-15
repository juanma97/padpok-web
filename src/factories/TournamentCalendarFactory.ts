import { TournamentCalendarService, ITournamentCalendarService } from '../services/TournamentCalendarService'
import { AmericanoTournamentGeneratorService, IAmericanoTournamentGeneratorService } from '../services/AmericanoTournamentGeneratorService'

export class TournamentCalendarFactory {
  
  static create(): ITournamentCalendarService {
    const americanoGenerator: IAmericanoTournamentGeneratorService = new AmericanoTournamentGeneratorService()
    
    return new TournamentCalendarService(americanoGenerator)
  }
  
  static createWithDependencies(
    americanoGenerator: IAmericanoTournamentGeneratorService
  ): ITournamentCalendarService {
    return new TournamentCalendarService(americanoGenerator)
  }

  static createForClassicAmericano(): ITournamentCalendarService {
    return TournamentCalendarFactory.create()
  }
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { LeagueService } from '@/infrastructure/database/leagueService'
import { Match, Round } from '@/shared/types/match'

interface LeagueRecord {
  id: string
  creator_id: string
  title: string
  description?: string | null
  date: string
  time: string
  location: string
  format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
  player_management: 'manual' | 'link'
  players: any[]
  courts: any[]
  scoring_system: '3-1-0' | 'sets'
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  matches?: Round[]
  created_at: string
  updated_at: string
}

export default function LeagueDetailsPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [league, setLeague] = useState<LeagueRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLeague = async () => {
      if (!params.id) {
        setError('ID de liga no válido')
        setLoading(false)
        return
      }

      try {
        const { league: leagueData, error: leagueError } = await LeagueService.getLeagueById(params.id)
        
        if (leagueError) {
          setError(leagueError)
          return
        }

        if (!leagueData) {
          setError('Liga no encontrada')
          return
        }

        setLeague(leagueData)
      } catch (err) {
        console.error('Error loading league:', err)
        setError('Error inesperado al cargar la liga')
      } finally {
        setLoading(false)
      }
    }

    loadLeague()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="league-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando detalles de la liga...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="league-details-container">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="back-btn">
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!league) {
    return (
      <div className="league-details-container">
        <div className="error-container">
          <h2>Liga no encontrada</h2>
          <p>No se pudo encontrar la liga solicitada.</p>
          <button onClick={() => router.push('/dashboard')} className="back-btn">
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="league-details-container">
      <div className="league-details-wrapper">
        {/* Header */}
        <header className="league-details-header">
          <button 
            onClick={() => router.push('/dashboard')}
            className="back-btn"
          >
            ← Volver al Dashboard
          </button>
          <div className="league-title-section">
            <h1>{league.title}</h1>
            <span className={`league-status ${league.status}`}>
              {league.status === 'active' ? 'Activa' : 
               league.status === 'draft' ? 'Borrador' :
               league.status === 'completed' ? 'Finalizada' : 'Cancelada'}
            </span>
          </div>
        </header>

        {/* Información básica */}
        <section className="league-basic-info">
          <h2>Información General</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">📅 Fecha:</span>
              <span className="info-value">{formatDate(league.date)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">🕐 Hora:</span>
              <span className="info-value">{formatTime(league.time)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📍 Ubicación:</span>
              <span className="info-value">{league.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">🏆 Formato:</span>
              <span className="info-value">
                {league.format === 'all-vs-all' ? 'Todos vs Todos' :
                 league.format === 'box-league' ? 'Liga en Cajas' : 'Grupos + Playoffs'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">📊 Sistema de puntuación:</span>
              <span className="info-value">
                {league.scoring_system === '3-1-0' ? '3-1-0 (Victoria-Empate-Derrota)' : 'Por sets'}
              </span>
            </div>
          </div>
          {league.description && (
            <div className="league-description">
              <h3>Descripción</h3>
              <p>{league.description}</p>
            </div>
          )}
        </section>

        {/* Jugadores */}
        <section className="league-players">
          <h2>Jugadores ({league.players.length})</h2>
          <div className="players-grid">
            {league.players.map((player, index) => (
              <div key={player.id || index} className="player-card">
                <h4>{player.name} {player.lastName || ''}</h4>
                <div className="player-contact">
                  <span>📧 {player.email}</span>
                  <span>📱 {player.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pistas */}
        <section className="league-courts">
          <h2>Pistas ({league.courts.length})</h2>
          <div className="courts-grid">
            {league.courts.map((court, index) => (
              <div key={court.id || index} className="court-card">
                <h4>{court.name}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Calendario de partidos */}
        {league.matches && league.matches.length > 0 && (
          <section className="league-calendar">
            <h2>Calendario de Partidos</h2>
            <MatchCalendar rounds={league.matches} />
          </section>
        )}
      </div>

      <style jsx>{`
        .league-details-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .league-details-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .league-details-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .league-title-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .league-title-section h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .league-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .league-status.active {
          background: rgba(46, 204, 113, 0.2);
          color: #27ae60;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .league-status.draft {
          background: rgba(241, 196, 15, 0.2);
          color: #f39c12;
          border: 1px solid rgba(241, 196, 15, 0.3);
        }

        .league-basic-info,
        .league-players,
        .league-courts,
        .league-calendar {
          padding: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .league-calendar {
          border-bottom: none;
        }

        .league-basic-info h2,
        .league-players h2,
        .league-courts h2,
        .league-calendar h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 22px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-label {
          font-weight: 500;
          color: #7f8c8d;
          font-size: 14px;
        }

        .info-value {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }

        .league-description {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        .league-description h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .league-description p {
          margin: 0;
          color: #5a6c7d;
          line-height: 1.6;
        }

        .players-grid,
        .courts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .player-card,
        .court-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .player-card:hover,
        .court-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .player-card h4,
        .court-card h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .player-contact {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .player-contact span {
          font-size: 14px;
          color: #7f8c8d;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          color: #e74c3c;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

// Componente para mostrar el calendario de partidos
function MatchCalendar({ rounds }: { rounds: Round[] }) {
  return (
    <div className="match-calendar">
      {rounds.map((round) => (
        <div key={round.roundNumber} className="round-section">
          <h3>Jornada {round.roundNumber}</h3>
          <div className="matches-grid">
            {round.matches.map((match: Match) => (
              <div key={match.id} className="match-card">
                <div className="match-pairs">
                  <div className="pair">
                    <span className="pair-label">Pareja 1:</span>
                    <span className="pair-players">
                      {match.pair1.player1.name} & {match.pair1.player2.name}
                    </span>
                  </div>
                  <div className="vs">VS</div>
                  <div className="pair">
                    <span className="pair-label">Pareja 2:</span>
                    <span className="pair-players">
                      {match.pair2.player1.name} & {match.pair2.player2.name}
                    </span>
                  </div>
                </div>
                <div className="match-court">
                  <span>🎾 {match.court.name}</span>
                </div>
                <div className={`match-status ${match.status}`}>
                  {match.status === 'pending' ? 'Pendiente' :
                   match.status === 'completed' ? 'Completado' : 'Cancelado'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        .match-calendar {
          margin-top: 20px;
        }

        .round-section {
          margin-bottom: 30px;
        }

        .round-section h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
          padding-bottom: 10px;
          border-bottom: 2px solid #3498db;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 15px;
        }

        .match-card {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .match-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .match-pairs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .pair {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .pair-label {
          font-size: 12px;
          color: #7f8c8d;
          font-weight: 500;
          text-transform: uppercase;
        }

        .pair-players {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .vs {
          text-align: center;
          font-weight: bold;
          color: #3498db;
          font-size: 16px;
          margin: 5px 0;
        }

        .match-court {
          margin-bottom: 10px;
          color: #7f8c8d;
          font-size: 14px;
        }

        .match-status {
          text-align: center;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .match-status.pending {
          background: rgba(52, 152, 219, 0.1);
          color: #3498db;
          border: 1px solid rgba(52, 152, 219, 0.2);
        }

        .match-status.completed {
          background: rgba(46, 204, 113, 0.1);
          color: #27ae60;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .match-status.cancelled {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }
      `}</style>
    </div>
  )
}

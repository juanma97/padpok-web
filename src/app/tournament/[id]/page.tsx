'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { TournamentService } from '@/backend/tournamentService'
import { TournamentRound } from '@/shared/types/match'

interface TournamentRecord {
  id: string
  creator_id: string
  title: string
  description?: string | null
  date: string
  time: string
  location: string
  format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  player_management: 'manual' | 'link'
  players: any[]
  courts: any[]
  games_per_round: number
  ranking_criteria: 'points' | 'wins'
  sit_out_points: number
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  matches?: any
  created_at: string
  updated_at: string
}

export default function TournamentDetailsPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tournament, setTournament] = useState<TournamentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTournament = async () => {
      if (!params.id) {
        setError('ID de torneo no válido')
        setLoading(false)
        return
      }

      try {
        const { tournament: tournamentData, error: tournamentError } = await TournamentService.getTournamentById(params.id)
        
        if (tournamentError) {
          setError(tournamentError)
          return
        }

        if (!tournamentData) {
          setError('Torneo no encontrado')
          return
        }

        setTournament(tournamentData)
      } catch (err) {
        console.error('Error loading tournament:', err)
        setError('Error inesperado al cargar el torneo')
      } finally {
        setLoading(false)
      }
    }

    loadTournament()
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

  const getFormatDisplayName = (format: string) => {
    switch (format) {
      case 'classic-americano':
        return 'Classic Americano'
      case 'mixed-americano':
        return 'Mixed Americano'
      case 'team-americano':
        return 'Team Americano'
      default:
        return format
    }
  }

  const getRankingCriteriaDisplayName = (criteria: string) => {
    return criteria === 'points' ? 'Por Puntos' : 'Por Victorias'
  }

  if (authLoading || loading) {
    return (
      <div className="league-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando detalles del torneo...</p>
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
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="league-details-container">
        <div className="error-container">
          <h2>Torneo no encontrado</h2>
          <p>El torneo que buscas no existe o ha sido eliminado.</p>
          <button onClick={() => router.push('/dashboard')} className="back-btn">
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="league-details-container">
      <div className="league-details-wrapper">
        <header className="league-details-header">
          <button 
            onClick={() => router.push('/dashboard')}
            className="back-btn"
          >
            ← Volver al Dashboard
          </button>
          <div className="header-content">
            <div className="header-main">
              <h1 className="tournament-title">{tournament.title}</h1>
              <span className={`tournament-status ${tournament.status}`}>
                {tournament.status === 'active' ? 'Activo' : 
                 tournament.status === 'draft' ? 'Borrador' :
                 tournament.status === 'completed' ? 'Finalizado' : 'Cancelado'}
              </span>
            </div>
            {tournament.description && (
              <p className="tournament-description">{tournament.description}</p>
            )}
          </div>
        </header>

        <div className="tournament-content">
          {/* Información General */}
          <div className="info-section">
            <h2 className="section-title">📋 Información General</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">📅 Fecha:</span>
                <span className="info-value">{formatDate(tournament.date)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🕒 Hora:</span>
                <span className="info-value">{formatTime(tournament.time)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📍 Ubicación:</span>
                <span className="info-value">{tournament.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🏆 Formato:</span>
                <span className="info-value">{getFormatDisplayName(tournament.format)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🎯 Juegos por Ronda:</span>
                <span className="info-value">{tournament.games_per_round}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📊 Ranking por:</span>
                <span className="info-value">{getRankingCriteriaDisplayName(tournament.ranking_criteria)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">💺 Puntos Sit Out:</span>
                <span className="info-value">{tournament.sit_out_points}</span>
              </div>
              <div className="info-item">
                <span className="info-label">👥 Gestión de Jugadores:</span>
                <span className="info-value">
                  {tournament.player_management === 'manual' ? 'Manual' : 'Por Enlace'}
                </span>
              </div>
            </div>
          </div>

          {/* Jugadores */}
          <div className="info-section">
            <h2 className="section-title">👥 Jugadores ({tournament.players?.length || 0})</h2>
            {tournament.players && tournament.players.length > 0 ? (
              <div className="players-grid">
                {tournament.players.map((player, index) => (
                  <div key={player.id || index} className="player-card">
                    <div className="player-info">
                      <h4 className="player-name">
                        {player.name} {player.lastName || ''}
                      </h4>
                      <div className="player-details">
                        <span className="player-contact">📧 {player.email}</span>
                        <span className="player-contact">📱 {player.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay jugadores registrados en este torneo.</p>
              </div>
            )}
          </div>

          {/* Pistas */}
          <div className="info-section">
            <h2 className="section-title">🎾 Pistas ({tournament.courts?.length || 0})</h2>
            {tournament.courts && tournament.courts.length > 0 ? (
              <div className="courts-grid">
                {tournament.courts.map((court, index) => (
                  <div key={court.id || index} className="court-card">
                    <div className="court-info">
                      <h4 className="court-name">🎾 {court.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay pistas asignadas a este torneo.</p>
              </div>
            )}
          </div>

          {/* Cuadro del Torneo */}
          {tournament.matches && tournament.matches.rounds && tournament.matches.rounds.length > 0 && (
            <div className="info-section">
              <h2 className="section-title">🏆 Cuadro del Torneo</h2>
              <div className="tournament-bracket">
                <div className="bracket-info">
                  <div className="bracket-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total de Rondas:</span>
                      <span className="stat-value">{tournament.matches.totalRounds}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total de Partidos:</span>
                      <span className="stat-value">{tournament.matches.totalMatches}</span>
                    </div>
                  </div>
                </div>

                <div className="rounds-container">
                  {tournament.matches.rounds.map((round: TournamentRound, roundIndex: number) => (
                    <div key={roundIndex} className="round-section">
                      <h3 className="round-title">
                        Ronda {round.roundNumber}
                        {round.sitOutPlayers && round.sitOutPlayers.length > 0 && (
                          <span className="sit-out-info">
                            (Descansan: {round.sitOutPlayers.map(p => p.name).join(', ')})
                          </span>
                        )}
                      </h3>
                      
                      <div className="matches-grid">
                        {round.matches.map((match, matchIndex) => (
                          <div key={matchIndex} className="match-card">
                            <div className="match-header">
                              <span className="match-number">Partido {match.gameNumber || matchIndex + 1}</span>
                              <span className="match-court">🎾 {match.court.name}</span>
                            </div>
                            
                            <div className="match-content">
                              <div className="pair">
                                <div className="pair-header">Pareja 1</div>
                                <div className="players">
                                  <span className="player">{match.pair1.player1.name}</span>
                                  <span className="player">{match.pair1.player2.name}</span>
                                </div>
                              </div>
                              
                              <div className="vs-divider">VS</div>
                              
                              <div className="pair">
                                <div className="pair-header">Pareja 2</div>
                                <div className="players">
                                  <span className="player">{match.pair2.player1.name}</span>
                                  <span className="player">{match.pair2.player2.name}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="match-status">
                              <span className={`status ${match.status}`}>
                                {match.status === 'pending' ? 'Pendiente' :
                                 match.status === 'completed' ? 'Completado' : 'Cancelado'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div className="info-section">
            <h2 className="section-title">ℹ️ Información del Sistema</h2>
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">📅 Creado:</span>
                <span className="info-value">
                  {new Date(tournament.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">🔄 Última actualización:</span>
                <span className="info-value">
                  {new Date(tournament.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
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
          flex-direction: column;
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
          align-self: flex-start;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .tournament-title {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          flex: 1;
        }

        .tournament-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .tournament-status.active {
          background: rgba(46, 204, 113, 0.2);
          color: #27ae60;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .tournament-status.draft {
          background: rgba(241, 196, 15, 0.2);
          color: #f39c12;
          border: 1px solid rgba(241, 196, 15, 0.3);
        }

        .tournament-status.completed {
          background: rgba(149, 165, 166, 0.2);
          color: #7f8c8d;
          border: 1px solid rgba(149, 165, 166, 0.3);
        }

        .tournament-description {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.5;
        }

        .tournament-content {
          padding: 0;
        }

        .info-section {
          padding: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-section:last-child {
          border-bottom: none;
        }

        .section-title {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 22px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
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

        .player-info,
        .court-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .player-name,
        .court-name {
          margin: 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .player-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .player-contact {
          font-size: 14px;
          color: #7f8c8d;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #7f8c8d;
        }

        .tournament-bracket {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }

        .bracket-info {
          margin-bottom: 30px;
        }

        .bracket-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 500;
        }

        .stat-value {
          font-size: 18px;
          color: #2c3e50;
          font-weight: 600;
        }

        .rounds-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .round-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }

        .round-title {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sit-out-info {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 400;
        }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .match-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .match-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }

        .match-number {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .match-court {
          font-size: 14px;
          color: #7f8c8d;
        }

        .match-content {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .pair {
          flex: 1;
          text-align: center;
        }

        .pair-header {
          font-size: 12px;
          color: #7f8c8d;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .players {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .player {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
        }

        .vs-divider {
          font-weight: 600;
          color: #7f8c8d;
          font-size: 14px;
        }

        .match-status {
          text-align: center;
        }

        .status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status.pending {
          background: rgba(241, 196, 15, 0.2);
          color: #f39c12;
          border: 1px solid rgba(241, 196, 15, 0.3);
        }

        .status.completed {
          background: rgba(46, 204, 113, 0.2);
          color: #27ae60;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .status.cancelled {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .system-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 40px;
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
          font-size: 16px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .league-details-container {
            padding: 10px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .players-grid,
          .courts-grid {
            grid-template-columns: 1fr;
          }

          .matches-grid {
            grid-template-columns: 1fr;
          }

          .bracket-stats {
            grid-template-columns: 1fr;
          }

          .header-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .tournament-title {
            font-size: 24px;
          }

          .match-content {
            flex-direction: column;
            gap: 10px;
          }

          .vs-divider {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  )
}

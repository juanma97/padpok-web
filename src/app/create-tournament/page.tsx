'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

// Tipos para el torneo
export interface Player {
  id: string
  name: string
  lastName: string
  phone: string
  email: string
}

export interface Court {
  id: string
  name: string
}

export interface TournamentData {
  // Información básica
  title: string
  description: string
  location: string
  date: string
  time: string
  
  // Formato
  format: 'classic-americano' | 'mixed-americano' | 'team-americano'
  
  // Jugadores
  playerManagement: 'manual' | 'link'
  players: Player[]
  
  // Pistas
  courts: Court[]
  
  // Configuración del torneo
  gamesPerRound: number
  rankingCriteria: 'points' | 'wins'
  sitOutPoints: number
}

// Componente principal
export default function CreateTournamentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [tournamentData, setTournamentData] = useState<TournamentData>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    format: 'classic-americano',
    playerManagement: 'manual',
    players: [],
    courts: [],
    gamesPerRound: 3,
    rankingCriteria: 'points',
    sitOutPoints: 5
  })

  React.useEffect(() => {
    if (!loading && !user) {
      console.log('Redirigiendo a login - no hay usuario')
      router.push('/')
    }
  }, [user, loading, router])

  const updateTournamentData = (updates: Partial<TournamentData>) => {
    setTournamentData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('Usuario no autenticado')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      console.log('Torneo creado:', tournamentData)
      // TODO: Implementar guardado en base de datos
      alert('Torneo creado exitosamente (mock)')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error inesperado al crear el torneo:', error)
      setSubmitError('Error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className="create-league-container">
      <div className="create-league-wrapper">
        <header className="create-league-header">
          <button 
            onClick={() => router.push('/dashboard')}
            className="back-btn"
          >
            ← Volver al Dashboard
          </button>
          <h1>Crear Nuevo Torneo</h1>
          <div className="step-indicator">
            <span>Paso {currentStep} de {totalSteps}</span>
          </div>
        </header>

        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="form-container">
          {currentStep === 1 && (
            <BasicInfoStep 
              data={tournamentData} 
              onUpdate={updateTournamentData}
            />
          )}
          
          {currentStep === 2 && (
            <FormatStep 
              data={tournamentData} 
              onUpdate={updateTournamentData}
            />
          )}
          
          {currentStep === 3 && (
            <PlayersStep 
              data={tournamentData} 
              onUpdate={updateTournamentData}
            />
          )}
          
          {currentStep === 4 && (
            <CourtsStep 
              data={tournamentData} 
              onUpdate={updateTournamentData}
            />
          )}
          
          {currentStep === 5 && (
            <ConfigurationStep 
              data={tournamentData} 
              onUpdate={updateTournamentData}
            />
          )}
        </div>

        {submitError && (
          <div className="submit-error">
            {submitError}
          </div>
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              onClick={prevStep} 
              className="nav-btn secondary"
              disabled={isSubmitting}
            >
              Anterior
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button onClick={nextStep} className="nav-btn primary">
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="nav-btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando Torneo...' : 'Crear Torneo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente: Información Básica
function BasicInfoStep({ data, onUpdate }: { data: TournamentData; onUpdate: (updates: Partial<TournamentData>) => void }) {
  return (
    <div className="step-content">
      <h2>Información Básica</h2>
      <p>Proporciona los detalles principales de tu torneo americano</p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="title">Título del Torneo</label>
          <input
            type="text"
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ej: Torneo Americano de Verano"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe tu torneo..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Lugar</label>
          <input
            type="text"
            id="location"
            value={data.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="Ej: Club de Pádel Las Rozas"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              value={data.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Hora de Inicio</label>
            <input
              type="time"
              id="time"
              value={data.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente: Formato del Torneo
function FormatStep({ data, onUpdate }: { data: TournamentData; onUpdate: (updates: Partial<TournamentData>) => void }) {
  const formats = [
    {
      id: 'classic-americano',
      name: 'Classic Americano',
      description: 'Formato tradicional, parejas rotan cada ronda'
    },
    {
      id: 'mixed-americano',
      name: 'Mixed Americano',
      description: 'Parejas mixtas, alternando hombre-mujer'
    },
    {
      id: 'team-americano',
      name: 'Team Americano',
      description: 'Equipos fijos que compiten entre sí'
    }
  ]

  return (
    <div className="step-content">
      <h2>Formato del Torneo</h2>
      <p>Selecciona el tipo de torneo americano que quieres organizar</p>

      <div className="format-options">
        {formats.map((format) => (
          <div 
            key={format.id}
            className={`format-option ${data.format === format.id ? 'selected' : ''}`}
            onClick={() => onUpdate({ format: format.id as TournamentData['format'] })}
          >
            <h3>{format.name}</h3>
            <p>{format.description}</p>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h4>Información sobre formatos:</h4>
        <ul>
          <li><strong>Classic:</strong> Las parejas se forman aleatoriamente cada ronda</li>
          <li><strong>Mixed:</strong> Siempre hay un hombre y una mujer por pareja</li>
          <li><strong>Team:</strong> Los equipos se mantienen fijos durante todo el torneo</li>
        </ul>
      </div>
    </div>
  )
}

// Componente: Gestión de Jugadores
function PlayersStep({ data, onUpdate }: { data: TournamentData; onUpdate: (updates: Partial<TournamentData>) => void }) {
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: ''
  })

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.lastName) {
      const player: Player = {
        id: Date.now().toString(),
        ...newPlayer
      }
      onUpdate({ players: [...data.players, player] })
      setNewPlayer({ name: '', lastName: '', phone: '', email: '' })
    }
  }

  const removePlayer = (playerId: string) => {
    onUpdate({ players: data.players.filter(p => p.id !== playerId) })
  }

  return (
    <div className="step-content">
      <h2>Gestión de Jugadores</h2>
      <p>Añade jugadores o genera un enlace para que se apunten</p>

      <div className="player-management-options">
        <label className="radio-option">
          <input
            type="radio"
            name="playerManagement"
            value="manual"
            checked={data.playerManagement === 'manual'}
            onChange={(e) => onUpdate({ playerManagement: e.target.value as 'manual' | 'link' })}
          />
          <span>Añadir jugadores manualmente</span>
        </label>

        <label className="radio-option">
          <input
            type="radio"
            name="playerManagement"
            value="link"
            checked={data.playerManagement === 'link'}
            onChange={(e) => onUpdate({ playerManagement: e.target.value as 'manual' | 'link' })}
          />
          <span>Generar enlace de inscripción</span>
        </label>
      </div>

      {data.playerManagement === 'manual' && (
        <div className="manual-players">
          <div className="add-player-form">
            <h3>Añadir Jugador</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Nombre"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={newPlayer.lastName}
                onChange={(e) => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="tel"
                placeholder="Teléfono"
                value={newPlayer.phone}
                onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={newPlayer.email}
                onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
              />
            </div>
            <button type="button" onClick={addPlayer} className="add-btn">
              Añadir Jugador
            </button>
          </div>

          <div className="players-list">
            <h3>Jugadores Añadidos ({data.players.length})</h3>
            {data.players.length === 0 ? (
              <div className="empty-state">
                <p>No hay jugadores añadidos aún</p>
              </div>
            ) : (
              data.players.map((player) => (
                <div key={player.id} className="player-item">
                  <div className="player-info">
                    <span className="player-name">{player.name} {player.lastName}</span>
                    <span className="player-contact">{player.phone} • {player.email}</span>
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {data.playerManagement === 'link' && (
        <div className="info-box">
          <h4>🔗 Enlace de Invitación</h4>
          <p>Esta funcionalidad se implementará próximamente. Los jugadores podrán unirse usando un enlace único.</p>
        </div>
      )}
    </div>
  )
}

// Componente: Configuración de Pistas
function CourtsStep({ data, onUpdate }: { data: TournamentData; onUpdate: (updates: Partial<TournamentData>) => void }) {
  const [newCourtName, setNewCourtName] = useState('')

  const addCourt = () => {
    if (newCourtName.trim()) {
      const court: Court = {
        id: Date.now().toString(),
        name: newCourtName.trim()
      }
      onUpdate({ courts: [...data.courts, court] })
      setNewCourtName('')
    }
  }

  const removeCourt = (courtId: string) => {
    onUpdate({ courts: data.courts.filter(c => c.id !== courtId) })
  }

  return (
    <div className="step-content">
      <h2>Configuración de Pistas</h2>
      <p>Define las pistas donde se jugará el torneo</p>

      <div className="add-court-form">
        <h3>Añadir Pista</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Nombre de la pista (Ej: Pista Central)"
            value={newCourtName}
            onChange={(e) => setNewCourtName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCourt()}
          />
          <button type="button" onClick={addCourt} className="add-btn">
            Añadir
          </button>
        </div>
      </div>

      <div className="courts-list">
        <h3>Pistas del Torneo ({data.courts.length})</h3>
        {data.courts.length === 0 ? (
          <div className="empty-state">
            <p>No hay pistas añadidas aún</p>
            <p>Se recomienda tener al menos 2 pistas para un torneo</p>
          </div>
        ) : (
          data.courts.map((court) => (
            <div key={court.id} className="court-item">
              <span className="court-name">🎾 {court.name}</span>
              <button 
                onClick={() => removeCourt(court.id)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {data.courts.length > 0 && (
        <div className="info-box">
          <h4>📋 Información sobre pistas:</h4>
          <p>Con {data.courts.length} pista{data.courts.length !== 1 ? 's' : ''}, podrás acomodar aproximadamente {data.courts.length * 4} jugadores por ronda.</p>
        </div>
      )}
    </div>
  )
}

// Componente: Configuración del Torneo
function ConfigurationStep({ data, onUpdate }: { data: TournamentData; onUpdate: (updates: Partial<TournamentData>) => void }) {
  return (
    <div className="step-content">
      <h2>Configuración del Torneo</h2>
      <p>Define las reglas y configuración específica del torneo</p>

      <div className="config-grid">
        <div className="config-group">
          <label htmlFor="gamesPerRound">Juegos por Ronda</label>
          <select
            id="gamesPerRound"
            value={data.gamesPerRound}
            onChange={(e) => onUpdate({ gamesPerRound: parseInt(e.target.value) })}
          >
            <option value={2}>2 juegos</option>
            <option value={3}>3 juegos</option>
            <option value={4}>4 juegos</option>
            <option value={5}>5 juegos</option>
          </select>
          <small>Número de juegos que juega cada pareja por ronda</small>
        </div>

        <div className="config-group">
          <label htmlFor="rankingCriteria">Ordenación del Ranking</label>
          <select
            id="rankingCriteria"
            value={data.rankingCriteria}
            onChange={(e) => onUpdate({ rankingCriteria: e.target.value as 'points' | 'wins' })}
          >
            <option value="points">Por Puntos</option>
            <option value="wins">Por Victorias</option>
          </select>
          <small>Criterio principal para ordenar el ranking</small>
        </div>

        <div className="config-group">
          <label htmlFor="sitOutPoints">Puntos Sit Out</label>
          <input
            type="number"
            id="sitOutPoints"
            min={0}
            max={20}
            value={data.sitOutPoints}
            onChange={(e) => onUpdate({ sitOutPoints: parseInt(e.target.value) || 0 })}
          />
          <small>Puntos otorgados cuando un jugador no juega por número impar</small>
        </div>
      </div>

      <div className="tournament-summary">
        <h3>Resumen del Torneo</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Título:</strong> {data.title || 'Sin título'}
          </div>
          <div className="summary-item">
            <strong>Formato:</strong> {
              data.format === 'classic-americano' ? 'Classic Americano' :
              data.format === 'mixed-americano' ? 'Mixed Americano' :
              'Team Americano'
            }
          </div>
          <div className="summary-item">
            <strong>Fecha:</strong> {data.date ? new Date(data.date).toLocaleDateString('es-ES') : 'No especificada'}
          </div>
          <div className="summary-item">
            <strong>Lugar:</strong> {data.location || 'No especificado'}
          </div>
          <div className="summary-item">
            <strong>Jugadores:</strong> {data.players.length}
          </div>
          <div className="summary-item">
            <strong>Pistas:</strong> {data.courts.length}
          </div>
          <div className="summary-item">
            <strong>Juegos por ronda:</strong> {data.gamesPerRound}
          </div>
          <div className="summary-item">
            <strong>Ranking por:</strong> {data.rankingCriteria === 'points' ? 'Puntos' : 'Victorias'}
          </div>
        </div>
      </div>
    </div>
  )
}

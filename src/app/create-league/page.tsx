'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

// Tipos para la liga
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

export interface LeagueData {
  // Información básica
  title: string
  description: string
  date: string
  time: string
  location: string
  
  // Formato
  format: 'todos-vs-todos' | 'box-league' | 'grupos-playoffs'
  
  // Jugadores
  playerManagement: 'manual' | 'link'
  players: Player[]
  
  // Pistas
  courts: Court[]
  
  // Sistema de puntuación
  scoringSystem: '3-1-0' | 'sets-ganados'
}

// Componente principal
export default function CreateLeaguePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [leagueData, setLeagueData] = useState<LeagueData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    format: 'todos-vs-todos',
    playerManagement: 'manual',
    players: [],
    courts: [],
    scoringSystem: '3-1-0'
  })

  // Hook debe estar antes de cualquier return condicional
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  // Si no hay usuario después de cargar, mostrar mensaje
  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirigiendo al login...</p>
      </div>
    )
  }

  const updateLeagueData = (updates: Partial<LeagueData>) => {
    setLeagueData(prev => ({ ...prev, ...updates }))
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

  const handleSubmit = () => {
    // TODO: Implementar guardado en base de datos
    console.log('Liga creada:', leagueData)
    router.push('/dashboard')
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
          <h1>Crear Nueva Liga</h1>
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
              data={leagueData}
              onUpdate={updateLeagueData}
            />
          )}
          
          {currentStep === 2 && (
            <FormatStep 
              data={leagueData}
              onUpdate={updateLeagueData}
            />
          )}
          
          {currentStep === 3 && (
            <PlayersStep 
              data={leagueData}
              onUpdate={updateLeagueData}
            />
          )}
          
          {currentStep === 4 && (
            <CourtsStep 
              data={leagueData}
              onUpdate={updateLeagueData}
            />
          )}
          
          {currentStep === 5 && (
            <ScoringStep 
              data={leagueData}
              onUpdate={updateLeagueData}
            />
          )}
        </div>

        <div className="form-navigation">
          {currentStep > 1 && (
            <button onClick={prevStep} className="nav-btn secondary">
              Anterior
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button onClick={nextStep} className="nav-btn primary">
              Siguiente
            </button>
          ) : (
            <button onClick={handleSubmit} className="nav-btn primary">
              Crear Liga
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 1: Información básica
function BasicInfoStep({ 
  data, 
  onUpdate 
}: { 
  data: LeagueData
  onUpdate: (updates: Partial<LeagueData>) => void 
}) {
  return (
    <div className="step-content">
      <h2>Información Básica</h2>
      <p>Proporciona los detalles principales de tu liga</p>

      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="title">Título de la Liga *</label>
          <input
            type="text"
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ej: Liga de Verano 2024"
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe tu liga de pádel..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Fecha de Inicio *</label>
          <input
            type="date"
            id="date"
            value={data.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Hora de Inicio *</label>
          <input
            type="time"
            id="time"
            value={data.time}
            onChange={(e) => onUpdate({ time: e.target.value })}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="location">Lugar *</label>
          <input
            type="text"
            id="location"
            value={data.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="Ej: Club de Pádel Las Rozas"
            required
          />
        </div>
      </div>
    </div>
  )
}

// Step 2: Formato de la liga
function FormatStep({ 
  data, 
  onUpdate 
}: { 
  data: LeagueData
  onUpdate: (updates: Partial<LeagueData>) => void 
}) {
  const formats = [
    {
      id: 'todos-vs-todos',
      name: 'Todos vs Todos',
      description: 'Cada pareja juega contra todas las demás'
    },
    {
      id: 'box-league',
      name: 'Box League',
      description: 'Sistema de cajas con ascensos y descensos'
    },
    {
      id: 'grupos-playoffs',
      name: 'Grupos + Playoffs',
      description: 'Fase de grupos seguida de eliminatorias'
    }
  ]

  return (
    <div className="step-content">
      <h2>Formato de la Liga</h2>
      <p>Selecciona el formato que mejor se adapte a tu liga</p>

      <div className="format-options">
        {formats.map((format) => (
          <div 
            key={format.id}
            className={`format-option ${data.format === format.id ? 'selected' : ''}`}
            onClick={() => onUpdate({ format: format.id as LeagueData['format'] })}
          >
            <h3>{format.name}</h3>
            <p>{format.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 3: Gestión de jugadores
function PlayersStep({ 
  data, 
  onUpdate 
}: { 
  data: LeagueData
  onUpdate: (updates: Partial<LeagueData>) => void 
}) {
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
    onUpdate({ 
      players: data.players.filter(p => p.id !== playerId) 
    })
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
            <button onClick={addPlayer} className="add-btn">
              Añadir Jugador
            </button>
          </div>

          <div className="players-list">
            <h3>Jugadores ({data.players.length})</h3>
            {data.players.map((player) => (
              <div key={player.id} className="player-item">
                <div className="player-info">
                  <strong>{player.name} {player.lastName}</strong>
                  <span>{player.phone} | {player.email}</span>
                </div>
                <button 
                  onClick={() => removePlayer(player.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.playerManagement === 'link' && (
        <div className="link-management">
          <div className="info-box">
            <p>📧 Se generará un enlace único que podrás compartir para que los jugadores se inscriban automáticamente.</p>
            <p><strong>Nota:</strong> Esta funcionalidad se implementará en la siguiente fase.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 4: Configuración de pistas
function CourtsStep({ 
  data, 
  onUpdate 
}: { 
  data: LeagueData
  onUpdate: (updates: Partial<LeagueData>) => void 
}) {
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
    onUpdate({ 
      courts: data.courts.filter(c => c.id !== courtId) 
    })
  }

  return (
    <div className="step-content">
      <h2>Configuración de Pistas</h2>
      <p>Añade las pistas donde se jugará la liga</p>

      <div className="add-court-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Nombre de la pista (Ej: Pista 1, Pista Central...)"
            value={newCourtName}
            onChange={(e) => setNewCourtName(e.target.value)}
          />
          <button onClick={addCourt} className="add-btn">
            Añadir Pista
          </button>
        </div>
      </div>

      <div className="courts-list">
        <h3>Pistas ({data.courts.length})</h3>
        {data.courts.length === 0 && (
          <p className="empty-state">No hay pistas añadidas. Añade al menos una pista.</p>
        )}
        {data.courts.map((court, index) => (
          <div key={court.id} className="court-item">
            <div className="court-info">
              <strong>Pista {index + 1}:</strong> {court.name}
            </div>
            <button 
              onClick={() => removeCourt(court.id)}
              className="remove-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 5: Sistema de puntuación
function ScoringStep({ 
  data, 
  onUpdate 
}: { 
  data: LeagueData
  onUpdate: (updates: Partial<LeagueData>) => void 
}) {
  const scoringSystems = [
    {
      id: '3-1-0',
      name: 'Sistema 3/1/0',
      description: '3 puntos por victoria, 1 punto por empate, 0 puntos por derrota'
    },
    {
      id: 'sets-ganados',
      name: 'Sets Ganados',
      description: 'Clasificación por número total de sets ganados'
    }
  ]

  return (
    <div className="step-content">
      <h2>Sistema de Puntuación</h2>
      <p>Selecciona cómo se puntuará la liga</p>

      <div className="scoring-options">
        {scoringSystems.map((system) => (
          <div 
            key={system.id}
            className={`scoring-option ${data.scoringSystem === system.id ? 'selected' : ''}`}
            onClick={() => onUpdate({ scoringSystem: system.id as LeagueData['scoringSystem'] })}
          >
            <h3>{system.name}</h3>
            <p>{system.description}</p>
          </div>
        ))}
      </div>

      <div className="league-summary">
        <h3>Resumen de la Liga</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Título:</strong> {data.title || 'Sin título'}
          </div>
          <div className="summary-item">
            <strong>Formato:</strong> {
              data.format === 'todos-vs-todos' ? 'Todos vs Todos' :
              data.format === 'box-league' ? 'Box League' :
              'Grupos + Playoffs'
            }
          </div>
          <div className="summary-item">
            <strong>Jugadores:</strong> {data.players.length} jugadores
          </div>
          <div className="summary-item">
            <strong>Pistas:</strong> {data.courts.length} pistas
          </div>
          <div className="summary-item">
            <strong>Fecha:</strong> {data.date || 'Sin fecha'} {data.time && `a las ${data.time}`}
          </div>
          <div className="summary-item">
            <strong>Lugar:</strong> {data.location || 'Sin lugar'}
          </div>
        </div>
      </div>
    </div>
  )
}

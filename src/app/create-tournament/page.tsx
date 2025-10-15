'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { useClients } from '@/shared/hooks/useClients'
import { useCourts } from '@/shared/hooks/useCourts'
import { TournamentService } from '@/backend/tournamentService'
import { UserService } from '@/backend/userService'
import { TournamentCalendarFactory } from '@/factories/TournamentCalendarFactory'

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
      router.push('/')
    }
  }, [user, loading, router])

  const updateTournamentData = (updates: Partial<TournamentData>) => {
    setTournamentData(prev => ({ ...prev, ...updates }))
  }

  // Función de validación por paso
  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 1: // Información básica
        if (!tournamentData.title.trim()) {
          return 'El título del torneo es obligatorio'
        }
        if (!tournamentData.date) {
          return 'La fecha del torneo es obligatoria'
        }
        if (!tournamentData.time) {
          return 'La hora del torneo es obligatoria'
        }
        if (!tournamentData.location.trim()) {
          return 'La ubicación del torneo es obligatoria'
        }
        // Validar que la fecha no sea anterior a hoy
        const selectedDate = new Date(tournamentData.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          return 'No puedes crear un torneo con fecha anterior al día de hoy'
        }
        break

      case 2: // Formato del torneo
        if (!tournamentData.format) {
          return 'Debes seleccionar un formato de torneo'
        }
        break

      case 3: // Gestión de jugadores
        if (tournamentData.players.length === 0) {
          return 'Debes añadir al menos un jugador al torneo'
        }
        break

      case 4: // Configuración de pistas
        if (tournamentData.courts.length === 0) {
          return 'Debes añadir al menos una pista al torneo'
        }
        break

      case 5: // Configuración del torneo
        if (!tournamentData.gamesPerRound || tournamentData.gamesPerRound < 1) {
          return 'Debes especificar al menos 1 juego por ronda'
        }
        if (!tournamentData.rankingCriteria) {
          return 'Debes seleccionar un criterio de ranking'
        }
        break

      default:
        break
    }
    return null // Todo válido
  }

  const nextStep = () => {
    // Validar el paso actual antes de avanzar
    const validationError = validateCurrentStep()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    // Limpiar error si la validación es exitosa
    setSubmitError(null)
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Función para convertir tipos locales a tipos de calendario
  const convertToTournamentCalendarTypes = () => {
    const calendarPlayers = tournamentData.players.map(player => ({
      id: player.id,
      name: `${player.name} ${player.lastName}`,
      email: player.email,
      phone: player.phone
    }))

    const calendarCourts = tournamentData.courts.map(court => ({
      id: court.id,
      name: court.name,
      number: court.id // Usar el ID como número por ahora
    }))

    return { calendarPlayers, calendarCourts }
  }

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('Usuario no autenticado')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Obtener el ID del usuario en nuestra tabla
      const { user: userRecord, error: userError } = await UserService.getUserByAuthId(user.id)
      
      if (userError || !userRecord) {
        setSubmitError('No se pudo encontrar el perfil del usuario')
        return
      }

      // Solo generar cuadro automáticamente si el formato es 'classic-americano'
      let tournamentCalendar: any = null
      if (tournamentData.format === 'classic-americano') {
        try {
          // Convertir tipos y generar cuadro automáticamente
          const { calendarPlayers, calendarCourts } = convertToTournamentCalendarTypes()
          
          const tournamentService = TournamentCalendarFactory.create()
          const calendarResult = tournamentService.generateTournament({
            players: calendarPlayers,
            courts: calendarCourts,
            tournamentId: 'temp_id', // Se actualizará después
            gamesPerRound: tournamentData.gamesPerRound,
            format: tournamentData.format,
            sitOutPoints: tournamentData.sitOutPoints
          })

          if (!calendarResult.success || !calendarResult.calendar) {
            setSubmitError(calendarResult.error || 'Error al generar el cuadro del torneo')
            return
          }

          tournamentCalendar = calendarResult.calendar
        } catch (calendarError) {
          console.error('Error al generar cuadro:', calendarError)
          setSubmitError('Error al generar el cuadro automático del torneo')
          return
        }
      }

      // Preparar datos para guardar en base de datos
      const tournamentDataForDB = {
        creator_id: userRecord.id,
        title: tournamentData.title,
        description: tournamentData.description || null,
        date: tournamentData.date,
        time: tournamentData.time,
        location: tournamentData.location,
        format: tournamentData.format,
        player_management: tournamentData.playerManagement,
        players: tournamentData.players,
        courts: tournamentData.courts,
        games_per_round: tournamentData.gamesPerRound,
        ranking_criteria: tournamentData.rankingCriteria,
        sit_out_points: tournamentData.sitOutPoints,
        status: 'active' as const,
        // Agregar el cuadro generado si existe
        matches: tournamentCalendar
      }
      
      // Guardar en base de datos
      const { tournament, error } = await TournamentService.createTournament(tournamentDataForDB)

      if (error) {
        console.error('Error al crear el torneo:', error)
        setSubmitError(error)
        return
      }

      if (!tournament) {
        console.error('Error inesperado: no se devolvió el torneo creado')
        setSubmitError('Error inesperado al crear el torneo')
        return
      }

      // Si se generó un cuadro, actualizar el ID del torneo en el cuadro
      if (tournamentCalendar && tournament.id) {
        tournamentCalendar.tournamentId = tournament.id
        // TODO: Actualizar el cuadro en la base de datos con el ID correcto
      }
      
      // Redirigir al dashboard
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
  const { clients, loading: clientsLoading, addClient } = useClients()
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [showExistingClients, setShowExistingClients] = useState(false)

  const addPlayer = async () => {
    if (newPlayer.name && newPlayer.lastName) {
      // Guardar en la base de datos
      const clientData = {
        name: `${newPlayer.name} ${newPlayer.lastName}`,
        phone: newPlayer.phone,
        email: newPlayer.email
      }
      
      const result = await addClient(clientData)
      
      if (result.success) {
        // Añadir a la lista local de jugadores
        const player: Player = {
          id: Date.now().toString(),
          ...newPlayer
        }
        onUpdate({ players: [...data.players, player] })
        setNewPlayer({ name: '', lastName: '', phone: '', email: '' })
      } else {
        alert(result.error || 'Error al guardar el jugador')
      }
    }
  }

  const addExistingClient = (client: any) => {
    // Verificar si ya está añadido
    const isAlreadyAdded = data.players.some(p => p.email === client.email)
    if (isAlreadyAdded) {
      alert('Este jugador ya está añadido al torneo')
      return
    }

    // Separar nombre y apellidos (asumiendo que están en un solo campo)
    const nameParts = client.name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const player: Player = {
      id: client.id,
      name: firstName,
      lastName: lastName,
      phone: client.phone,
      email: client.email
    }
    
    onUpdate({ players: [...data.players, player] })
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
          {/* Botón para alternar entre añadir nuevo y seleccionar existente */}
          <div className="player-add-options">
            <button 
              type="button"
              onClick={() => setShowExistingClients(!showExistingClients)}
              className="toggle-btn"
            >
              {showExistingClients ? 'Añadir Nuevo Jugador' : 'Seleccionar Jugador Existente'}
            </button>
          </div>

          {!showExistingClients ? (
            <div className="add-player-form">
              <h3>Añadir Nuevo Jugador</h3>
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
          ) : (
            <div className="existing-clients">
              <h3>Seleccionar Jugadores Existentes</h3>
              {clientsLoading ? (
                <div className="loading-message">Cargando jugadores...</div>
              ) : clients.length === 0 ? (
                <div className="empty-message">
                  <p>No tienes jugadores guardados aún.</p>
                  <p>Añade tu primer jugador usando el formulario de arriba.</p>
                </div>
              ) : (
                <div className="clients-list">
                  {clients.map((client) => {
                    const isAlreadyAdded = data.players.some(p => p.email === client.email)
                    return (
                      <div key={client.id} className={`client-item ${isAlreadyAdded ? 'already-added' : ''}`}>
                        <div className="client-info">
                          <strong>{client.name}</strong>
                          <span>{client.phone} | {client.email}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => addExistingClient(client)}
                          className="add-client-btn"
                          disabled={isAlreadyAdded}
                        >
                          {isAlreadyAdded ? 'Ya añadido' : 'Añadir'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

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
                    type="button"
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
  const { courts, loading: courtsLoading, addCourt: addCourtToDB } = useCourts()
  const [newCourt, setNewCourt] = useState({
    name: '',
    number: ''
  })
  const [showExistingCourts, setShowExistingCourts] = useState(false)

  const addCourt = async () => {
    if (newCourt.name.trim() && newCourt.number.trim()) {
      // Guardar en la base de datos
      const result = await addCourtToDB({
        name: newCourt.name.trim(),
        number: newCourt.number.trim()
      })
      
      if (result.success) {
        // Añadir a la lista local de pistas
        const court: Court = {
          id: Date.now().toString(),
          name: `${newCourt.name.trim()} ${newCourt.number.trim()}`
        }
        onUpdate({ courts: [...data.courts, court] })
        setNewCourt({ name: '', number: '' })
      } else {
        alert(result.error || 'Error al guardar la pista')
      }
    }
  }

  const addExistingCourt = (court: any) => {
    // Verificar si ya está añadida
    const courtDisplayName = `${court.name} ${court.number}`
    const isAlreadyAdded = data.courts.some(c => c.name === courtDisplayName)
    if (isAlreadyAdded) {
      alert('Esta pista ya está añadida al torneo')
      return
    }

    const newCourtItem: Court = {
      id: court.id,
      name: courtDisplayName
    }
    
    onUpdate({ courts: [...data.courts, newCourtItem] })
  }

  const removeCourt = (courtId: string) => {
    onUpdate({ courts: data.courts.filter(c => c.id !== courtId) })
  }

  return (
    <div className="step-content">
      <h2>Configuración de Pistas</h2>
      <p>Define las pistas donde se jugará el torneo</p>

      {/* Botón para alternar entre añadir nueva y seleccionar existente */}
      <div className="court-add-options">
        <button 
          type="button"
          onClick={() => setShowExistingCourts(!showExistingCourts)}
          className="toggle-btn"
        >
          {showExistingCourts ? 'Añadir Nueva Pista' : 'Seleccionar Pista Existente'}
        </button>
      </div>

      {!showExistingCourts ? (
        <div className="add-court-form">
          <h3>Añadir Nueva Pista</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre (Ej: Pista, Cancha, Campo)"
              value={newCourt.name}
              onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Número (Ej: 1, 2, A, Central)"
              value={newCourt.number}
              onChange={(e) => setNewCourt({ ...newCourt, number: e.target.value })}
            />
            <button type="button" onClick={addCourt} className="add-btn">
              Añadir Pista
            </button>
          </div>
        </div>
      ) : (
        <div className="existing-courts">
          <h3>Seleccionar Pistas Existentes</h3>
          {courtsLoading ? (
            <div className="loading-message">Cargando pistas...</div>
          ) : courts.length === 0 ? (
            <div className="empty-message">
              <p>No tienes pistas guardadas aún.</p>
              <p>Añade tu primera pista usando el formulario de arriba.</p>
            </div>
          ) : (
            <div className="courts-grid">
              {courts.map((court) => {
                const courtDisplayName = `${court.name} ${court.number}`
                const isAlreadyAdded = data.courts.some(c => c.name === courtDisplayName)
                return (
                  <div key={court.id} className={`court-card ${isAlreadyAdded ? 'already-added' : ''}`}>
                    <div className="court-info">
                      <strong>{courtDisplayName}</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => addExistingCourt(court)}
                      className="add-court-btn"
                      disabled={isAlreadyAdded}
                    >
                      {isAlreadyAdded ? 'Ya añadida' : 'Añadir'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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
                type="button"
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
  // Calcular estadísticas del torneo para mostrar información útil
  const tournamentService = TournamentCalendarFactory.create()
  
  let tournamentStats = null
  let validationError = null
  
  try {
    if (data.players.length >= 4 && data.courts.length > 0) {
      // Convertir tipos para el cálculo
      const calendarPlayers = data.players.map(player => ({
        id: player.id,
        name: `${player.name} ${player.lastName}`,
        email: player.email,
        phone: player.phone
      }))
      
      const calendarCourts = data.courts.map(court => ({
        id: court.id,
        name: court.name,
        number: court.id
      }))
      
      // Validar configuración
      const validation = tournamentService.validateTournamentGeneration(
        calendarPlayers,
        calendarCourts,
        data.format,
        data.gamesPerRound
      )
      
      if (!validation.isValid) {
        validationError = validation.error
      } else {
        // Calcular estadísticas si la validación es exitosa
        tournamentStats = tournamentService.calculateTournamentStats(
          calendarPlayers,
          data.gamesPerRound,
          data.format
        )
      }
    }
  } catch (error) {
    console.error('Error calculando estadísticas del torneo:', error)
  }

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

      {/* Mostrar error de validación si existe */}
      {validationError && (
        <div className="error-box">
          <h4>⚠️ Error de Configuración</h4>
          <p>{validationError}</p>
        </div>
      )}

      {/* Mostrar estadísticas del torneo si están disponibles */}
      {tournamentStats && data.format === 'classic-americano' && (
        <div className="info-box">
          <h4>📊 Estadísticas del Torneo Classic Americano</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Total de Rondas:</strong> {tournamentStats.totalRounds}
            </div>
            <div className="stat-item">
              <strong>Total de Partidos:</strong> {tournamentStats.totalMatches}
            </div>
            <div className="stat-item">
              <strong>Duración Estimada:</strong> {tournamentStats.estimatedDuration}
            </div>
            <div className="stat-item">
              <strong>Partidos Simultáneos:</strong> {tournamentStats.maxSimultaneousMatches}
            </div>
          </div>
          <p><strong>Nota:</strong> En el formato Classic Americano, las parejas rotan cada ronda para que todos jueguen con diferentes compañeros.</p>
        </div>
      )}

      {/* Información específica para Classic Americano */}
      {data.format === 'classic-americano' && data.players.length > 0 && (
        <div className="info-box">
          <h4>ℹ️ Información del Classic Americano</h4>
          <ul>
            <li><strong>Rotación de parejas:</strong> Cada ronda se forman nuevas parejas automáticamente</li>
            <li><strong>Jugadores por partido:</strong> 4 jugadores (2 parejas)</li>
            {data.players.length % 4 !== 0 && (
              <li><strong>Jugadores que descansan:</strong> {data.players.length % 4} jugador(es) rotarán el descanso</li>
            )}
            <li><strong>Pistas necesarias:</strong> Mínimo {Math.floor(data.players.length / 4)} pista(s) para {data.players.length} jugadores</li>
          </ul>
        </div>
      )}
    </div>
  )
}

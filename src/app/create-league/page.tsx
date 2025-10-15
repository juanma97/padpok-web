'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { useClients } from '@/shared/hooks/useClients'
import { useCourts } from '@/shared/hooks/useCourts'
import { LeagueService } from '@/backend/leagueService'
import { UserService } from '@/backend/userService'
import { LeagueCalendarFactory } from '@/factories/LeagueCalendarFactory'
import { Player as CalendarPlayer, Court as CalendarCourt } from '@/shared/types/match'

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
  format: 'all-vs-all' | 'box-league' | 'groups-playoffs'
  
  // Jugadores
  playerManagement: 'manual' | 'link'
  players: Player[]
  
  // Pistas
  courts: Court[]
  
  // Sistema de puntuación
  scoringSystem: '3-1-0' | 'sets'
}

// Componente principal
export default function CreateLeaguePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [leagueData, setLeagueData] = useState<LeagueData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    format: 'all-vs-all',
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

  // Función de validación por paso
  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 1: // Información básica
        if (!leagueData.title.trim()) {
          return 'El título de la liga es obligatorio'
        }
        if (!leagueData.date) {
          return 'La fecha de la liga es obligatoria'
        }
        if (!leagueData.time) {
          return 'La hora de la liga es obligatoria'
        }
        if (!leagueData.location.trim()) {
          return 'La ubicación de la liga es obligatoria'
        }
        // Validar que la fecha no sea anterior a hoy
        const selectedDate = new Date(leagueData.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          return 'No puedes crear una liga con fecha anterior al día de hoy'
        }
        break

      case 2: // Formato de la liga
        if (!leagueData.format) {
          return 'Debes seleccionar un formato de liga'
        }
        break

      case 3: // Gestión de jugadores
        if (leagueData.players.length === 0) {
          return 'Debes añadir al menos un jugador a la liga'
        }
        if (leagueData.players.length < 4) {
          return 'Se necesitan al menos 4 jugadores para crear una liga'
        }
        if (leagueData.players.length % 2 !== 0) {
          return 'El número de jugadores debe ser par para formar parejas (modalidad 2vs2)'
        }
        break

      case 4: // Configuración de pistas
        if (leagueData.courts.length === 0) {
          return 'Debes añadir al menos una pista a la liga'
        }
        // Validar que haya suficientes pistas para los partidos simultáneos en rotación de pádel
        if (leagueData.players.length > 0) {
          const simultaneousMatches = Math.floor(leagueData.players.length / 4)
          if (leagueData.courts.length < simultaneousMatches) {
            return `Se necesitan al menos ${simultaneousMatches} pistas para ${leagueData.players.length} jugadores en rotación de pádel. Actualmente tienes ${leagueData.courts.length} pista(s).`
          }
        }
        break

      case 5: // Sistema de puntuación
        if (!leagueData.scoringSystem) {
          return 'Debes seleccionar un sistema de puntuación'
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

  // Función para convertir tipos locales a tipos del calendario
  const convertToCalendarTypes = () => {
    const calendarPlayers: CalendarPlayer[] = leagueData.players.map(player => ({
      id: player.id,
      name: player.name + (player.lastName ? ` ${player.lastName}` : ''),
      email: player.email,
      phone: player.phone
    }))

    const calendarCourts: CalendarCourt[] = leagueData.courts.map(court => ({
      id: court.id,
      name: court.name,
      number: '1' // Por defecto, ya que el tipo local no tiene number
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

      // Solo generar calendario si el formato es 'all-vs-all'
      let matches: any[] = []
      if (leagueData.format === 'all-vs-all') {
        try {
          // Convertir tipos y generar calendario automáticamente
          const { calendarPlayers, calendarCourts } = convertToCalendarTypes()
          
          const calendarService = LeagueCalendarFactory.create()
          const calendarResult = calendarService.generateCalendar({
            players: calendarPlayers,
            courts: calendarCourts,
            leagueId: 'temp_id' // Se actualizará después
          })

          if (!calendarResult.success || !calendarResult.calendar) {
            setSubmitError(calendarResult.error || 'Error al generar el calendario')
            return
          }

          matches = calendarResult.calendar.rounds
        } catch (calendarError) {
          console.error('Error al generar calendario:', calendarError)
          setSubmitError('Error al generar el calendario automático')
          return
        }
      }

      // Preparar datos para guardar en base de datos
      const leagueDataForDB = {
        creator_id: userRecord.id,
        title: leagueData.title,
        description: leagueData.description || null,
        date: leagueData.date,
        time: leagueData.time,
        location: leagueData.location,
        format: leagueData.format,
        player_management: leagueData.playerManagement,
        players: leagueData.players,
        courts: leagueData.courts,
        scoring_system: leagueData.scoringSystem,
        status: leagueData.format === 'all-vs-all' ? 'active' as const : 'draft' as const, // Activar automáticamente si es all-vs-all
        matches: matches
      }

      
      // Guardar en base de datos
      const { league, error } = await LeagueService.createLeague(leagueDataForDB)

      if (error) {
        console.error('Error al crear la liga:', error)
        setSubmitError(error)
        return
      }

      if (!league) {
        console.error('Error inesperado: no se devolvió la liga creada')
        setSubmitError('Error inesperado al crear la liga')
        return
      }
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error inesperado al crear la liga:', error)
      setSubmitError('Error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
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
              {isSubmitting ? 'Creando Liga...' : 'Crear Liga'}
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
      id: 'all-vs-all',
      name: 'Todos vs Todos',
      description: 'Cada pareja juega contra todas las demás'
    },
    {
      id: 'box-league',
      name: 'Box League',
      description: 'Sistema de cajas con ascensos y descensos'
    },
    {
      id: 'groups-playoffs',
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
  const { clients, loading: clientsLoading, addClient } = useClients()
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [showExistingClients, setShowExistingClients] = useState(false)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])

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
      alert('Este jugador ya está añadido a la liga')
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
                    <strong>{player.name} {player.lastName}</strong>
                    <span>{player.phone} | {player.email}</span>
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
      alert('Esta pista ya está añadida a la liga')
      return
    }

    const newCourtItem: Court = {
      id: court.id,
      name: courtDisplayName
    }
    
    onUpdate({ courts: [...data.courts, newCourtItem] })
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
        <h3>Pistas Añadidas ({data.courts.length})</h3>
        {data.courts.length === 0 ? (
          <p className="empty-state">No hay pistas añadidas. Añade al menos una pista.</p>
        ) : (
          data.courts.map((court, index) => (
            <div key={court.id} className="court-item">
              <div className="court-info">
                <strong>Pista {index + 1}:</strong> {court.name}
              </div>
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
      id: 'sets',
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
              data.format === 'all-vs-all' ? 'Todos vs Todos' :
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

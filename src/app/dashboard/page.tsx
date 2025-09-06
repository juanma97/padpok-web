'use client'

import React, { useState, memo, useMemo, useCallback } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useLeagues } from '@/shared/hooks/useLeagues'
import { useTournaments } from '@/shared/hooks/useTournaments'
import { useClients } from '@/shared/hooks/useClients'
import { useRouter } from 'next/navigation'

// Tipos
type MenuItem = 'overview' | 'leagues' | 'tournaments' | 'players' | 'courts'

// Componente de barra lateral memoizado
const Sidebar = memo(function Sidebar({ 
  activeItem, 
  onItemSelect, 
  onSignOut 
}: { 
  activeItem: MenuItem
  onItemSelect: (item: MenuItem) => void
  onSignOut: () => void 
}) {
  // Memoizar los items del menú ya que no cambian
  const menuItems = useMemo(() => [
    { id: 'overview' as MenuItem, label: 'Resumen', icon: '📊' },
    { id: 'leagues' as MenuItem, label: 'Mis Ligas', icon: '🏆' },
    { id: 'tournaments' as MenuItem, label: 'Mis Torneos', icon: '🥇' },
    { id: 'players' as MenuItem, label: 'Mis Jugadores', icon: '👥' },
    { id: 'courts' as MenuItem, label: 'Mis Pistas', icon: '🎾' },
  ], [])

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">padpok</h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onSignOut} className="sidebar-logout">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
})

// Componente de vista principal - Resumen memoizado
const OverviewView = memo(function OverviewView({ user, router }: { user: any; router: any }) {
  const { leagues, loading: leaguesLoading, getLeagueStats, getRecentLeagues } = useLeagues()
  const { tournaments, loading: tournamentsLoading, getTournamentStats, getRecentTournaments } = useTournaments()
  
  // Memoizar estadísticas para evitar recálculos innecesarios
  const leagueStats = useMemo(() => getLeagueStats(), [getLeagueStats])
  const tournamentStats = useMemo(() => getTournamentStats(), [getTournamentStats])
  const recentLeagues = useMemo(() => getRecentLeagues(2), [getRecentLeagues])
  const recentTournaments = useMemo(() => getRecentTournaments(2), [getRecentTournaments])
  return (
    <div className="main-content">
      <div className="content-header">
        <h2>¡Bienvenido, {user.user_metadata?.full_name || user.email}!</h2>
        <p>Gestiona tus ligas, torneos y jugadores desde aquí</p>
      </div>

      <div className="action-cards">
        <div className="action-card">
          <div className="action-icon">🏆</div>
          <h3>Crear Liga</h3>
          <p>Organiza una nueva liga deportiva</p>
          <button 
            onClick={() => router.push('/create-league')}
            className="action-btn"
          >
            Crear Liga
          </button>
        </div>

        <div className="action-card">
          <div className="action-icon">🥇</div>
          <h3>Crear Torneo</h3>
          <p>Inicia un nuevo torneo competitivo</p>
          <button 
            onClick={() => router.push('/create-tournament')}
            className="action-btn"
          >
            Crear Torneo
          </button>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3>Resumen de Ligas</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{leaguesLoading ? '...' : leagueStats.activeLeagues}</span>
              <span className="stat-label">Ligas Activas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{leaguesLoading ? '...' : leagueStats.totalPlayers}</span>
              <span className="stat-label">Jugadores Total</span>
            </div>
          </div>
          <div className="recent-items">
            <h4>Ligas Recientes</h4>
            <div className="item-list">
              {leaguesLoading ? (
                <div className="loading-message">Cargando ligas...</div>
              ) : recentLeagues.length > 0 ? (
                recentLeagues.map((league) => (
                  <div key={league.id} className="list-item">
                    <span className="item-name">{league.title}</span>
                    <span className={`item-status ${league.status}`}>
                      {league.status === 'active' ? 'Activa' : 
                       league.status === 'draft' ? 'Borrador' :
                       league.status === 'completed' ? 'Finalizada' : 'Cancelada'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-message">No hay ligas creadas aún</div>
              )}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Resumen de Torneos</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{tournamentsLoading ? '...' : tournamentStats.activeTournaments}</span>
              <span className="stat-label">Torneos Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{tournamentsLoading ? '...' : tournamentStats.totalPlayers}</span>
              <span className="stat-label">Jugadores Total</span>
            </div>
          </div>
          <div className="recent-items">
            <h4>Torneos Recientes</h4>
            <div className="item-list">
              {tournamentsLoading ? (
                <div className="loading-message">Cargando torneos...</div>
              ) : recentTournaments.length > 0 ? (
                recentTournaments.map((tournament) => (
                  <div key={tournament.id} className="list-item">
                    <span className="item-name">{tournament.title}</span>
                    <span className={`item-status ${tournament.status}`}>
                      {tournament.status === 'active' ? 'Activo' : 
                       tournament.status === 'draft' ? 'Borrador' :
                       tournament.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-message">No hay torneos creados aún</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Componente memoizado para card individual de liga
const LeagueCard = memo(function LeagueCard({ 
  league, 
  formatDate 
}: { 
  league: any; 
  formatDate: (date: string) => string 
}) {
  return (
    <div className={`league-card ${league.status}`}>
      <div className="league-header">
        <h4 className="league-title">{league.title}</h4>
        <span className={`league-status ${league.status}`}>
          {league.status === 'active' ? 'Activa' : 
           league.status === 'draft' ? 'Borrador' :
           league.status === 'completed' ? 'Finalizada' : 'Cancelada'}
        </span>
      </div>
      <div className="league-info">
        {league.description && (
          <p className="league-description">{league.description}</p>
        )}
        <div className="league-details">
          <div className="detail-item">
            <span className="detail-label">📅 Fecha:</span>
            <span className="detail-value">{formatDate(league.date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">📍 Lugar:</span>
            <span className="detail-value">{league.location}</span>
          </div>
          {league.status === 'active' && (
            <>
              <div className="detail-item">
                <span className="detail-label">👥 Jugadores:</span>
                <span className="detail-value">{Array.isArray(league.players) ? league.players.length : 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎾 Pistas:</span>
                <span className="detail-value">{Array.isArray(league.courts) ? league.courts.length : 0}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="league-actions">
        {league.status === 'active' && (
          <>
            <button className="action-btn secondary">Ver Detalles</button>
            <button className="action-btn primary">Gestionar</button>
          </>
        )}
        {league.status === 'draft' && (
          <>
            <button className="action-btn secondary">Editar</button>
            <button className="action-btn primary">Publicar</button>
          </>
        )}
        {league.status === 'completed' && (
          <button className="action-btn secondary">Ver Resultados</button>
        )}
      </div>
    </div>
  )
})

// Componente memoizado para card individual de torneo
const TournamentCard = memo(function TournamentCard({ 
  tournament, 
  formatDate 
}: { 
  tournament: any; 
  formatDate: (date: string) => string 
}) {
  return (
    <div className={`league-card ${tournament.status}`}>
      <div className="league-header">
        <h4 className="league-title">{tournament.title}</h4>
        <span className={`league-status ${tournament.status}`}>
          {tournament.status === 'active' ? 'Activo' : 
           tournament.status === 'draft' ? 'Borrador' :
           tournament.status === 'completed' ? 'Finalizado' : 'Cancelado'}
        </span>
      </div>
      <div className="league-info">
        {tournament.description && (
          <p className="league-description">{tournament.description}</p>
        )}
        <div className="league-details">
          <div className="detail-item">
            <span className="detail-label">📅 Fecha:</span>
            <span className="detail-value">{formatDate(tournament.date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">📍 Lugar:</span>
            <span className="detail-value">{tournament.location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🏆 Formato:</span>
            <span className="detail-value">
              {tournament.format === 'classic-americano' ? 'Classic Americano' :
               tournament.format === 'mixed-americano' ? 'Mixed Americano' : 'Team Americano'}
            </span>
          </div>
          {tournament.status === 'active' && (
            <>
              <div className="detail-item">
                <span className="detail-label">👥 Jugadores:</span>
                <span className="detail-value">{Array.isArray(tournament.players) ? tournament.players.length : 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎾 Pistas:</span>
                <span className="detail-value">{Array.isArray(tournament.courts) ? tournament.courts.length : 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🎯 Juegos/Ronda:</span>
                <span className="detail-value">{tournament.games_per_round}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="league-actions">
        {tournament.status === 'active' && (
          <>
            <button className="action-btn secondary">Ver Detalles</button>
            <button className="action-btn primary">Gestionar</button>
          </>
        )}
        {tournament.status === 'draft' && (
          <>
            <button className="action-btn secondary">Editar</button>
            <button className="action-btn primary">Activar</button>
          </>
        )}
        {tournament.status === 'completed' && (
          <button className="action-btn secondary">Ver Resultados</button>
        )}
      </div>
    </div>
  )
})

// Componentes de vista para otras secciones memoizada
const LeaguesView = memo(function LeaguesView() {
  const { leagues, loading, error, getLeaguesByStatus, refetchLeagues } = useLeagues()
  
  // Memoizar filtros de ligas para evitar recálculos
  const activeLeagues = useMemo(() => getLeaguesByStatus('active'), [getLeaguesByStatus])
  const draftLeagues = useMemo(() => getLeaguesByStatus('draft'), [getLeaguesByStatus])
  const completedLeagues = useMemo(() => getLeaguesByStatus('completed'), [getLeaguesByStatus])

  // Memoizar función de formateo
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  if (loading) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Ligas</h2>
          <p>Gestiona todas tus ligas deportivas</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando ligas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Ligas</h2>
          <p>Gestiona todas tus ligas deportivas</p>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refetchLeagues} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Ligas</h2>
        <p>Gestiona todas tus ligas deportivas</p>
      </div>

      {leagues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No tienes ligas creadas</h3>
          <p>Crea tu primera liga para empezar a organizar torneos</p>
          <button className="action-btn primary">
            Crear Primera Liga
          </button>
        </div>
      ) : (
        <div className="leagues-sections">
          {/* Ligas Activas */}
          {activeLeagues.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator active"></span>
                Ligas Activas ({activeLeagues.length})
              </h3>
              <div className="leagues-grid">
                {activeLeagues.map((league) => (
                  <LeagueCard 
                    key={league.id} 
                    league={league} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ligas en Borrador */}
          {draftLeagues.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator draft"></span>
                Borradores ({draftLeagues.length})
              </h3>
              <div className="leagues-grid">
                {draftLeagues.map((league) => (
                  <LeagueCard 
                    key={league.id} 
                    league={league} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ligas Completadas */}
          {completedLeagues.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator completed"></span>
                Completadas ({completedLeagues.length})
              </h3>
              <div className="leagues-grid">
                {completedLeagues.map((league) => (
                  <LeagueCard 
                    key={league.id} 
                    league={league} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

const TournamentsView = memo(function TournamentsView() {
  const { tournaments, loading, error, getTournamentsByStatus, refetchTournaments } = useTournaments()
  
  // Memoizar filtros de torneos para evitar recálculos
  const activeTournaments = useMemo(() => getTournamentsByStatus('active'), [getTournamentsByStatus])
  const draftTournaments = useMemo(() => getTournamentsByStatus('draft'), [getTournamentsByStatus])
  const completedTournaments = useMemo(() => getTournamentsByStatus('completed'), [getTournamentsByStatus])

  // Memoizar función de formateo
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  if (loading) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Torneos</h2>
          <p>Administra tus torneos competitivos</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando torneos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Torneos</h2>
          <p>Administra tus torneos competitivos</p>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refetchTournaments} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Torneos</h2>
        <p>Administra tus torneos competitivos</p>
      </div>

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No tienes torneos creados</h3>
          <p>Crea tu primer torneo para empezar a organizar competiciones</p>
          <button className="action-btn primary">
            Crear Primer Torneo
          </button>
        </div>
      ) : (
        <div className="leagues-sections">
          {/* Torneos Activos */}
          {activeTournaments.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator active"></span>
                Torneos Activos ({activeTournaments.length})
              </h3>
              <div className="leagues-grid">
                {activeTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Torneos en Borrador */}
          {draftTournaments.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator draft"></span>
                Borradores ({draftTournaments.length})
              </h3>
              <div className="leagues-grid">
                {draftTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Torneos Completados */}
          {completedTournaments.length > 0 && (
            <div className="leagues-section">
              <h3 className="section-title">
                <span className="status-indicator completed"></span>
                Completados ({completedTournaments.length})
              </h3>
              <div className="leagues-grid">
                {completedTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Componente para mostrar un cliente individual
const ClientCard = memo(function ClientCard({ 
  client, 
  onEdit, 
  onDelete 
}: { 
  client: any; 
  onEdit: (client: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="client-card">
      <div className="client-info">
        <h4 className="client-name">{client.name}</h4>
        <div className="client-details">
          <div className="detail-item">
            <span className="detail-icon">📞</span>
            <span className="detail-value">{client.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">✉️</span>
            <span className="detail-value">{client.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-value">
              {new Date(client.created_at).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </div>
      <div className="client-actions">
        <button 
          onClick={() => onEdit(client)}
          className="action-btn secondary"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(client.id)}
          className="action-btn danger"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
})

// Componente del formulario modal
const ClientFormModal = memo(function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
  initialData?: { name: string; phone: string; email: string } | null;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Submitting form data:', formData)
      onSubmit(formData)
    }
  }, [formData, validateForm, onSubmit])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="Introduce el nombre completo"
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'error' : ''}
              placeholder="Introduce el número de teléfono"
              disabled={loading}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Introduce el email"
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="action-btn secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="action-btn primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

// Componente de vista para jugadores memoizado
const PlayersView = memo(function PlayersView() {
  const { clients, loading, error, refetchClients, addClient, updateClient, deleteClient } = useClients()
  
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleAddClient = useCallback(() => {
    setEditingClient(null)
    setShowModal(true)
  }, [])

  const handleEditClient = useCallback((client: any) => {
    setEditingClient(client)
    setShowModal(true)
  }, [])

  const handleFormSubmit = useCallback(async (formData: { name: string; phone: string; email: string }) => {
    setFormLoading(true)
    
    try {
      let result
      if (editingClient) {
        result = await updateClient(editingClient.id, formData)
      } else {
        result = await addClient(formData)
      }

      if (result.success) {
        setShowModal(false)
        setEditingClient(null)
        setSuccessMessage(`Jugador ${editingClient ? 'actualizado' : 'creado'} exitosamente`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        alert(result.error || 'Error al procesar la solicitud')
      }
    } catch (err) {
      alert('Error inesperado al procesar la solicitud')
    } finally {
      setFormLoading(false)
    }
  }, [editingClient, addClient, updateClient])

  const handleDeleteClient = useCallback(async (id: string) => {
    if (deleteConfirm === id) {
      const result = await deleteClient(id)
      if (result.success) {
        setSuccessMessage('Jugador eliminado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        alert(result.error || 'Error al eliminar jugador')
      }
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }, [deleteConfirm, deleteClient])

  if (loading) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Jugadores</h2>
          <p>Administra la información de tus jugadores</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando jugadores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="content-header">
          <h2>Mis Jugadores</h2>
          <p>Administra la información de tus jugadores</p>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={refetchClients} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="content-header">
        <div className="header-content">
        <h2>Mis Jugadores</h2>
        <p>Administra la información de tus jugadores</p>
      </div>
        <button 
          onClick={handleAddClient}
          className="action-btn primary"
        >
          + Añadir Jugador
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No tienes jugadores registrados</h3>
          <p>Añade tu primer jugador para empezar a gestionar tu base de datos</p>
          <button 
            onClick={handleAddClient}
            className="action-btn primary"
          >
            Añadir Primer Jugador
          </button>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      )}

      <ClientFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingClient(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingClient}
        loading={formLoading}
      />
    </div>
  )
})

function CourtsView() {
  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Jugadores</h2>
        <p>Administra la información de tus pistas</p>
      </div>
      <div className="placeholder-content">
        <p>Próximamente: Lista completa de pistas</p>
      </div>
    </div>
  )
}

// Componente principal del Dashboard
export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('overview')

  // Memoizar funciones de callback para evitar re-renderizados
  const handleSignOut = useCallback(async () => {
    await signOut()
    router.push('/')
  }, [signOut, router])

  const handleMenuSelect = useCallback((item: MenuItem) => {
    setActiveMenuItem(item)
  }, [])

  // Hook debe estar antes de cualquier return condicional
  React.useEffect(() => {
    if (!user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  // Memoizar el contenido principal basado en el menu activo
  const mainContent = useMemo(() => {
    switch (activeMenuItem) {
      case 'overview':
        return <OverviewView user={user} router={router} />
      case 'leagues':
        return <LeaguesView />
      case 'tournaments':
        return <TournamentsView />
      case 'players':
        return <PlayersView />
      case 'courts':
        return <CourtsView />
      default:
        return <OverviewView user={user} router={router} />
    }
  }, [activeMenuItem, user, router])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeItem={activeMenuItem}
        onItemSelect={handleMenuSelect}
        onSignOut={handleSignOut}
      />
      
      <main className="dashboard-main-area">
        {mainContent}
      </main>

      {/* Estilos para los componentes de clientes */}
      <style jsx>{`
        .header-content {
          flex: 1;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #c3e6cb;
        }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .client-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .client-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .client-name {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .client-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .detail-icon {
          font-size: 1rem;
        }

        .client-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
        }

        .action-btn.primary {
          background-color: #007bff;
          color: white;
        }

        .action-btn.primary:hover {
          background-color: #0056b3;
        }

        .action-btn.secondary {
          background-color: #6c757d;
          color: white;
        }

        .action-btn.secondary:hover {
          background-color: #545b62;
        }

        .action-btn.danger {
          background-color: #dc3545;
          color: white;
        }

        .action-btn.danger:hover {
          background-color: #c82333;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .client-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-group input.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.25rem;
          display: block;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .form-actions .action-btn {
          min-width: 100px;
          flex: none;
        }

        .retry-btn {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .retry-btn:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  )
}

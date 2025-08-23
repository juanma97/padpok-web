'use client'

import React, { useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Tipos
type MenuItem = 'overview' | 'mis-ligas' | 'mis-torneos' | 'mis-jugadores'

// Componente de barra lateral
function Sidebar({ 
  activeItem, 
  onItemSelect, 
  onSignOut 
}: { 
  activeItem: MenuItem
  onItemSelect: (item: MenuItem) => void
  onSignOut: () => void 
}) {
  const menuItems = [
    { id: 'overview' as MenuItem, label: 'Resumen', icon: '📊' },
    { id: 'mis-ligas' as MenuItem, label: 'Mis Ligas', icon: '🏆' },
    { id: 'mis-torneos' as MenuItem, label: 'Mis Torneos', icon: '🥇' },
    { id: 'mis-jugadores' as MenuItem, label: 'Mis Jugadores', icon: '👥' },
  ]

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
}

// Componente de vista principal - Resumen
function OverviewView({ user }: { user: any }) {
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
          <button className="action-btn">Crear Liga</button>
        </div>

        <div className="action-card">
          <div className="action-icon">🥇</div>
          <h3>Crear Torneo</h3>
          <p>Inicia un nuevo torneo competitivo</p>
          <button className="action-btn">Crear Torneo</button>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3>Resumen de Ligas</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Ligas Activas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">45</span>
              <span className="stat-label">Jugadores Total</span>
            </div>
          </div>
          <div className="recent-items">
            <h4>Ligas Recientes</h4>
            <div className="item-list">
              <div className="list-item">
                <span className="item-name">Liga de Verano 2024</span>
                <span className="item-status active">Activa</span>
              </div>
              <div className="list-item">
                <span className="item-name">Copa Primavera</span>
                <span className="item-status completed">Finalizada</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Resumen de Torneos</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Torneos Activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Equipos Total</span>
            </div>
          </div>
          <div className="recent-items">
            <h4>Torneos Recientes</h4>
            <div className="item-list">
              <div className="list-item">
                <span className="item-name">Torneo Regional</span>
                <span className="item-status active">En Curso</span>
              </div>
              <div className="list-item">
                <span className="item-name">Copa Local</span>
                <span className="item-status pending">Próximo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componentes de vista para otras secciones
function MisLigasView() {
  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Ligas</h2>
        <p>Gestiona todas tus ligas deportivas</p>
      </div>
      <div className="placeholder-content">
        <p>Próximamente: Lista completa de ligas</p>
      </div>
    </div>
  )
}

function MisTorneosView() {
  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Torneos</h2>
        <p>Administra tus torneos competitivos</p>
      </div>
      <div className="placeholder-content">
        <p>Próximamente: Lista completa de torneos</p>
      </div>
    </div>
  )
}

function MisJugadoresView() {
  return (
    <div className="main-content">
      <div className="content-header">
        <h2>Mis Jugadores</h2>
        <p>Administra la información de tus jugadores</p>
      </div>
      <div className="placeholder-content">
        <p>Próximamente: Lista completa de jugadores</p>
      </div>
    </div>
  )
}

// Componente principal del Dashboard
export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>('overview')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const renderMainContent = () => {
    switch (activeMenuItem) {
      case 'overview':
        return <OverviewView user={user} />
      case 'mis-ligas':
        return <MisLigasView />
      case 'mis-torneos':
        return <MisTorneosView />
      case 'mis-jugadores':
        return <MisJugadoresView />
      default:
        return <OverviewView user={user} />
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeItem={activeMenuItem}
        onItemSelect={setActiveMenuItem}
        onSignOut={handleSignOut}
      />
      
      <main className="dashboard-main-area">
        {renderMainContent()}
      </main>
    </div>
  )
}

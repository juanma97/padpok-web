'use client'

import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-nav">
          <h1 className="dashboard-title">padpok</h1>
          <button onClick={handleSignOut} className="sign-out-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h2>¡Bienvenido, {user.user_metadata?.full_name || user.email}!</h2>
          <p>Tu perfil se ha completado exitosamente. Estás listo para comenzar.</p>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>Tu información</h3>
            <div className="user-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Última conexión:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Próximamente</h3>
            <p>Aquí encontrarás todas las funcionalidades principales de padpok.</p>
            <ul>
              <li>📦 Catálogo de productos</li>
              <li>🛒 Carrito de compras</li>
              <li>📋 Historial de pedidos</li>
              <li>👤 Gestión de perfil</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import LoginForm from '@/shared/components/LoginForm'

export default function HomePage() {
  const { user, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  // Si el usuario está autenticado, mostrar contenido principal
  if (user) {
    return (
      <div className="home-page">
        <header className="header">
          <h1>Bienvenido a Padpok, {user.user_metadata?.full_name || user.email}!</h1>
          <p>Has iniciado sesión exitosamente</p>
        </header>

        <section className="content">
          <div className="card">
            <h2>Características</h2>
            <ul>
              <li>⚛️ React.js para la interfaz de usuario</li>
              <li>🔥 Next.js para el backend y SSR</li>
              <li>🎨 CSS puro para estilos</li>
              <li>📘 TypeScript para tipado estático</li>
              <li>🏗️ Arquitectura DDD (Domain Driven Design)</li>
              <li>🔐 Autenticación con Supabase</li>
            </ul>
          </div>

          <div className="card">
            <h2>Tu Información</h2>
            <ul>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>ID:</strong> {user.id}</li>
              <li><strong>Proveedor:</strong> {user.app_metadata?.provider}</li>
            </ul>
          </div>
        </section>
      </div>
    )
  }

  // Si no está autenticado, mostrar formulario de login
  return <LoginForm />
}

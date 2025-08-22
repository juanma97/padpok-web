'use client'

import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRouter } from 'next/navigation'
import LoginForm from '@/shared/components/LoginForm'

export default function HomePage() {
  const router = useRouter()
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
    router.push('/dashboard');
  }

  // Si no está autenticado, mostrar formulario de login
  return <LoginForm />
}

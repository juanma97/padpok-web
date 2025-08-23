'use client'

import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useRouter } from 'next/navigation'
import LoginForm from '@/shared/components/LoginForm'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirigir al dashboard si el usuario está autenticado
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  // Si el usuario está autenticado, mostrar loading mientras redirige
  if (user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirigiendo al dashboard...</p>
      </div>
    )
  }

  // Si no está autenticado, mostrar formulario de login
  return <LoginForm />
}

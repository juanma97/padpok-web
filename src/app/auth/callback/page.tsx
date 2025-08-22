'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/infrastructure/database/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error en callback de autenticación:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Usuario autenticado exitosamente
          router.push('/dashboard')
        } else {
          // No hay sesión, redirigir al login
          router.push('/')
        }
      } catch (err) {
        console.error('Error inesperado:', err)
        router.push('/?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="auth-callback">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Completando inicio de sesión...</p>
      </div>
    </div>
  )
}

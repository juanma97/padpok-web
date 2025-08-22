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
          // Verificar si es la primera vez que se autentica
          const user = data.session.user
          const isNewUser = user.app_metadata?.provider && 
                           new Date(user.created_at).getTime() > (Date.now() - 60000) // Creado en el último minuto
          
          if (isNewUser) {
            // Primera vez, redirigir a completar perfil
            router.push('/complete-profile')
          } else {
            // Usuario existente, redirigir al dashboard
            router.push('/dashboard')
          }
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

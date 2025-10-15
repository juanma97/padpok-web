'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'
import { UserService } from '@/backend/userService'

interface ProfileData {
  name: string
  address: string
  phone: string
  contact_email: string
  instagram: string
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileData>({
    name: user?.user_metadata?.full_name || '',
    address: '',
    phone: '',
    contact_email: user?.email || '',
    instagram: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!user) {
      setError('Usuario no autenticado')
      setIsLoading(false)
      return
    }

    try {
      // Preparar datos para guardar en base de datos
      const userData = {
        auth_user_id: user.id,
        email: user.email || '',
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        contact_email: formData.contact_email.trim(),
        instagram: formData.instagram.trim() || null
      }

      // Guardar en base de datos
      const { user: savedUser, error: saveError } = await UserService.createUser(userData)

      if (saveError) {
        setError(saveError)
        return
      }

      if (!savedUser) {
        setError('Error inesperado al guardar los datos')
        return
      }

      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      setError('Error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.address.trim() && 
           formData.phone.trim() && 
           formData.contact_email.trim()
  }

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-content">
        {/* Formulario - Lado izquierdo */}
        <div className="profile-form-section">
          <div className="form-header">
            <h1>Completa tu perfil</h1>
            <p>Para brindarte la mejor experiencia, necesitamos algunos datos adicionales</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Nombre completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ingresa tu dirección completa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono de contacto *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+34 123 456 789"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_email">Email de contacto *</label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagram">Instagram (opcional)</label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@tu_usuario"
              />
            </div>

            <button
              type="submit"
              className="continue-btn"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Guardando...' : 'Continuar'}
            </button>
          </form>
        </div>

        {/* Bloque de bienvenida - Lado derecho */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Bienvenido a padpok</h2>
            <div className="welcome-text">
              <p>
                Estás a punto de formar parte de una comunidad increíble donde podrás 
                descubrir productos únicos y vivir experiencias extraordinarias.
              </p>
              <p>
                Con padpok, tendrás acceso a una selección cuidadosamente curada de 
                productos de alta calidad, junto con un servicio personalizado que 
                se adapta a tus necesidades.
              </p>
              <p>
                ¡Estamos emocionados de tenerte con nosotros!
              </p>
            </div>
            <div className="welcome-features">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Productos exclusivos</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Envío rápido y seguro</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💝</span>
                <span>Experiencia personalizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

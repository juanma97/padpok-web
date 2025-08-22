'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks/useAuth'

interface ProfileData {
  nombre: string
  direccion: string
  telefono: string
  emailContacto: string
  instagram: string
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    nombre: user?.user_metadata?.full_name || '',
    direccion: '',
    telefono: '',
    emailContacto: user?.email || '',
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

    try {
      // TODO: Guardar datos en base de datos
      console.log('Datos del perfil:', formData)
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error al guardar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.nombre.trim() && 
           formData.direccion.trim() && 
           formData.telefono.trim() && 
           formData.emailContacto.trim()
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
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ingresa tu dirección completa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono de contacto *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+34 123 456 789"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailContacto">Email de contacto *</label>
              <input
                type="email"
                id="emailContacto"
                name="emailContacto"
                value={formData.emailContacto}
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

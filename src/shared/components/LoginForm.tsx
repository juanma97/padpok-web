'use client'

import React from 'react'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/shared/hooks/useAuth'

const LoginForm: React.FC = () => {
  const { signInWithGoogle, loading, error } = useAuth()

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1 className="app-title">padpok</h1>
          <p className="login-subtitle">Bienvenido de vuelta</p>
        </div>

        <div className="login-content">
          {error && (
            <div className="error-message">
              {error.message || 'Error al iniciar sesión'}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-login-btn"
          >
            <FcGoogle className="google-icon" />
            {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { CourtService } from '@/backend/courtService'

interface Court {
  id: string
  user_id: string
  name: string
  number: string
  created_at: string
  updated_at: string
}

interface CourtsState {
  courts: Court[]
  loading: boolean
  error: string | null
}

export const useCourts = () => {
  const { user } = useAuth()
  const [state, setState] = useState<CourtsState>({
    courts: [],
    loading: false,
    error: null
  })

  const loadUserCourts = useCallback(async () => {
    if (!user) {
      setState({ courts: [], loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Obtener las pistas del usuario directamente usando auth.uid()
      const { courts, error: courtsError } = await CourtService.getUserCourts(user.id)

      if (courtsError) {
        setState({ courts: [], loading: false, error: courtsError })
        return
      }

      setState({ courts, loading: false, error: null })
    } catch (err) {
      console.error('Error loading user courts:', err)
      setState({ courts: [], loading: false, error: 'Error inesperado al cargar las pistas' })
    }
  }, [user])

  // Cargar pistas cuando el usuario cambie
  useEffect(() => {
    loadUserCourts()
  }, [loadUserCourts])

  // Función para recargar las pistas manualmente
  const refetchCourts = () => {
    loadUserCourts()
  }

  // Función para añadir una nueva pista
  const addCourt = async (courtData: { name: string; number: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      // Verificar si la combinación nombre + número ya está en uso
      const { isTaken, error: nameError } = await CourtService.isCourtNameTaken(user.id, courtData.name, courtData.number)
      
      if (nameError) {
        return { success: false, error: nameError }
      }

      if (isTaken) {
        return { success: false, error: 'Ya existe una pista con este nombre y número' }
      }

      // Crear la pista usando directamente auth.uid()
      const { court, error: createError } = await CourtService.createCourt({
        user_id: user.id,
        ...courtData
      })

      if (createError || !court) {
        return { success: false, error: createError || 'Error al crear pista' }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        courts: [court, ...prev.courts]
      }))

      return { success: true }
    } catch (err) {
      console.error('Error adding court:', err)
      return { success: false, error: 'Error inesperado al añadir pista' }
    }
  }

  // Función para actualizar una pista
  const updateCourt = async (id: string, updates: { name?: string; number?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      // Si se está actualizando el nombre o número, verificar que no estén en uso
      if (updates.name || updates.number) {
        // Obtener los datos actuales de la pista para completar la validación
        const currentCourt = state.courts.find(c => c.id === id)
        if (!currentCourt) {
          return { success: false, error: 'Pista no encontrada' }
        }

        const nameToCheck = updates.name || currentCourt.name
        const numberToCheck = updates.number || currentCourt.number

        const { isTaken, error: nameError } = await CourtService.isCourtNameTaken(user.id, nameToCheck, numberToCheck, id)
        
        if (nameError) {
          return { success: false, error: nameError }
        }

        if (isTaken) {
          return { success: false, error: 'Ya existe una pista con este nombre y número' }
        }
      }

      // Actualizar la pista
      const { court, error: updateError } = await CourtService.updateCourt(id, updates)

      if (updateError || !court) {
        return { success: false, error: updateError || 'Error al actualizar pista' }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        courts: prev.courts.map(c => c.id === id ? court : c)
      }))

      return { success: true }
    } catch (err) {
      console.error('Error updating court:', err)
      return { success: false, error: 'Error inesperado al actualizar pista' }
    }
  }

  // Función para eliminar una pista
  const deleteCourt = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await CourtService.deleteCourt(id)

      if (error) {
        return { success: false, error }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        courts: prev.courts.filter(c => c.id !== id)
      }))

      return { success: true }
    } catch (err) {
      console.error('Error deleting court:', err)
      return { success: false, error: 'Error inesperado al eliminar pista' }
    }
  }

  return {
    courts: state.courts,
    loading: state.loading,
    error: state.error,
    refetchCourts,
    addCourt,
    updateCourt,
    deleteCourt
  }
}

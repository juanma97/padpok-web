import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { ClientService } from '@/infrastructure/database/clientService'

interface Client {
  id: string
  user_id: string
  name: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

interface ClientsState {
  clients: Client[]
  loading: boolean
  error: string | null
}

export const useClients = () => {
  const { user } = useAuth()
  const [state, setState] = useState<ClientsState>({
    clients: [],
    loading: false,
    error: null
  })

  const loadUserClients = useCallback(async () => {
    if (!user) {
      setState({ clients: [], loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Obtener los clientes del usuario directamente usando auth.uid()
      const { clients, error: clientsError } = await ClientService.getUserClients(user.id)

      if (clientsError) {
        setState({ clients: [], loading: false, error: clientsError })
        return
      }

      setState({ clients, loading: false, error: null })
    } catch (err) {
      console.error('Error loading user clients:', err)
      setState({ clients: [], loading: false, error: 'Error inesperado al cargar los clientes' })
    }
  }, [user])

  // Cargar clientes cuando el usuario cambie
  useEffect(() => {
    loadUserClients()
  }, [loadUserClients])

  // Función para recargar los clientes manualmente
  const refetchClients = () => {
    loadUserClients()
  }

  // Función para añadir un nuevo cliente
  const addClient = async (clientData: { name: string; phone: string; email: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      // Verificar si el email ya está en uso
      const { isTaken, error: emailError } = await ClientService.isEmailTaken(user.id, clientData.email)
      
      if (emailError) {
        return { success: false, error: emailError }
      }

      if (isTaken) {
        return { success: false, error: 'Ya existe un cliente con este email' }
      }

      const { client, error: createError } = await ClientService.createClient({
        user_id: user.id,
        ...clientData
      })

      if (createError || !client) {
        return { success: false, error: createError || 'Error al crear cliente' }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        clients: [client, ...prev.clients]
      }))

      return { success: true }
    } catch (err) {
      console.error('Error adding client:', err)
      return { success: false, error: 'Error inesperado al añadir cliente' }
    }
  }

  // Función para actualizar un cliente
  const updateClient = async (id: string, updates: { name?: string; phone?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      // Si se está actualizando el email, verificar que no esté en uso
      if (updates.email) {
        const { isTaken, error: emailError } = await ClientService.isEmailTaken(user.id, updates.email, id)
        
        if (emailError) {
          return { success: false, error: emailError }
        }

        if (isTaken) {
          return { success: false, error: 'Ya existe un cliente con este email' }
        }
      }

      // Actualizar el cliente
      const { client, error: updateError } = await ClientService.updateClient(id, updates)

      if (updateError || !client) {
        return { success: false, error: updateError || 'Error al actualizar cliente' }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === id ? client : c)
      }))

      return { success: true }
    } catch (err) {
      console.error('Error updating client:', err)
      return { success: false, error: 'Error inesperado al actualizar cliente' }
    }
  }

  // Función para eliminar un cliente
  const deleteClient = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await ClientService.deleteClient(id)

      if (error) {
        return { success: false, error }
      }

      // Actualizar el estado local
      setState(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id)
      }))

      return { success: true }
    } catch (err) {
      console.error('Error deleting client:', err)
      return { success: false, error: 'Error inesperado al eliminar cliente' }
    }
  }

  return {
    clients: state.clients,
    loading: state.loading,
    error: state.error,
    refetchClients,
    addClient,
    updateClient,
    deleteClient
  }
}

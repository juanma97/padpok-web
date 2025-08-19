import { loadStripe } from '@stripe/stripe-js'

// Cargar Stripe en el cliente
export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  return stripePromise
}

// Tipos para los productos de Stripe
export interface StripeProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  metadata?: Record<string, string>
}

// Tipos para las sesiones de checkout
export interface CreateCheckoutSessionData {
  tournamentId?: string
  leagueId?: string
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

// Tipos para las suscripciones
export interface CreateSubscriptionData {
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

// Configuración de productos de Stripe para Padpok
export const STRIPE_PRODUCTS = {
  TOURNAMENT_REGISTRATION: {
    name: 'Tournament Registration',
    description: 'Registration fee for tournament participation',
    currency: 'eur',
  },
  LEAGUE_REGISTRATION: {
    name: 'League Registration',
    description: 'Registration fee for league participation',
    currency: 'eur',
  },
  ORGANIZER_SUBSCRIPTION: {
    name: 'Organizer Pro',
    description: 'Professional organizer subscription',
    currency: 'eur',
  },
} as const

// URLs de webhook (se configurarán en Supabase Edge Functions)
export const STRIPE_WEBHOOK_ENDPOINTS = {
  checkout: '/api/stripe/webhooks/checkout',
  subscription: '/api/stripe/webhooks/subscription',
  payment: '/api/stripe/webhooks/payment',
} as const

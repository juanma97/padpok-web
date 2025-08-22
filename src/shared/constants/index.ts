// Constantes de la aplicación

export const APP_CONFIG = {
  NAME: 'Padpok Web App',
  VERSION: '1.0.0',
  DESCRIPTION: 'Aplicación web desarrollada con Next.js y TypeScript',
} as const;

export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
} as const;

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

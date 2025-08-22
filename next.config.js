/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // !! WARN !!
    // Peligrosamente permite que las builds de producción se completen exitosamente
    // incluso si tu proyecto tiene errores de TypeScript.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Advertencia: Esto permite que las builds de producción se completen exitosamente
    // incluso si tu proyecto tiene errores de ESLint.
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  images: {
    domains: [],
  },
}

module.exports = nextConfig

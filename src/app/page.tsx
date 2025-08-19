import Link from 'next/link'
import { Trophy, Users, Calendar, CreditCard, Shield, Smartphone } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Trophy,
      title: 'Gestión de Torneos',
      description: 'Crea y gestiona torneos de manera sencilla con control de inscripciones y brackets automáticos.',
    },
    {
      icon: Users,
      title: 'Sistema de Ligas',
      description: 'Organiza ligas de larga duración con rankings dinámicos y seguimiento de progreso.',
    },
    {
      icon: Calendar,
      title: 'Rankings en Tiempo Real',
      description: 'Sistema de puntuación automático con rankings actualizados instantáneamente.',
    },
    {
      icon: CreditCard,
      title: 'Pagos Integrados',
      description: 'Sistema de pagos seguro con Stripe para inscripciones y suscripciones.',
    },
    {
      icon: Shield,
      title: 'Autenticación Segura',
      description: 'Sistema de autenticación robusto con verificación de email y roles de usuario.',
    },
    {
      icon: Smartphone,
      title: 'Notificaciones',
      description: 'Recibe alertas por SMS/WhatsApp sobre próximos partidos y actualizaciones.',
    },
  ]

  const stats = [
    { name: 'Usuarios Activos', value: '2,000+' },
    { name: 'Torneos Organizados', value: '500+' },
    { name: 'Ligas Activas', value: '50+' },
    { name: 'Partidas Jugadas', value: '10,000+' },
  ]

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/" className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">🎾</span>
                </div>
                <div className="ml-2">
                  <h1 className="text-2xl font-bold text-gray-900">Padpok</h1>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link
                href="/auth/login"
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-purple-700" />
            </div>
            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block text-white">La plataforma definitiva para</span>
                <span className="block text-blue-200">gestión de torneos de pádel</span>
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-center text-xl text-blue-200 sm:max-w-3xl">
                Organiza torneos, gestiona ligas y mantén rankings en tiempo real. 
                Todo lo que necesitas para tu club de pádel en una sola plataforma.
              </p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-gray-50 sm:px-8"
                  >
                    Empezar Gratis
                  </Link>
                  <Link
                    href="/tournaments"
                    className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8"
                  >
                    Ver Torneos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <dt className="text-4xl font-extrabold text-gray-900">{stat.value}</dt>
                <dd className="mt-2 text-base text-gray-600">{stat.name}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para tu club de pádel
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Una plataforma completa que simplifica la gestión de eventos deportivos
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl leading-8 font-extrabold text-gray-900 tracking-tight sm:text-3xl sm:leading-9">
                Gestión completa de torneos y ligas
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Desde la creación del evento hasta la publicación de resultados, 
                Padpok te acompaña en todo el proceso.
              </p>

              <dl className="mt-10 space-y-10">
                {features.slice(0, 3).map((feature) => (
                  <div key={feature.title} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0">
              <div className="relative space-y-6">
                {features.slice(3).map((feature) => (
                  <div key={feature.title} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">¿Listo para empezar?</span>
            <span className="block">Únete a la comunidad de pádel más organizada</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Miles de organizadores ya confían en Padpok para gestionar sus eventos.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 sm:w-auto"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <span className="text-2xl">🎾</span>
                <span className="ml-2 text-xl font-bold text-white">Padpok</span>
              </div>
              <p className="text-gray-400 text-base">
                La plataforma definitiva para la gestión de torneos y ligas de pádel.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Producto</h3>
                  <ul className="mt-4 space-y-4">
                    <li><Link href="/tournaments" className="text-base text-gray-300 hover:text-white">Torneos</Link></li>
                    <li><Link href="/leagues" className="text-base text-gray-300 hover:text-white">Ligas</Link></li>
                    <li><Link href="/pricing" className="text-base text-gray-300 hover:text-white">Precios</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soporte</h3>
                  <ul className="mt-4 space-y-4">
                    <li><Link href="/help" className="text-base text-gray-300 hover:text-white">Ayuda</Link></li>
                    <li><Link href="/contact" className="text-base text-gray-300 hover:text-white">Contacto</Link></li>
                    <li><Link href="/docs" className="text-base text-gray-300 hover:text-white">Documentación</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 Padpok. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

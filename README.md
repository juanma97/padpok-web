# 🎾 Padpok - SaaS de Gestión de Torneos de Pádel

**Padpok** es una plataforma SaaS completa para la gestión de torneos y ligas de pádel, diseñada para organizadores y jugadores con pagos reales integrados.

## 🚀 **Características Principales**

### Para Jugadores

- 📱 **Dashboard personalizado** con estadísticas y próximos partidos
- 🏆 **Inscripción en torneos** con sistema de pagos real (Stripe)
- 📊 **Rankings dinámicos** y seguimiento de progreso
- 🏅 **Sistema de medallas** y logros
- 📈 **Historial de resultados** y estadísticas
- 📱 **Notificaciones** por SMS/WhatsApp

### Para Organizadores

- 🎪 **Creación de torneos** y ligas personalizadas
- 👥 **Gestión de inscripciones** y participantes
- 📝 **Subida de resultados** en tiempo real
- 💰 **Sistema de pagos** integrado con Stripe
- 📊 **Analíticas y reportes** detallados
- 🎯 **Wizard paso a paso** para crear eventos

## 🛠️ **Stack Tecnológico**

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: TailwindCSS + HeadlessUI + Lucide Icons
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Pagos**: Stripe (integración real, no simulada)
- **Testing**: Jest + Testing Library
- **CI/CD**: GitHub Actions
- **Deploy**: Vercel
- **Base de Datos**: PostgreSQL (Supabase)

## 📁 **Arquitectura del Proyecto**

```
src/
├── app/                    # App Router de Next.js
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── tournaments/       # Gestión de torneos
│   └── leagues/           # Gestión de ligas
├── features/              # Funcionalidades por dominio
│   ├── auth/              # Autenticación y perfiles
│   ├── tournaments/       # Gestión de torneos
│   ├── leagues/           # Gestión de ligas
│   ├── payments/          # Integración con Stripe
│   └── notifications/     # Sistema de notificaciones
├── shared/                # Componentes y utilidades compartidas
│   ├── components/        # Componentes UI reutilizables
│   ├── lib/               # Configuración de librerías
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades generales
└── styles/                # Estilos globales
```

## 🚀 **Instalación y Configuración**

### Prerrequisitos

- **Node.js 18+** (recomendado 20+)
- **npm** o **yarn**
- **Git**

### 1. Clonar el proyecto

```bash
git clone https://github.com/tu-usuario/padpok-saas.git
cd padpok-saas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus configuraciones:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
STRIPE_WEBHOOK_SECRET=tu_webhook_secret_de_stripe
```

### 4. Configurar Supabase

#### Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales del proyecto

#### Configurar base de datos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones
supabase db push

# Generar tipos TypeScript
npm run db:generate
```

### 5. Configurar Stripe

1. Ve a [stripe.com](https://stripe.com)
2. Crea una cuenta y obtén las claves API
3. Configura los webhooks para los endpoints de Supabase

### 6. Ejecutar el proyecto

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

## 🧪 **Testing**

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests para CI/CD
npm run test:ci
```

## 🚀 **Deploy**

### Deploy automático con GitHub Actions

1. Conecta tu repositorio a Vercel
2. Configura los secrets en GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Push a `main` para deploy automático

### Deploy manual

```bash
# Build
npm run build

# Deploy a Vercel
vercel --prod
```

## 📊 **Base de Datos**

### Entidades principales

- **profiles**: Usuarios con roles (player, organizer, admin)
- **tournaments**: Torneos con estados y configuraciones
- **leagues**: Ligas de larga duración
- **registrations**: Inscripciones con estados de pago
- **matches**: Partidas con resultados y brackets
- **notifications**: Sistema de notificaciones

### Migraciones

```bash
# Crear nueva migración
supabase migration new nombre_migracion

# Aplicar migraciones
supabase db push

# Resetear base de datos
supabase db reset
```

## 💳 **Sistema de Pagos**

### Integración con Stripe

- **Checkout Sessions** para inscripciones
- **Payment Intents** para pagos únicos
- **Webhooks** para sincronización
- **Customer Portal** para gestión de suscripciones

### Productos configurados

- Inscripción a torneos
- Inscripción a ligas
- Suscripción de organizadores

## 📱 **Notificaciones**

### Canales soportados

- **Email**: Verificación, recordatorios, actualizaciones
- **SMS**: Recordatorios de partidos (Twilio)
- **WhatsApp**: Notificaciones importantes
- **In-app**: Notificaciones del sistema

## 🔐 **Autenticación y Autorización**

### Roles de usuario

- **Player**: Acceso a torneos, inscripciones, rankings
- **Organizer**: Crear y gestionar eventos
- **Admin**: Acceso completo al sistema

### Características de seguridad

- Verificación de email obligatoria
- Contraseñas hasheadas con bcrypt
- JWT tokens seguros
- Protección de rutas por rol

## 🎨 **UI/UX**

### Componentes principales

- **Button**: Botones con variantes y estados
- **Card**: Contenedores de información
- **Form**: Formularios con validación
- **Modal**: Ventanas emergentes
- **Table**: Tablas de datos
- **Navigation**: Navegación responsive

### Sistema de diseño

- **Colores**: Paleta consistente con Tailwind
- **Tipografía**: Inter como fuente principal
- **Espaciado**: Sistema de espaciado 4px
- **Breakpoints**: Mobile-first responsive design

## 🔧 **Scripts Disponibles**

```bash
npm run dev              # Desarrollo local
npm run build            # Build para producción
npm run start            # Iniciar en producción
npm run lint             # Linting del código
npm run test             # Ejecutar tests
npm run test:coverage    # Tests con coverage
npm run type-check       # Verificación de tipos
npm run db:generate      # Generar tipos de DB
npm run db:push          # Sincronizar base de datos
npm run db:studio        # Abrir Supabase Studio
```

## 🚧 **Estado del Desarrollo**

### ✅ Completado (MVP)

- [x] **Arquitectura base** con Next.js 14
- [x] **Configuración de Supabase** completa
- [x] **Sistema de autenticación** con roles
- [x] **Integración con Stripe** para pagos reales
- [x] **Landing page** responsive
- [x] **Sistema de testing** con Jest
- [x] **Pipeline CI/CD** con GitHub Actions
- [x] **Tipos TypeScript** para toda la aplicación

### 🚧 En Desarrollo

- [ ] **Dashboard de organizador** con wizard
- [ ] **Sistema de inscripciones** completo
- [ ] **Gestión de brackets** y resultados
- [ ] **Sistema de notificaciones** por SMS/WhatsApp

### 📋 Próximas Fases

- [ ] **API pública** para integraciones
- [ ] **Aplicación móvil** React Native
- [ ] **Analytics avanzados** y reportes
- [ ] **Machine Learning** para rankings

## 🤝 **Contribución**

1. **Fork** el proyecto
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Guías de contribución

- Sigue el estándar de commits convencionales
- Mantén la cobertura de tests por encima del 70%
- Documenta nuevas funcionalidades
- Usa TypeScript para todo el código nuevo

## 📄 **Licencia**

Este proyecto está bajo la **Licencia MIT** - completamente open source y gratuito.

## 📞 **Contacto y Recursos**

- **Website**: [padpok.com](https://padpok.com)
- **Documentación**: [docs.padpok.com](https://docs.padpok.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/padpok-saas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/padpok-saas/discussions)

## 🙏 **Agradecimientos**

- **Supabase** por la infraestructura backend
- **Stripe** por el sistema de pagos
- **Vercel** por el hosting y deploy
- **Comunidad de pádel** por la inspiración

---

**Desarrollado con ❤️ para la comunidad de pádel**

_¿Tienes preguntas? ¡Abre un issue o únete a nuestras discusiones!_

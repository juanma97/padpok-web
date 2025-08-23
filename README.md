# Padpok Web App

Una aplicación web moderna desarrollada con React.js, Next.js, CSS y TypeScript, siguiendo los principios de Domain Driven Design (DDD).

## 🚀 Tecnologías

- **React.js** - Biblioteca para crear interfaces de usuario
- **Next.js** - Framework de React para aplicaciones full-stack
- **TypeScript** - Superset tipado de JavaScript
- **CSS** - Estilos puros sin frameworks adicionales
- **Supabase** - Base de datos PostgreSQL como servicio con autenticación

## 📁 Estructura del Proyecto (DDD)

```
src/
├── app/                    # Aplicación Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── domain/                # Lógica de dominio
│   ├── user/              # Dominio de usuarios
│   ├── product/           # Dominio de productos
│   └── order/             # Dominio de pedidos
├── application/           # Casos de uso y servicios de aplicación
│   ├── services/          # Servicios de aplicación
│   └── usecases/          # Casos de uso
├── infrastructure/        # Capa de infraestructura
│   ├── api/               # APIs externas
│   ├── database/          # Acceso a base de datos
│   └── storage/           # Almacenamiento
└── shared/                # Código compartido
    ├── components/        # Componentes reutilizables
    ├── hooks/             # Hooks personalizados
    ├── types/             # Tipos TypeScript
    ├── utils/             # Utilidades
    ├── constants/         # Constantes
    └── styles/            # Estilos compartidos
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn

### Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd padpok-web-app
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno:

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🗄️ Esquema de Base de Datos

### Tabla `users`

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  nombre VARCHAR NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR NOT NULL,
  email_contacto VARCHAR NOT NULL,
  instagram VARCHAR,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_user_id)
);
```

### Políticas de Seguridad (RLS)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Solo usuarios autenticados pueden crear su perfil
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
```

### Tabla `leagues`

```sql
CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR NOT NULL,
  format VARCHAR NOT NULL CHECK (format IN ('all-vs-all', 'box-league', 'groups-playoffs')),
  player_management VARCHAR NOT NULL CHECK (player_management IN ('manual', 'link')),
  players JSONB NOT NULL DEFAULT '[]',
  courts JSONB NOT NULL DEFAULT '[]',
  scoring_system VARCHAR NOT NULL CHECK (scoring_system IN ('3-1-0', 'sets')),
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas de Seguridad para Leagues

```sql
-- Habilitar RLS
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver todas las ligas públicas
CREATE POLICY "Anyone can view leagues" ON leagues
  FOR SELECT USING (true);

-- Solo el creador puede editar su liga
CREATE POLICY "Users can update own leagues" ON leagues
  FOR UPDATE USING (auth.uid() = creator_id);

-- Solo usuarios autenticados pueden crear ligas
CREATE POLICY "Authenticated users can create leagues" ON leagues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Solo el creador puede eliminar su liga
CREATE POLICY "Users can delete own leagues" ON leagues
  FOR DELETE USING (auth.uid() = creator_id);
```

### Comandos de Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm run start

# Verificar linting
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

## 🏗️ Principios DDD Aplicados

### Domain (Dominio)

Contiene la lógica de negocio central, entidades, objetos de valor y reglas de dominio. Es independiente de cualquier tecnología externa.

### Application (Aplicación)

Orquesta los casos de uso y coordina entre el dominio y la infraestructura. Contiene los servicios de aplicación y casos de uso.

### Infrastructure (Infraestructura)

Implementa los detalles técnicos como APIs, bases de datos, sistemas de archivos, etc. Depende del dominio pero el dominio no depende de ella.

### Shared (Compartido)

Código que puede ser utilizado por todas las capas, como utilidades, constantes y componentes de UI reutilizables.

## 📝 Convenciones de Código

- Usar TypeScript para todo el código
- Componentes de React en PascalCase
- Archivos de utilidades en camelCase
- Constantes en UPPER_SNAKE_CASE
- Interfaces precedidas por 'I' (ej: IUser)
- Tipos precedidos por 'T' (ej: TUserRole)

## 🎨 Estilos

- CSS puro con variables CSS para temas
- Metodología BEM para nomenclatura de clases
- Responsive design mobile-first
- Soporte para modo oscuro/claro

## 📦 Scripts Disponibles

- `dev`: Inicia el servidor de desarrollo
- `build`: Construye la aplicación para producción
- `start`: Inicia el servidor en modo producción
- `lint`: Ejecuta ESLint
- `type-check`: Verifica tipos TypeScript sin generar archivos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

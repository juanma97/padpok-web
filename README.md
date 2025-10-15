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
  matches JSONB DEFAULT '[]'::jsonb,
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

### Migración para añadir campo `matches`

Si ya tienes la tabla creada, ejecuta este comando para añadir el campo `matches`:

```sql
-- Añadir campo matches a tabla existente
ALTER TABLE leagues ADD COLUMN matches JSONB DEFAULT '[]'::jsonb;

-- Limpiar TODOS los campos JSON corruptos (ejecutar si hay problemas de parsing):
UPDATE leagues SET
  players = '[]'::jsonb WHERE players IS NULL OR players::text = '' OR players::text = 'null';
UPDATE leagues SET
  courts = '[]'::jsonb WHERE courts IS NULL OR courts::text = '' OR courts::text = 'null';
UPDATE leagues SET
  matches = '[]'::jsonb WHERE matches IS NULL OR matches::text = '' OR matches::text = 'null' OR matches::text = '[]' OR matches::text = '{}';
```

---

## 🎾 Sistema de Rotación de Parejas en Pádel

### 🎯 Algoritmo "Todos vs Todos" con Rotación Inteligente

Para ligas en formato "Todos vs Todos", la aplicación implementa un sistema de **rotación automática de parejas** que cumple con las reglas correctas del pádel:

#### ✅ **Principios Fundamentales:**

- **Cada jugador juega CON diferentes compañeros** a lo largo de la liga
- **Cada jugador juega CONTRA diferentes oponentes**
- **Rotación automática** optimizada según el número de jugadores
- **Distribución equitativa** de pistas

#### 📋 **Ejemplos de Rotación por Número de Jugadores:**

**4 Jugadores (A, B, C, D):**

```
Jornada 1: A-B vs C-D
```

**6 Jugadores (A, B, C, D, E, F):**

```
Jornada 1: A-B vs C-D (E-F descansan)
Jornada 2: A-C vs B-E (D-F descansan)
Jornada 3: A-D vs B-F (C-E descansan)
Jornada 4: A-E vs B-D (C-F descansan)
Jornada 5: A-F vs B-C (D-E descansan)
```

**8 Jugadores:**

```
- Rotación completa con 2 partidos simultáneos por jornada
- 7 jornadas para máxima variedad de enfrentamientos
- Cada jugador juega con 7 compañeros diferentes
```

#### 🏗️ **Arquitectura Técnica:**

- **`PadelRotationGeneratorService`**: Algoritmo principal de rotación
- **Matrices predefinidas**: Para configuraciones optimizadas (4, 6, 8 jugadores)
- **Algoritmo general**: Para otros números de jugadores
- **Validaciones**: Números pares, mínimo 4 jugadores
- **Cálculo de pistas**: `Math.floor(jugadores / 4)` pistas mínimas

#### 📊 **Ventajas del Sistema:**

1. **Equidad total**: Todos los jugadores tienen la misma experiencia
2. **Variedad**: Diferentes parejas y oponentes en cada jornada
3. **Optimización**: Mínimo número de jornadas para máxima rotación
4. **Escalabilidad**: Funciona para cualquier número par de jugadores

### Tabla `tournaments`

```sql
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR NOT NULL,
  format VARCHAR NOT NULL CHECK (format IN ('classic-americano', 'mixed-americano', 'team-americano')),
  player_management VARCHAR NOT NULL CHECK (player_management IN ('manual', 'link')),
  players JSONB NOT NULL DEFAULT '[]',
  courts JSONB NOT NULL DEFAULT '[]',
  games_per_round INTEGER NOT NULL DEFAULT 3 CHECK (games_per_round >= 1 AND games_per_round <= 10),
  ranking_criteria VARCHAR NOT NULL DEFAULT 'points' CHECK (ranking_criteria IN ('points', 'wins')),
  sit_out_points INTEGER NOT NULL DEFAULT 0 CHECK (sit_out_points >= 0 AND sit_out_points <= 50),
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  matches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Políticas de Seguridad para Tournaments

```sql
-- Habilitar RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver todos los torneos públicos
CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

-- Solo el creador puede editar su torneo
CREATE POLICY "Users can update own tournaments" ON tournaments
  FOR UPDATE USING (auth.uid() = creator_id);

-- Solo usuarios autenticados pueden crear torneos
CREATE POLICY "Authenticated users can create tournaments" ON tournaments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Solo el creador puede eliminar su torneo
CREATE POLICY "Users can delete own tournaments" ON tournaments
  FOR DELETE USING (auth.uid() = creator_id);
```

### Migración para añadir campo `matches` a tournaments

Si ya tienes la tabla creada, ejecuta este comando para añadir el campo `matches`:

```sql
-- Añadir campo matches a tabla tournaments existente
ALTER TABLE tournaments ADD COLUMN matches JSONB DEFAULT '[]'::jsonb;

-- Limpiar TODOS los campos JSON corruptos (ejecutar si hay problemas de parsing):
UPDATE tournaments SET
  players = '[]'::jsonb WHERE players IS NULL OR players::text = '' OR players::text = 'null';
UPDATE tournaments SET
  courts = '[]'::jsonb WHERE courts IS NULL OR courts::text = '' OR courts::text = 'null';
UPDATE tournaments SET
  matches = '[]'::jsonb WHERE matches IS NULL OR matches::text = '' OR matches::text = 'null' OR matches::text = '[]' OR matches::text = '{}';
```

---

## 🏆 Sistema de Generación Automática de Cuadros de Torneo

### 🎯 Algoritmo "Classic Americano" con Rotación Inteligente

Para torneos en formato "Classic Americano", la aplicación implementa un sistema de **generación automática de cuadros** que optimiza la rotación de parejas:

#### ✅ **Principios Fundamentales:**

- **Rotación automática de parejas** cada ronda
- **Distribución equitativa** de enfrentamientos
- **Manejo inteligente** de jugadores que descansan
- **Optimización** según número de pistas disponibles

#### 📋 **Ejemplos de Cuadros por Número de Jugadores:**

**4 Jugadores (A, B, C, D):**

```
Ronda 1: A-B vs C-D
```

**6 Jugadores (A, B, C, D, E, F):**

```
Ronda 1: A-B vs C-D (E-F descansan)
Ronda 2: A-C vs B-E (D-F descansan)
Ronda 3: A-D vs B-F (C-E descansan)
Ronda 4: A-E vs B-D (C-F descansan)
Ronda 5: A-F vs B-C (D-E descansan)
```

**8 Jugadores:**

```
- Cuadro completo con 2 partidos simultáneos por ronda
- 7 rondas para máxima variedad de enfrentamientos
- Cada jugador juega con diferentes compañeros
```

#### 🏗️ **Arquitectura Técnica:**

- **`AmericanoTournamentGeneratorService`**: Algoritmo principal de generación
- **`TournamentCalendarService`**: Orquestador principal con validaciones
- **`TournamentCalendarFactory`**: Inyección de dependencias
- **Matrices predefinidas**: Para configuraciones optimizadas (4, 6, 8 jugadores)
- **Algoritmo general**: Para otros números de jugadores
- **Campo `matches`**: Almacena el cuadro completo en formato JSONB

#### 📊 **Ventajas del Sistema:**

1. **Generación automática**: Cuadros listos al crear el torneo
2. **Rotación optimizada**: Máxima variedad de enfrentamientos
3. **Validaciones inteligentes**: Previene configuraciones inválidas
4. **Estadísticas en tiempo real**: Duración, partidos, rondas
5. **Escalabilidad**: Funciona para 4-16 jugadores (números pares)

````

### Tabla `clients`

```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);
````

### Políticas de Seguridad para Clients

```sql
-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios clientes
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden crear sus propios clientes
CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propios clientes
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propios clientes
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());
```

### Tabla `courts`

```sql
CREATE TABLE courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  number VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, number)
);
```

### Políticas de Seguridad para Courts

```sql
-- Habilitar RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias pistas
CREATE POLICY "Users can view own courts" ON courts
  FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden crear sus propias pistas
CREATE POLICY "Users can create own courts" ON courts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propias pistas
CREATE POLICY "Users can update own courts" ON courts
  FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propias pistas
CREATE POLICY "Users can delete own courts" ON courts
  FOR DELETE USING (user_id = auth.uid());
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

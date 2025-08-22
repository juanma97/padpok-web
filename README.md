# Padpok Web App

Una aplicación web moderna desarrollada con React.js, Next.js, CSS y TypeScript, siguiendo los principios de Domain Driven Design (DDD).

## 🚀 Tecnologías

- **React.js** - Biblioteca para crear interfaces de usuario
- **Next.js** - Framework de React para aplicaciones full-stack
- **TypeScript** - Superset tipado de JavaScript
- **CSS** - Estilos puros sin frameworks adicionales

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

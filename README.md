# PromptVault

Sistema de Repositorio de Prompts con Análisis Automático mediante IA

## 🚀 Características

- ✅ Crear prompts con análisis automático IA (OpenRouter)
- ✅ Crear prompts sin análisis (modo manual)
- ✅ Editar prompts y metadata
- ✅ Eliminar prompts
- ✅ Copiar prompts al portapapeles
- ✅ Subir imágenes de ejemplo
- ✅ Categorización automática (Imagen, Video, Texto, Audio)
- ✅ Sistema de tags inteligente
- ✅ Búsqueda full-text y filtros
- ✅ Favoritos
- ✅ Vista de tarjetas mobile-first
- ✅ Modales para creación y detalle
- ✅ Notificaciones toast

## 🏗️ Arquitectura

```
Frontend (React + TypeScript + Vite)
    ↓
Backend (Node.js + Express + TypeScript)
    ↓
PostgreSQL + Redis + File Storage
    ↓
OpenRouter API (Análisis IA)
```

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand (state management)

### Backend
- Node.js 20 + Express + TypeScript
- Prisma ORM
- BullMQ (background jobs)
- Sharp (image processing)

### Infraestructura
- PostgreSQL 15
- Redis 7
- Railway (hosting)

## 🚀 Deployment en Railway

### 1. Crear proyecto en Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init
```

### 2. Configurar variables de entorno

En el dashboard de Railway, configura las siguientes variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis
REDIS_URL=redis://host:port

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/auto

# App
NODE_ENV=production
PORT=3001
WEB_URL=https://your-app.railway.app
```

### 3. Deploy

```bash
railway up
```

## 🖥️ Desarrollo Local

### Requisitos
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### 1. Clonar y instalar

```bash
git clone <repo-url>
cd promptvault

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Frontend
cp .env.example .env
# Editar .env con la URL del backend
```

### 3. Iniciar servicios

```bash
# Terminal 1: PostgreSQL y Redis
# Asegúrate de tener PostgreSQL y Redis corriendo

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
npm run dev
```

### 4. Acceder

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Estructura del Proyecto

```
promptvault/
├── src/                    # Frontend React
│   ├── components/         # Componentes UI
│   ├── stores/            # Zustand stores
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── ...
├── backend/               # Backend Express
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── workers/       # BullMQ workers
│   │   └── ...
│   ├── prisma/            # Database schema
│   └── ...
├── dist/                  # Frontend build output
└── ...
```

## 📚 API Endpoints

### Prompts
- `GET /api/prompts` - Listar prompts
- `POST /api/prompts` - Crear prompt
- `GET /api/prompts/:id` - Obtener prompt
- `PUT /api/prompts/:id` - Actualizar prompt
- `DELETE /api/prompts/:id` - Eliminar prompt
- `POST /api/prompts/:id/favorite` - Toggle favorito
- `POST /api/prompts/:id/image` - Actualizar imagen

### Tags
- `GET /api/tags` - Listar tags
- `GET /api/tags/suggest?q=query` - Sugerencias de tags

## 📝 Licencia

MIT
# promotkimi

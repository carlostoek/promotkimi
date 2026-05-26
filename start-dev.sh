#!/bin/bash

echo "🚀 Iniciando PromptVault en modo desarrollo..."

# Verificar que PostgreSQL esté corriendo
if ! pg_isready -q; then
    echo "❌ PostgreSQL no está corriendo. Por favor inicia PostgreSQL primero."
    exit 1
fi

# Verificar que Redis esté corriendo
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis no está corriendo. Por favor inicia Redis primero."
    exit 1
fi

echo "✅ PostgreSQL y Redis están corriendo"

# Crear base de datos si no existe
echo "🗄️  Configurando base de datos..."
cd backend
npx prisma migrate dev --name init 2>/dev/null || true
npx prisma generate
cd ..

# Iniciar backend en background
echo "🔧 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Iniciar frontend
echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "✨ PromptVault está corriendo!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Presiona Ctrl+C para detener"

# Esperar
wait

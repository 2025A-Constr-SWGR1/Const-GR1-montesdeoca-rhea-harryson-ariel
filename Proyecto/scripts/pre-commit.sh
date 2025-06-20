#!/bin/bash

# Script para ejecutar todas las verificaciones antes del commit
# Uso: ./scripts/pre-commit.sh

set -e  # Salir si algún comando falla

echo "🔍 Ejecutando verificaciones pre-commit..."

echo "📝 Verificando tipos..."
npm run type-check

echo "🧹 Ejecutando linter..."
npm run lint:strict

echo "🧪 Ejecutando pruebas..."
npm run test:run

echo "🏗️ Compilando aplicación..."
npm run build

echo "✅ Todas las verificaciones pasaron exitosamente!"
echo "🚀 El código está listo para hacer commit y push."

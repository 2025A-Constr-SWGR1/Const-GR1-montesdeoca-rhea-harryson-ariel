#!/bin/bash

# Script para construir y ejecutar el contenedor Docker localmente
# Uso: ./scripts/docker-run.sh

set -e

APP_NAME="aeis-game-rental-hub"
PORT=${1:-3000}

echo "🐳 Construyendo imagen Docker..."
docker build -t $APP_NAME:local .

echo "🚀 Ejecutando contenedor en puerto $PORT..."
docker run --rm -p $PORT:80 --name $APP_NAME-local $APP_NAME:local

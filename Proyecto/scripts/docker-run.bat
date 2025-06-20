@echo off
REM Script para construir y ejecutar el contenedor Docker localmente (Windows)
REM Uso: scripts\docker-run.bat [puerto]

set APP_NAME=aeis-game-rental-hub
set PORT=%1
if "%PORT%"=="" set PORT=3000

echo 🐳 Construyendo imagen Docker...
docker build -t %APP_NAME%:local .
if %ERRORLEVEL% neq 0 (
    echo ❌ Error construyendo imagen Docker
    exit /b 1
)

echo 🚀 Ejecutando contenedor en puerto %PORT%...
docker run --rm -p %PORT%:80 --name %APP_NAME%-local %APP_NAME%:local

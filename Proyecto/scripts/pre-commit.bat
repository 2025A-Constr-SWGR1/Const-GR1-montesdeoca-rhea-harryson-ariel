@echo off
REM Script para ejecutar todas las verificaciones antes del commit (Windows)
REM Uso: scripts\pre-commit.bat

echo 🔍 Ejecutando verificaciones pre-commit...

echo 📝 Verificando tipos...
call npm run type-check
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en verificación de tipos
    exit /b 1
)

echo 🧹 Ejecutando linter...
call npm run lint:strict
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en linter
    exit /b 1
)

echo 🧪 Ejecutando pruebas...
call npm run test:run
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en pruebas
    exit /b 1
)

echo 🏗️ Compilando aplicación...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en compilación
    exit /b 1
)

echo ✅ Todas las verificaciones pasaron exitosamente!
echo 🚀 El código está listo para hacer commit y push.

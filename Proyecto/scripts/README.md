# Scripts de Desarrollo y Despliegue

Este directorio contiene scripts útiles para el desarrollo y despliegue de la aplicación.

## Scripts Disponibles

### 📦 NPM/Bun Scripts

```bash
# Desarrollo
bun run dev                 # Inicia servidor de desarrollo
bun run build              # Construye para producción
bun run preview            # Vista previa del build

# Calidad de código
bun run type-check         # Verificación de tipos TypeScript
bun run lint               # Ejecuta ESLint
bun run lint:fix           # Ejecuta ESLint y corrige automáticamente

# Pruebas
bun run test               # Ejecuta pruebas en modo watch
bun run test:run           # Ejecuta pruebas una vez
bun run test:ui            # Ejecuta pruebas con interfaz visual
bun run test:coverage      # Ejecuta pruebas con reporte de cobertura

# Pipeline completo
bun run compile            # type-check + build
bun run ci                 # type-check + lint + test + build
```

### 🔧 Scripts de Desarrollo

#### Pre-commit (Verificaciones antes de commit)
```bash
# Linux/Mac
./scripts/pre-commit.sh

# Windows
scripts\pre-commit.bat
```

Este script ejecuta:
1. Verificación de tipos TypeScript
2. Linter ESLint
3. Pruebas unitarias
4. Build de la aplicación

### 🐳 Scripts de Docker

#### Construcción y ejecución local
```bash
# Linux/Mac
./scripts/docker-run.sh [puerto]

# Windows
scripts\docker-run.bat [puerto]
```

Por defecto usa el puerto 3000. Ejemplo:
```bash
./scripts/docker-run.sh 8080  # Ejecuta en puerto 8080
```

#### Docker Compose
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

## 📊 Cobertura de Código

La configuración de Vitest está configurada con umbrales mínimos de cobertura:
- Ramas: 70%
- Funciones: 70%
- Líneas: 70%
- Declaraciones: 70%

Los reportes se generan en `coverage/`:
- `coverage/index.html` - Reporte visual
- `coverage/coverage-final.json` - Datos JSON

## 🚀 CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci-cd.yml`) ejecuta:

1. **Test**: Verificación de tipos, lint y pruebas
2. **Build**: Construcción de la aplicación
3. **Docker**: Construcción y push de imagen Docker (solo en main)

### Configuración de Secrets

Para el pipeline de CI/CD, configura estos secrets en GitHub:
- `DOCKER_HUB_USERNAME`: Usuario de Docker Hub
- `DOCKER_HUB_ACCESS_TOKEN`: Token de acceso de Docker Hub

## 📁 Estructura de Archivos

```
scripts/
├── pre-commit.sh          # Script de verificaciones (Linux/Mac)
├── pre-commit.bat         # Script de verificaciones (Windows)
├── docker-run.sh          # Docker local (Linux/Mac)
└── docker-run.bat         # Docker local (Windows)

.github/
└── workflows/
    └── ci-cd.yml          # Pipeline de CI/CD

docker-compose.yml         # Orquestación local
Dockerfile                 # Imagen de producción
nginx.conf                 # Configuración de Nginx
.dockerignore             # Archivos excluidos del build
```

## 🛠️ Comandos Útiles

```bash
# Verificar estado de Git
git status

# Ejecutar verificaciones completas
bun run ci

# Construir imagen Docker
docker build -t aeis-game-rental-hub .

# Ejecutar contenedor
docker run -p 3000:80 aeis-game-rental-hub

# Ver logs del contenedor
docker logs <container-id>

# Entrar al contenedor
docker exec -it <container-id> /bin/sh
```

# SIGIP

Sistema de Gestión de Incidencias de Personal.

SIGIP es un monorepo administrado con pnpm que contiene un cliente React y una
API NestJS conectada a MySQL mediante Drizzle ORM.

## Estructura

```text
apps/
  frontend/       React, Vite y TypeScript
  backend/        NestJS, Drizzle ORM, MySQL y TypeScript
packages/
  shared/         Contratos compartidos entre frontend y backend
docs/             Contexto maestro y documentación de base de datos
docker-compose.yml  MySQL local para desarrollo
```

## Requisitos

- Node.js 20.19 o superior
- pnpm 11.15.1
- Nest CLI 11
- Docker con Docker Compose, para la base de datos local

## Instalación

Todas las dependencias del workspace se instalan desde la raiz:

```bash
pnpm install
```

## Configuración

La base de datos local y el backend utilizan archivos de entorno distintos.
Estos archivos no deben versionarse.

### MySQL con Docker

Crea un archivo `.env` en la raiz del repositorio con la configuracion del
contenedor:

```dotenv
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=sigip
MYSQL_USER=sigip
MYSQL_PASSWORD=sigip_password
MYSQL_PORT=3306
```

Inicia MySQL 8.4 en segundo plano:

```bash
docker compose up -d mysql
```

El contenedor se llama `sigip-mysql`, expone el puerto indicado por
`MYSQL_PORT` y conserva la informacion en el volumen `mysql_data`.

### Backend

Copia `apps/backend/.env.example` como `apps/backend/.env` y ajusta la URL para
que coincida con las credenciales del contenedor:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://sigip:sigip_password@localhost:3306/sigip
SESSION_COOKIE_NAME=sigip_session
SESSION_IDLE_MINUTES=30
SESSION_ABSOLUTE_MINUTES=600
FRONTEND_ORIGIN=http://localhost:5173
TRUST_PROXY_HOPS=0
```

`DATABASE_URL` es obligatoria y debe utilizar el protocolo `mysql`. El backend
valida las variables al iniciar y comprueba inmediatamente la conexion con la
base de datos.

## Base de datos

Los esquemas Drizzle estan en `apps/backend/src/database/schema/` y las
migraciones generadas en `apps/backend/drizzle/`. Ejecuta los comandos desde la
raiz del repositorio:

```bash
# Generar una migracion a partir de cambios en los esquemas
pnpm db:generate

# Aplicar las migraciones pendientes
pnpm db:migrate

# Sincronizar el esquema directamente durante desarrollo
pnpm db:push

# Cargar roles, permisos y el administrador de desarrollo
pnpm db:seed
```

Las migraciones crean acceso, sesiones, estructura organizacional, asignaciones
y auditoría append-only. El seed es idempotente, no se ejecuta en producción y
crea el usuario local `admin` con la contrasena `admin123`. Estas credenciales
son exclusivamente para desarrollo.

## Estado Funcional

- Administración de roles, permisos, usuarios, unidades organizacionales, puestos, empleados y asignaciones.
- Login, logout, restauración de sesión y autorización por permisos.
- Sesiones opacas revocables con expiración inactiva y absoluta; su administración se realiza desde cada usuario.
- Auditoría persistente con filtros, detalle y valores anteriores/nuevos.
- Fase activa: tipos de incidencia.

Consulta `docs/Contexto_Maestro_SIGIP_v4.md` antes de planear nuevas funcionalidades.

## Desarrollo

```bash
pnpm dev:frontend
pnpm dev:backend
```

La API escucha en `http://localhost:3000/api` de forma predeterminada. El
endpoint `GET /api/health` permite comprobar que el servicio esta disponible.
Todas las solicitudes usan validacion global: las propiedades desconocidas son
rechazadas y los DTO se transforman a sus tipos declarados.

## Verificación

```bash
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm --filter backend test:e2e
```

## Administracion de paquetes

Los filtros de pnpm permiten administrar cualquier aplicacion sin cambiar de carpeta:

```bash
# Instalar una dependencia
pnpm --filter frontend add <paquete>
pnpm --filter backend add <paquete>
pnpm --filter @sigip/shared add <paquete>

# Instalar una dependencia de desarrollo
pnpm --filter frontend add -D <paquete>

# Eliminar o actualizar dependencias
pnpm --filter backend remove <paquete>
pnpm --filter frontend update
pnpm update -r

# Instalar una herramienta en la raiz
pnpm add -Dw <paquete>
```

## Ejecucion por workspace

Se puede ejecutar cualquier script o binario instalado en un workspace desde la raiz:

```bash
pnpm --filter frontend build
pnpm --filter backend test:e2e
pnpm --filter backend exec nest generate module users
pnpm --filter frontend exec vite --host
```

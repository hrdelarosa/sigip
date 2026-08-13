# Backend de SIGIP

API de SIGIP construida con NestJS 11, TypeScript, Drizzle ORM y MySQL 8.4.

## Responsabilidades

- Exponer la API REST bajo el prefijo global `/api`.
- Validar DTO y rechazar propiedades no declaradas.
- Persistir datos mediante Drizzle y UUIDv7 almacenados como `BINARY(16)`.
- Autenticar con sesiones opacas del lado del servidor y autorizar por permisos.
- Mantener una bitácora de auditoría append-only.

## Estructura

```text
src/
├── common/       guards, decoradores, paginación y utilidades
├── config/       configuración y validación de entorno
├── database/     conexión, esquemas y seeds
├── health/       comprobación del servicio
└── modules/      módulos funcionales
test/             pruebas e2e
drizzle/          migraciones SQL generadas
```

Los módulos persistentes siguen `Controller -> Service -> Repository`. Los servicios dependen de contratos abstractos y los repositorios Drizzle concentran SQL, conversiones UUID y mapeo de persistencia.

## Configuración

Utiliza `apps/backend/.env.example` como plantilla:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/base_de_datos
SESSION_COOKIE_NAME=sigip_session
SESSION_IDLE_MINUTES=30
SESSION_ABSOLUTE_MINUTES=600
FRONTEND_ORIGIN=http://localhost:5173
TRUST_PROXY_HOPS=0
```

`DATABASE_URL` debe ser una URL MySQL. La duración absoluta debe ser igual o mayor que la duración por inactividad.

## Ejecución

Desde la raíz del repositorio:

```bash
docker compose up -d mysql
pnpm db:migrate
pnpm db:seed
pnpm dev:backend
```

La API queda disponible en `http://localhost:3000/api`; `GET /api/health` comprueba API y base de datos.

## Verificación

```bash
pnpm --filter backend build
pnpm --filter backend lint
pnpm --filter backend test
pnpm --filter backend test:e2e
pnpm --filter backend test:cov
```

## Seguridad y Auditoría

- Nunca persistir tokens de sesión sin hash ni exponer hashes de contraseña.
- Los campos de actor se derivan del contexto autenticado, no de DTO enviados por el cliente.
- Auth usa Argon2id, cookie `HttpOnly`, expiración inactiva/absoluta, CORS con credenciales y rate limiting de login.
- `audit_logs` es append-only; no registrar contraseñas, hashes, tokens, cookies, encabezados de autorización, secretos ni binarios.
- Cuando una mutación sensible es transaccional, su evento de auditoría debe escribirse en la misma transacción.

# Contexto Maestro — SIGIP

## Sistema de Gestión de Incidencias de Personal

**Estado:** vigente

**Última actualización:** 9 de agosto de 2026

**Fase activa:** autenticación y sesiones

## 1. Propósito del documento

Este archivo concentra las decisiones vigentes del proyecto y debe utilizarse como contexto principal para continuar el análisis, diseño e implementación del sistema en futuras conversaciones.

Cuando exista una diferencia entre este documento y una decisión posterior confirmada por el desarrollador, debe prevalecer la decisión más reciente y después actualizarse este contexto.

## 2. Contexto general del sistema

SIGIP es un sistema interno para la gestión de incidencias de personal de la Oficina de Representación del Instituto Nacional de Migración en Guerrero.

El sistema busca digitalizar y organizar la información contenida en los formatos institucionales de incidencias, sin sustituir necesariamente el flujo oficial en papel.

### Regla principal del negocio

Cada formato institucional representa una sola incidencia.

Si un trabajador presenta conceptos diferentes, deberá existir un formato y una incidencia independiente para cada concepto.

Una incidencia puede corresponder a una fecha única, varias fechas independientes o un periodo continuo, siempre que todas las fechas correspondan al mismo tipo de incidencia.

## 3. Tecnologías y plataforma vigentes

### Backend

- NestJS 11
- TypeScript
- Drizzle ORM sobre `mysql2`
- Validación de DTO con `class-validator` y `class-transformer`
- Validación de entorno con Joi

### Frontend

- React 19
- Vite 8
- Tailwind CSS 4
- shadcn/ui
- TanStack Query para estado remoto
- React Hook Form y Zod para formularios
- Wouter para enrutamiento

### Persistencia

- MySQL 8.4 mediante Docker Compose para desarrollo local
- Esquemas y migraciones administrados con Drizzle
- UUIDv7 almacenados como `BINARY(16)`
- Datos de desarrollo cargados mediante un seed idempotente que se niega a ejecutarse en producción

### Autenticación

- Sesiones tradicionales almacenadas del lado del servidor
- Cookie segura `HttpOnly`
- Sesiones revocables
- No se utilizará JWT como mecanismo principal

### Estado actual de la plataforma

- El monorepo usa pnpm y separa `frontend`, `backend` y contratos compartidos.
- MySQL, Drizzle, migraciones, esquemas y seed de desarrollo ya están configurados.
- La persistencia administrativa utiliza repositorios concretos de Drizzle; ya no se considera vigente la etapa de repositorios en memoria.
- Backend y frontend están implementados para roles, permisos, usuarios, unidades organizacionales, puestos y empleados con asignaciones.
- La protección de rutas del frontend restaura la sesión con `GET /api/auth/me`, maneja carga/error/expiración y aplica permisos de consulta.
- El backend contiene módulos funcionales de `auth` y `sessions`; siguen pendientes `incident-types`, `incidents`, `document-types`, `documents`, `audit` y `dashboard`.
- La tabla `sessions` persiste únicamente el hash SHA-256 del token opaco y soporta expiración inactiva/absoluta y revocación.

## 4. Arquitectura definitiva

La arquitectura oficial será Screaming Architecture a nivel de módulos funcionales, arquitectura modular de NestJS y una separación sencilla:

```text
Controller
   ↓
Service
   ↓
Repository
```

No se aplicará Clean Architecture estricta ni se creará una clase independiente por cada caso de uso.

La prioridad será mantener un proyecto profesional, bien organizado, fácil de entender, fácil de mantener y accesible para futuros colaboradores.

### Responsabilidades vigentes

- **Controller:** define rutas HTTP, recibe datos, delega al servicio y devuelve respuestas.
- **Service:** contiene reglas funcionales, validaciones y coordinación del módulo.
- **Repository abstracto:** define el contrato de persistencia que consume el servicio.
- **Repositorio Drizzle:** implementa el contrato contra MySQL y concentra consultas, conversión UUID y detalles del motor.
- **DTO:** valida la información de entrada y define el contrato HTTP.
- **Model:** representa las estructuras internas que utiliza la capa de aplicación.
- **Presenter:** transforma modelos internos a contratos HTTP sin exponer detalles sensibles o de persistencia.
- **Errors:** agrupa errores propios del módulo cuando sea necesario.

### Regla de simplicidad

No se añadirá una capa, mapper, interfaz, caso de uso o archivo independiente únicamente para seguir un patrón arquitectónico. Cada separación debe responder a una necesidad concreta de claridad, prueba, reutilización, cambio de infraestructura o mantenimiento. Los nuevos módulos deben seguir primero los patrones que ya existen en los módulos administrativos.

## 5. Estructura general del proyecto

```text
apps/
├── backend/
│   ├── drizzle/
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── database/
│   │   ├── health/
│   │   └── modules/
│   └── test/
└── frontend/
    ├── public/
    └── src/
        ├── app/
        ├── components/
        ├── hooks/
        ├── lib/
        └── modules/
packages/
└── shared/
    └── src/
docs/
```

Los módulos de dominio se alojan en `apps/backend/src/modules/<feature>/` y `apps/frontend/src/modules/<feature>/`. Los contratos reutilizables entre ambos lados pertenecen a `packages/shared/src/`; no deben duplicarse si representan el mismo concepto de API.

## 6. Relación entre módulos y tablas

No se creará necesariamente un módulo por cada tabla. Las tablas puente y dependientes se administrarán desde el módulo funcional correspondiente.

| Módulo | Tablas o responsabilidad | Estado funcional |
|---|---|---|
| `health` | Estado de la API y conectividad de base de datos. | Implementado. |
| `roles` | `roles`, relación con usuarios mediante `users.role_id` y `role_permissions`. | Backend y frontend implementados. |
| `permissions` | `permissions`. | Backend y frontend implementados. |
| `users` | `users`. | Backend y frontend implementados con identidad autenticada. |
| `organizational-units` | `organizational_units`. | Backend y frontend implementados. |
| `positions` | `positions`. | Backend y frontend implementados. |
| `employees` | `employees` y `employee_assignments`. | Backend y frontend implementados. |
| `auth` | Inicio de sesión, cierre de sesión y usuario autenticado. | Backend y frontend implementados. |
| `sessions` | `sessions`. | Persistencia, expiración, revocación y consulta implementadas. |
| `incident-types` | `incident_types`. | Pendiente. |
| `incidents` | `incidents` e `incident_occurrences`. | Pendiente; núcleo funcional del sistema. |
| `document-types` | `document_types`. | Pendiente. |
| `documents` | `documents` y almacenamiento privado. | Pendiente. |
| `audit` | `audit_logs`. | Pendiente. |
| `dashboard` | Consultas agregadas; no tiene tabla propia. | Pendiente. |

### Decisión sobre usuarios y roles

Cada usuario tiene exactamente un rol activo.

```text
roles 1 ─── N users
```

El rol actual del usuario se almacena directamente en `users.role_id`.

No existe la tabla `user_roles`.

Cambiar el rol de un usuario significa reemplazar `users.role_id`. El cambio deberá conservarse mediante auditoría.

La relación entre roles y permisos continúa siendo N:M mediante `role_permissions`.

## 7. Estrategia de identificadores

Todas las entidades utilizarán UUIDv7 generados por la aplicación.

- En la API y TypeScript se representan como `string` con formato UUID canónico.
- En MySQL se almacenan como `BINARY(16)`.
- La aplicación genera el UUID antes del `INSERT`.
- La conversión entre UUID textual y binario pertenece a la capa de persistencia.
- Los DTO deben validar el formato UUID.
- UUID no sustituye la autorización.
- No se aplicará el intercambio de bytes diseñado para UUIDv1.
- No se usarán UUIDv4 ni identificadores autoincrementales.

## 8. Estructura interna de un módulo

Ejemplo:

```text
users/
├── dto/
├── models/
├── presenters/
├── repositories/
│   ├── users.repository.ts
│   └── drizzle-users.repository.ts
├── types/
├── users.controller.ts
├── users.errors.ts
├── users.module.ts
└── users.service.ts
```

No todos los módulos necesitan todas estas carpetas. Se incorporan únicamente cuando su responsabilidad lo justifica, pero los módulos persistentes nuevos deben reutilizar el patrón de contrato abstracto más implementación Drizzle ya establecido.

## 9. Modelo actual de usuarios

La tabla `users` tendrá:

```text
id
role_id
username
full_name
password_hash
is_active
last_login_at
created_at
updated_at
```

Modelo TypeScript interno:

```ts
export interface UserModel {
  id: string;
  roleId: string;
  username: string;
  fullName: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

Modelo público:

```ts
export type PublicUserModel = Omit<UserModel, 'passwordHash'>;
```

### Reglas del usuario

- No se almacena correo electrónico.
- La autenticación utiliza `username` y contraseña.
- La contraseña nunca se almacena en texto plano y se protege con Argon2id mediante el servicio criptográfico compartido.
- `passwordHash` nunca se devuelve en respuestas HTTP.
- Cada usuario tiene exactamente un rol.
- El usuario se desactiva; no se elimina normalmente.
- Al desactivar un usuario deben revocarse sus sesiones activas.
- Solo puede asignarse un rol activo.
- El nombre de usuario debe ser único.
- La política definitiva de mayúsculas y normalización del `username` sigue pendiente.

## 10. Contratos HTTP implementados y previstos

Las rutas de Health, Users, Roles, Permissions, Organizational Units, Positions y Employees indicadas abajo ya están implementadas, excepto donde se marque expresamente lo contrario. Las rutas de los módulos restantes representan el contrato previsto y deberán confirmarse al especificar cada fase.

### Health

```http
GET /api/health
```

### Auth

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Sessions

```http
GET    /api/sessions
GET    /api/sessions/:id
DELETE /api/sessions/:id
DELETE /api/sessions
GET    /api/users/:userId/sessions
DELETE /api/users/:userId/sessions
```

### Users

```http
GET   /api/users
GET   /api/users/:id
POST  /api/users
PATCH /api/users/:id
PATCH /api/users/:id/status
PATCH /api/users/:id/password
```

#### Operaciones de Users

- `GET /api/users`: listado, búsqueda, filtro por estado, filtro por rol y paginación.
- `GET /api/users/:id`: consulta individual con validación UUID.
- `POST /api/users`: recibe `roleId`, `username`, `fullName` y contraseña temporal; crea el usuario activo y genera UUIDv7.
- `PATCH /api/users/:id`: actualiza `fullName` y puede reemplazar `roleId`; nunca agrega un segundo rol.
- `PATCH /api/users/:id/status`: activa o desactiva; al desactivar deberá revocar sesiones.
- `PATCH /api/users/:id/password`: cambia la contraseña sin devolverla ni exponer el hash.

### Roles

```http
GET   /api/roles
GET   /api/roles/:id
POST  /api/roles
PATCH /api/roles/:id
PATCH /api/roles/:id/status
GET   /api/roles/:id/permissions
PUT   /api/roles/:id/permissions
```

Reglas:

- Un rol con usuarios asignados no puede desactivarse hasta migrar esos usuarios a otro rol activo.
- El código del rol será único e inmutable.
- Los permisos se administran mediante `role_permissions`.

### Permissions

```http
GET    /api/permissions
GET    /api/permissions/:id
POST   /api/permissions
PATCH  /api/permissions/:id
DELETE /api/permissions/:id
```

### Organizational Units

```http
GET   /api/organizational-units
GET   /api/organizational-units/:id
POST  /api/organizational-units
PATCH /api/organizational-units/:id
PATCH /api/organizational-units/:id/status
```

### Positions

```http
GET   /api/positions
GET   /api/positions/:id
POST  /api/positions
PATCH /api/positions/:id
PATCH /api/positions/:id/status
```

### Employees

```http
GET   /api/employees
GET   /api/employees/:id
POST  /api/employees
PATCH /api/employees/:id
PATCH /api/employees/:id/status
GET   /api/employees/:id/assignments
GET   /api/employees/:employeeId/assignments/:assignmentId
POST  /api/employees/:id/assignments
PATCH /api/employees/:employeeId/assignments/:assignmentId
GET   /api/employees/:id/incidents
```

Todas las rutas anteriores de Employees salvo `GET /api/employees/:id/incidents` están implementadas. La consulta de incidencias se incorporará con el módulo `incidents`.

### Incident Types

```http
GET   /api/incident-types
GET   /api/incident-types/:id
POST  /api/incident-types
PATCH /api/incident-types/:id
PATCH /api/incident-types/:id/status
```

### Incidents

```http
GET   /api/incidents
GET   /api/incidents/:id
POST  /api/incidents
PATCH /api/incidents/:id
POST  /api/incidents/:id/cancel
```

Las ocurrencias se administran dentro de la incidencia y no tendrán módulo HTTP independiente al inicio.

### Document Types

```http
GET   /api/document-types
GET   /api/document-types/:id
POST  /api/document-types
PATCH /api/document-types/:id
PATCH /api/document-types/:id/status
```

### Documents

```http
GET    /api/incidents/:incidentId/documents
POST   /api/incidents/:incidentId/documents
GET    /api/documents/:id
DELETE /api/documents/:id
```

La eliminación será lógica.

### Audit

```http
GET /api/audit
GET /api/audit/:id
```

La auditoría será append-only.

### Dashboard

```http
GET /api/dashboard/summary
GET /api/dashboard/active-incidents
GET /api/dashboard/incidents-by-type
```

## 11. Fase actual del desarrollo

La infraestructura administrativa previa al núcleo de incidencias se considera terminada como fase funcional. Esto no significa que el proyecto completo esté finalizado: significa que ya existe la base operativa sobre la que debe construirse el dominio principal.

### Alcance completado

- Monorepo pnpm con contratos compartidos.
- Backend NestJS conectado a MySQL mediante Drizzle.
- Docker Compose para MySQL 8.4.
- Esquemas, dos migraciones y seed de desarrollo para acceso y estructura organizacional.
- Health check de API y base de datos.
- Backend de roles, permisos, usuarios, unidades organizacionales, puestos, empleados y asignaciones.
- Frontend administrativo para esos mismos módulos, con consultas, formularios y flujos de alta/edición/estado según corresponda.

### Alcance inmediato completado

La fase `Auth + Sessions` está implementada de extremo a extremo antes de iniciar incidencias:

```text
credenciales
  ↓
validar usuario activo y contraseña
  ↓
crear sesión y almacenar solamente el hash del token
  ↓
emitir cookie HttpOnly
  ↓
resolver GET /api/auth/me
  ↓
proteger backend y frontend
  ↓
aplicar autorización por permisos
```

Esta secuencia evita que `incidents`, `documents` y `audit` reciban identificadores de actor desde el cliente. Campos como `registeredBy`, `updatedBy`, `cancelledBy` y `uploadedBy` deben derivarse siempre de la sesión autenticada.

### Trabajo todavía pendiente

- Catálogos de tipos de incidencia y tipos documentales.
- Incidencias y ocurrencias con todas sus reglas transaccionales.
- Almacenamiento privado y descarga autorizada de documentos.
- Auditoría append-only.
- Dashboard y consultas agregadas.
- Ampliar pruebas automatizadas; actualmente solo existe la base e2e del backend.

## 12. Orden de implementación

```text
FASE ADMINISTRATIVA — COMPLETADA
├── Health + Database
├── Roles + Permissions + Users
├── Organizational Units + Positions
└── Employees + Employee Assignments

AUTH + SESSIONS — COMPLETADA
├── backend: login, logout y me
├── backend: cookie HttpOnly y token opaco
├── backend: expiración, revocación y administración
├── backend: autenticación y autorización globales
├── backend: pruebas unitarias y e2e
└── frontend: restauración de sesión y rutas protegidas

NÚCLEO FUNCIONAL
├── Incident Types
├── Incidents + Incident Occurrences
├── Document Types
└── Documents + almacenamiento privado

CIERRE FUNCIONAL
├── Audit
└── Dashboard
```

### Razón para implementar Auth antes que Incidents

Las incidencias y los documentos registran quién ejecutó cada acción. Si se construyen antes de Auth, los controladores tendrían que aceptar IDs de usuario artificiales o inseguros y después habría que rediseñarlos. Con la sesión resuelta, el actor se obtiene del contexto autenticado y la autorización por permisos queda disponible desde el primer endpoint del núcleo.

Audit no debe posponerse hasta después de todo el sistema. Su infraestructura puede incorporarse tras incidencias/documentos, pero las operaciones sensibles nuevas deben integrarse a la auditoría en cuanto el módulo esté disponible.

## 13. Reglas transaccionales relevantes

1. Crear una incidencia junto con todas sus ocurrencias.
2. Verificar que la asignación pertenece al empleado.
3. Verificar que la asignación está vigente durante la incidencia.
4. Validar modalidad temporal y nombramiento.
5. Impedir periodos incompatibles o superpuestos.
6. Exigir documentos cuando el tipo de incidencia lo requiera.
7. Cancelar incidencias sin borrarlas.
8. Revocar sesiones activas al desactivar un usuario.
9. Cambiar el rol actualizando únicamente `users.role_id`.
10. Auditar el rol anterior y el nuevo.
11. Impedir asignar roles inactivos.
12. Impedir desactivar roles con usuarios asignados.
13. Extender expiración por inactividad sin superar la expiración absoluta.
14. Guardar auditoría en la misma transacción cuando sea posible.

## 14. Auditoría

Eventos mínimos:

- inicio de sesión correcto y fallido;
- cierre y revocación de sesiones;
- creación, modificación, desactivación y cambio de contraseña de usuarios;
- cambio de rol;
- cambios de roles y permisos;
- cambios en empleados y asignaciones;
- creación, actualización y cancelación de incidencias;
- carga y baja lógica de documentos;
- modificaciones de catálogos.

Nunca deben registrarse contraseñas, hashes de contraseña, tokens, hashes de sesión ni contenido binario.

## 15. Decisiones todavía pendientes

- Catálogo definitivo de tipos de incidencia.
- Estados definitivos de empleados e incidencias.
- Reglas de desactivación de empleados.
- Modalidades temporales definitivas.
- Significado exacto de `format_date`.
- Regla institucional de quincena.
- Tipos definitivos de nombramiento.
- Requisitos documentales.
- Posible folio del formato.
- MIME y tamaño máximo de archivos.
- Política antivirus, respaldo y retención.
- Duración de sesiones.
- Configuración definitiva de la cookie de sesión según el entorno.
- Rotación de tokens, sesiones concurrentes y rate limiting de login.
- Política de credenciales.
- Normalización y sensibilidad a mayúsculas del username.
- Reactivación o reemplazo de incidencias canceladas.
- Confirmación de si `full_name` es suficiente.
- Entidades que necesitan campos directos de actor.
- Códigos definitivos de roles.

## 16. Criterio de salida de la fase Auth + Sessions

La fase no se considera terminada por tener solamente endpoints aislados. Debe funcionar el flujo completo entre navegador, API y MySQL:

1. `POST /api/auth/login` valida credenciales contra el usuario activo y crea una sesión persistida.
2. El token de sesión es opaco, se entrega únicamente mediante cookie `HttpOnly` y en MySQL se almacena solo su hash.
3. `GET /api/auth/me` devuelve la identidad pública, el rol y los permisos efectivos sin exponer secretos.
4. `POST /api/auth/logout` revoca la sesión actual y elimina la cookie.
5. El guard de sesión rechaza tokens ausentes, inválidos, revocados o expirados y actualiza la expiración por inactividad sin superar la absoluta.
6. El guard/decorador de permisos protege las operaciones administrativas existentes.
7. Desactivar un usuario o cambiar su contraseña revoca las sesiones que correspondan según la política confirmada.
8. El frontend restaura la sesión al cargar, maneja estados de carga y expiración, y deja de usar el `ProtectedRoute` provisional.
9. Las solicitudes con cookie incluyen las credenciales necesarias y la configuración CORS/cookie es correcta para desarrollo y producción.
10. Existen pruebas unitarias para reglas de sesión y pruebas e2e para login, `me`, logout, expiración/revocación y acceso denegado.

Cumplidos estos puntos, la siguiente fase productiva es `Incident Types`; después continúa `Incidents` con actores derivados exclusivamente de la sesión.

### Configuración implementada

- El token de sesión contiene 256 bits aleatorios, se entrega solo en la cookie y se persiste como SHA-256 hexadecimal.
- Las contraseñas utilizan Argon2id. Las credenciales inválidas producen una respuesta uniforme y el login está limitado a 10 intentos por minuto por cliente y por instancia.
- Los valores predeterminados son 30 minutos de inactividad y 10 horas de duración absoluta; la actividad se actualiza condicionalmente en cada petición válida y nunca supera el límite absoluto.
- La cookie usa `HttpOnly`, `SameSite=Lax`, ruta `/`, expiración absoluta y `Secure` en producción.
- CORS acepta únicamente `FRONTEND_ORIGIN` con credenciales y las mutaciones validan el encabezado `Origin` cuando está presente.
- Desactivar un usuario o reemplazar su contraseña revoca sus sesiones activas en la misma transacción de MySQL.
- Los permisos efectivos se consultan desde el rol vigente al resolver cada petición; un cambio de rol o permisos se aplica sin emitir una sesión nueva.
- `GET/DELETE /api/sessions` opera sobre las sesiones propias. La consulta y revocación por usuario requiere `sessions:read` o `sessions:revoke`.

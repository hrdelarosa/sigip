# Contexto Maestro — SIGIP
## Sistema de Gestión de Incidencias de Personal

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

## 3. Tecnologías seleccionadas

### Backend

- NestJS
- TypeScript

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui

### Persistencia futura

- MySQL 8 o superior
- Drizzle ORM

### Autenticación

- Sesiones tradicionales almacenadas del lado del servidor
- Cookie segura `HttpOnly`
- Sesiones revocables
- No se utilizará JWT como mecanismo principal

### Fase actual

- No hay base de datos conectada.
- No hay Drizzle configurado.
- No hay migraciones.
- Se utilizan datos ficticios o repositorios en memoria.
- El objetivo actual es construir y comprender la API por módulos.

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

### Responsabilidades

- **Controller:** define rutas HTTP, recibe datos, delega al servicio y devuelve respuestas.
- **Service:** contiene reglas funcionales, validaciones y coordinación del módulo.
- **Repository:** abstrae la persistencia; inicialmente puede utilizar memoria y después Drizzle/MySQL.
- **DTO:** valida la información de entrada y define el contrato HTTP.
- **Model:** representa estructuras internas mientras no exista el esquema definitivo de Drizzle.
- **Errors:** agrupa errores propios del módulo cuando sea necesario.

### Regla de simplicidad

No se añadirá una capa, mapper, interfaz, caso de uso o archivo independiente únicamente para seguir un patrón arquitectónico. Cada separación debe responder a una necesidad concreta de claridad, prueba, reutilización, cambio de infraestructura o mantenimiento.

## 5. Estructura general del backend

```text
src/
├── main.ts
├── app.module.ts
├── common/
├── config/
├── health/
└── modules/
    ├── auth/
    ├── sessions/
    ├── users/
    ├── roles/
    ├── permissions/
    ├── organizational-units/
    ├── positions/
    ├── employees/
    ├── incident-types/
    ├── incidents/
    ├── document-types/
    ├── documents/
    ├── audit/
    └── dashboard/
```

## 6. Relación entre módulos y tablas

No se creará necesariamente un módulo por cada tabla. Las tablas puente y dependientes se administrarán desde el módulo funcional correspondiente.

| Módulo | Tablas o responsabilidad |
|---|---|
| `auth` | Inicio de sesión, cierre de sesión y usuario autenticado. |
| `sessions` | `sessions`. |
| `users` | `users`. |
| `roles` | `roles`, relación con usuarios mediante `users.role_id` y `role_permissions`. |
| `permissions` | `permissions`. |
| `organizational-units` | `organizational_units`. |
| `positions` | `positions`. |
| `employees` | `employees` y `employee_assignments`. |
| `incident-types` | `incident_types`. |
| `incidents` | `incidents` e `incident_occurrences`. |
| `document-types` | `document_types`. |
| `documents` | `documents`. |
| `audit` | `audit_logs`. |
| `dashboard` | Consultas agregadas; no tiene tabla propia. |
| `health` | Estado de la API; no tiene tabla propia. |

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
│   ├── change-user-password.dto.ts
│   ├── change-user-status.dto.ts
│   ├── create-user.dto.ts
│   ├── list-users-query.dto.ts
│   ├── update-user.dto.ts
│   └── user-id-param.dto.ts
├── models/
│   └── user.model.ts
├── repositories/
│   ├── users.repository.ts
│   └── in-memory-users.repository.ts
├── users.controller.ts
├── users.service.ts
├── users.errors.ts
└── users.module.ts
```

En la etapa inicial, un módulo puede comenzar sin repositorio si su información ficticia vive dentro del servicio. La separación se incorporará cuando ayude a preparar la persistencia o las pruebas.

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
- La contraseña nunca se almacena en texto plano.
- `passwordHash` nunca se devuelve en respuestas HTTP.
- Cada usuario tiene exactamente un rol.
- El usuario se desactiva; no se elimina normalmente.
- Al desactivar un usuario deben revocarse sus sesiones activas.
- Solo puede asignarse un rol activo.
- El nombre de usuario debe ser único.
- La política definitiva de mayúsculas y normalización del `username` sigue pendiente.

## 10. Rutas previstas

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
GET /api/permissions
GET /api/permissions/:id
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
POST  /api/employees/:id/assignments
GET   /api/employees/:id/incidents
```

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

Durante esta etapa:

- no se conectará MySQL;
- no se configurará Drizzle;
- no se crearán migraciones;
- no se almacenarán archivos reales;
- no se desarrollará todavía el frontend;
- no se aplicará autenticación real;
- no se aplicarán permisos reales;
- los datos pueden almacenarse temporalmente en memoria.

## 12. Orden de implementación

```text
1. Health
2. Roles
3. Permissions
4. Users
5. Auth
6. Sessions
7. Organizational Units
8. Positions
9. Employees
10. Incident Types
11. Incidents
12. Document Types
13. Documents
14. Audit
15. Dashboard
```

### Razón para implementar Roles antes que Users

Un usuario necesita obligatoriamente un `roleId`. Para validar correctamente, el rol debe existir, estar activo y ser el único del usuario.

Durante la etapa ficticia, Users puede utilizar UUID de roles simulados. Antes de conectar la base de datos conviene tener preparado Roles.

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
- Algoritmo de hash.
- Política de credenciales.
- Normalización y sensibilidad a mayúsculas del username.
- Reactivación o reemplazo de incidencias canceladas.
- Confirmación de si `full_name` es suficiente.
- Entidades que necesitan campos directos de actor.
- Códigos definitivos de roles.

## 16. Estado inmediato del módulo Users

Debe utilizar:

```ts
roleId: string;
```

No debe utilizar:

```ts
roleIds: string[];
```

No debe existir la tabla:

```text
user_roles
```

Tampoco debe existir la ruta:

```http
PUT /api/users/:id/roles
```

El cambio de rol se realizará mediante:

```http
PATCH /api/users/:id
```

con un cuerpo como:

```json
{
  "roleId": "uuid-del-rol"
}
```

El módulo seguirá trabajando inicialmente con datos ficticios, UUIDv7 y un hash simulado que nunca se expone en la API.

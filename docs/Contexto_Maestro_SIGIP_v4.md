# Contexto Maestro — SIGIP

## Sistema de Gestión de Incidencias de Personal

**Estado:** vigente

**Última actualización:** 28 de agosto de 2026

**Fase activa:** tipos de incidencia

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
- Datos de desarrollo cargados mediante un seed idempotente que se niega a ejecutarse en producción; `RESET_DEVELOPMENT_ORGANIZATION=true` permite reemplazar el catálogo de empleados y borrar incidencias/documentos de desarrollo dependientes antes de importar la plantilla. Los datos personales de la plantilla se mantienen exclusivamente en `template-employees.seed-data.local.ts`, archivo ignorado por Git; el repositorio conserva sólo un ejemplo ficticio.

### Autenticación

- Sesiones tradicionales almacenadas del lado del servidor
- Cookie segura `HttpOnly`
- Sesiones revocables
- No se utilizará JWT como mecanismo principal

### Estado actual de la plataforma

- El monorepo usa pnpm y separa `frontend`, `backend` y contratos compartidos.
- MySQL, Drizzle, migraciones, esquemas y seed de desarrollo ya están configurados.
- La persistencia administrativa utiliza repositorios concretos de Drizzle; ya no se considera vigente la etapa de repositorios en memoria.
- Backend y frontend están implementados para roles, permisos, usuarios, unidades organizacionales, puestos y empleados con asignaciones. Una asignación conserva puesto, nombramiento, horario y vigencia; su unidad organizacional es opcional para personal sin adscripción, pero el puesto permanece obligatorio.
- La protección de rutas del frontend restaura la sesión con `GET /api/auth/me`, maneja carga/error/expiración y aplica permisos de consulta.
- El backend contiene módulos funcionales de `auth`, `sessions`, `audit`, `incident-types`, `incidents`, `documents`, `dashboard` y `reports`. El frontend integra el flujo de incidencias con listado, filtros, alta, detalle, edición, cancelación y descarga privada. Las vacaciones ordinarias permiten capturar fechas individuales o generar días desde un rango, incluyendo fines de semana de manera opcional. El saldo histórico se calcula por empleado, año y periodo desde incidencias activas y ajustes append-only auditados; la cancelación libera los días. También se controla un máximo mensual combinado de tres justificaciones de entrada/salida. Las incidencias `COMISION` admiten un único oficio PDF opcional de hasta 5 MB durante el alta o desde el expediente. El panel de inicio (`dashboard`) ofrece resumen operativo, personal ausente hoy por incidencia, incidencias por tipo y el periodo vacacional vigente. Los reportes de incidencias de personal se generan por quincena (primera 1-15 o segunda 16-fin de mes), mes, año o periodo personalizado, con filtros por tipo y unidad, vista previa enriquecida y descarga en PDF. Siguen pendientes la administración de `document-types` y otros anexos opcionales.
- La tabla `sessions` persiste únicamente el hash SHA-256 del token opaco y soporta expiración inactiva/absoluta y revocación.
- La auditoría es append-only y ya registra autenticación, sesiones y mutaciones de usuarios. Su integración transversal continúa a medida que se modifiquen roles, permisos, empleados, asignaciones y nuevos módulos de dominio.

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

En frontend se prefiere un componente React exportado por archivo. Los componentes visuales con responsabilidad propia deben extraerse; los helpers puros de uso exclusivo permanecen junto al componente que los consume para no crear abstracciones sin reutilización.

## 6. Relación entre módulos y tablas

No se creará necesariamente un módulo por cada tabla. Las tablas puente y dependientes se administrarán desde el módulo funcional correspondiente.

| Módulo | Tablas o responsabilidad | Estado funcional |
|---|---|---|
| `health` | Estado de la API y conectividad de base de datos. | Implementado. |
| `roles` | `roles`, relación con usuarios mediante `users.role_id` y `role_permissions`. | Backend y frontend implementados. |
| `permissions` | `permissions`. | Backend y frontend implementados. |
| `users` | `users`. | Backend y frontend implementados con identidad autenticada, detalle enriquecido, permisos efectivos y resumen de sesiones. |
| `offices` | `offices`. | Catálogo de oficinas de solo lectura implementado en backend y frontend; el seed de desarrollo carga las cuatro oficinas operativas. |
| `organizational-units` | `organizational_units`. | Backend y frontend implementados. |
| `positions` | `positions`. | Backend y frontend implementados. |
| `employees` | `employees`, `employee_assignments` y `employee_vacation_adjustments`. | Backend y frontend implementados, incluido control vacacional y de justificaciones. |
| `auth` | Inicio de sesión, cierre de sesión y usuario autenticado. | Backend y frontend implementados. |
| `sessions` | `sessions`. | Persistencia, expiración, revocación y administración por usuario implementadas. |
| `incident-types` | `incident_types`. | Backend implementado; el catálogo alimenta la captura de incidencias. |
| `incidents` | `incidents` e `incident_occurrences`. | Backend y frontend implementados para alta, consulta, edición y cancelación. |
| `document-types` | `document_types`. | Esquema y tipo `FORMATO_INCIDENCIA` implementados; administración pendiente. |
| `documents` | `documents` y almacenamiento privado. | PDF principal, listado, descarga privada, baja lógica y oficio opcional de Comisión implementados; otros anexos quedan pendientes. |
| `audit` | `audit_logs`. | Esquema, migraciones, consulta backend y frontend implementados; autenticación, sesiones y usuarios ya producen eventos. Resta integrar las demás mutaciones administrativas y de dominio. |
| `dashboard` | Consultas agregadas; no tiene tabla propia. | Backend y frontend implementados: resumen operativo, personal ausente hoy por incidencia e incidencias por tipo. |
| `reports` | Consultas agregadas y generación PDF; no tiene tabla propia. | Backend y frontend implementados para reportes de incidencias, vista previa con tres métricas, distribución por tipo y unidad, detalle compacto y exportación protegida. |

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
GET    /api/users/:userId/sessions
DELETE /api/users/:userId/sessions/:id
```

La administración se abre desde las acciones del usuario. La consulta requiere `sessions:read`, la revocación requiere `sessions:revoke` y el historial administrativo visible se limita a sesiones creadas durante los últimos siete días. Cada sesión muestra dispositivo, agente de usuario, IP, actividad, creación, expiración por inactividad, expiración absoluta, estado y si corresponde a la sesión actual.

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
- `GET /api/users/:id`: consulta individual con validación UUID; incluye rol, permisos efectivos, creador cuando puede derivarse de Audit y resumen de sesiones. La auditoría reciente solo se incluye si el solicitante posee `audit:read`.
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
POST  /api/employees/:id/vacation-adjustments
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

Las vacaciones continúan persistiendo cada día como una ocurrencia independiente. Provisionalmente, el primer periodo comprende enero-junio y el segundo julio-diciembre; el calendario definitivo deberá sustituir esta configuración centralizada cuando sea confirmado. Cada periodo concede 10 días sin acumulación y solo está disponible después de seis meses desde la fecha de ingreso institucional. El formulario permite agregar días individualmente o expandir un rango, con exclusión de sábados y domingos por defecto y una opción explícita para incluirlos.

El saldo se deriva de ocurrencias activas y movimientos manuales en `employee_vacation_adjustments`. Los movimientos son append-only, requieren `employees:update`, aceptan correcciones positivas o negativas y se auditan en la misma transacción. El consumo resultante debe permanecer entre 0 y 10. Las incidencias canceladas dejan de consumir saldo y sus fechas vuelven a estar disponibles. Se bloquean fechas vacacionales duplicadas entre incidencias activas. `VACACIONES_ESTIMULOS` permanece independiente.

`JUSTIFICACION_ENTRADA` y `JUSTIFICACION_SALIDA` comparten un máximo de tres ocurrencias activas por empleado y mes. Una cancelación libera el cupo. El detalle del empleado muestra el saldo vacacional actual e histórico y el contador mensual actual e histórico de justificaciones.

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

Ambas rutas requieren `audit:read`. El listado permite filtrar por acción, entidad, UUID de entidad, usuario, sesión y rango de fechas. El detalle presenta acción, actor, fecha, entidad, sesión, IP, agente de usuario y conserva por separado los valores anteriores y nuevos, incluyendo estructuras JSON complejas.

### Dashboard

```http
GET /api/dashboard/summary
GET /api/dashboard/active-incidents
GET /api/dashboard/incidents-by-type
GET /api/dashboard/incident-trend?period=6m
GET /api/dashboard/upcoming-returns
GET /api/dashboard/recent-incidents
```

Las seis rutas requieren `dashboard:read`. El panel presenta el estado operativo del personal, el periodo vacacional institucional vigente con sus fechas y días naturales restantes, la evolución histórica configurable (`3m`, `6m`, `ytd`, `12m`), la composición anual por tipo, las ausencias vigentes, las próximas reincorporaciones y las incidencias recientes. Las consultas de fecha usan el calendario `America/Mexico_City`.

### Reports

```http
GET /api/reports/incidents
GET /api/reports/incidents/pdf
```

La vista JSON requiere `reports:read`. La descarga PDF requiere simultáneamente `reports:read` y `reports:export`. El reporte de incidencias acepta un periodo `FORTNIGHT` (con `fortnight` `FIRST`/`SECOND` y `month`/`year`), `MONTH` (con `month`/`year`), `YEAR` (con `year`) o `CUSTOM` (con `startDate`/`endDate`), además de filtros opcionales por tipo de incidencia y unidad organizacional y la inclusión de canceladas. El periodo personalizado no puede superar un año. El endpoint `pdf` devuelve el reporte como descarga PDF en formato carta vertical (612×792) con el membrete institucional `modules/reports/assets/institutional-header.jpeg` (copiado a `dist` vía `nest-cli.json`), encabezado de carta con fecha y destinatario y una plantilla documental sobria en blanco, negro y grises. El resumen, las distribuciones por tipo y unidad y el detalle utilizan jerarquía tipográfica institucional, líneas finas y tablas sin colores de estado; el detalle se pagina sin cascada con encabezados repetidos.

## 11. Fase actual del desarrollo

La infraestructura administrativa previa al núcleo de incidencias se considera terminada como fase funcional. Esto no significa que el proyecto completo esté finalizado: significa que ya existe la base operativa sobre la que debe construirse el dominio principal.

### Alcance completado

- Monorepo pnpm con contratos compartidos.
- Backend NestJS conectado a MySQL mediante Drizzle.
- Docker Compose para MySQL 8.4.
- Esquemas y migraciones para acceso, estructura organizacional, sesiones, auditoría, incidencias y documentos, además del seed de desarrollo.
- Health check de API y base de datos.
- Backend de roles, permisos, usuarios, unidades organizacionales, puestos, empleados y asignaciones.
- Frontend administrativo para esos mismos módulos, con consultas, formularios y flujos de alta/edición/estado según corresponda.
- Administración de sesiones desde las acciones de cada usuario, con consulta de actividad y revocación autorizada.
- Auditoría persistente y append-only con filtros, detalle visual y valores anteriores/nuevos.
- Tipos de incidencia, incidencias y ocurrencias persistentes con validación de nombramiento, vigencia, modalidad temporal, superposición y cancelación lógica.
- PDF principal obligatorio almacenado fuera de archivos públicos, con metadatos privados y descarga autenticada.
- Frontend de incidencias con filtros URL, paginación, captura guiada, edición, cancelación, detalle histórico y expediente documental.

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

- Administración visual de tipos de incidencia y tipos documentales.
- Carga de anexos opcionales distintos del oficio de Comisión y del formato principal.
- Integración transversal restante de auditoría en roles, permisos, empleados, asignaciones y catálogos.
- Ampliar pruebas automatizadas para las fases de dominio y los flujos visuales; Auth, Sessions, Users y Audit ya cuentan con cobertura unitaria/e2e focalizada en backend.

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
├── Integración transversal restante de Audit
├── Dashboard — COMPLETADO
└── Reports — COMPLETADO
```

### Razón para implementar Auth antes que Incidents

Las incidencias y los documentos registran quién ejecutó cada acción. Si se construyen antes de Auth, los controladores tendrían que aceptar IDs de usuario artificiales o inseguros y después habría que rediseñarlos. Con la sesión resuelta, el actor se obtiene del contexto autenticado y la autorización por permisos queda disponible desde el primer endpoint del núcleo.

La infraestructura de Audit ya está incorporada. Toda operación sensible nueva debe integrarse a la auditoría desde su implementación y compartir transacción con la mutación cuando corresponda.

## 13. Reglas transaccionales relevantes

1. Crear una incidencia junto con todas sus ocurrencias.
2. Derivar autorización, aislamiento y reportes desde la oficina obligatoria del empleado.
3. Exigir una asignación si existe una aplicable a todas las fechas de la incidencia; permitir su ausencia solo cuando no exista.
4. Verificar que la asignación indicada pertenece al empleado y está vigente durante la incidencia.
5. Validar modalidad temporal y, cuando exista asignación, nombramiento.
6. Impedir periodos incompatibles o superpuestos.
7. Exigir documentos cuando el tipo de incidencia lo requiera.
8. Cancelar incidencias sin borrarlas.
9. Revocar sesiones activas al desactivar un usuario.
10. Cambiar el rol actualizando únicamente `users.role_id`.
11. Auditar el rol anterior y el nuevo.
12. Impedir asignar roles inactivos.
13. Impedir desactivar roles con usuarios asignados.
14. Extender expiración por inactividad sin superar la expiración absoluta.
15. Guardar auditoría en la misma transacción cuando sea posible.

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
- Estados definitivos adicionales de empleados, si se requieren más allá del modelo actual.
- Reglas de desactivación de empleados.
- Posibles modalidades temporales adicionales a `SINGLE_DATE`, `MULTIPLE_DATES` y `DATE_RANGE`.
- Regla institucional de quincena.
- Tipos definitivos de nombramiento.
- Posible folio del formato.
- MIME y tamaño máximo de otros anexos opcionales; el formato principal es PDF de hasta 10 MB y el oficio de Comisión es PDF de hasta 5 MB.
- Política antivirus, respaldo y retención.
- Configuración definitiva de la cookie de sesión según el entorno.
- Rotación de tokens y política definitiva de sesiones concurrentes.
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
- La administración de sesiones se realiza desde las acciones de cada usuario; no existe una página global que mezcle sesiones ni una página de autoservicio. Consultar y revocar sesiones de un usuario requiere `sessions:read` o `sessions:revoke`, respectivamente.
- La consulta administrativa de sesiones devuelve únicamente las creadas durante los últimos siete días; el estado efectivo se deriva de revocación y vencimientos inactivo/absoluto.
- El detalle de usuario muestra identidad, rol, permisos efectivos agrupables por módulo, creación/actualización, creador derivado del evento `CREATED` y resumen de sesiones. Si no existe evento histórico o el solicitante no posee `audit:read`, el creador o la auditoría reciente pueden ser nulos.
- Audit expone consultas protegidas por `audit:read`, conserva `oldValues` y `newValues` sanitizados y nunca registra contraseñas, hashes, tokens, cookies, encabezados de autorización, secretos ni contenido binario.

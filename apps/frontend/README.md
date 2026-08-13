# Frontend de SIGIP

Cliente web de SIGIP construido con React 19, Vite 8, TypeScript, Tailwind CSS 4 y componentes shadcn/Base UI.

## Responsabilidades

- Restaurar la sesión mediante `GET /api/auth/me`.
- Proteger rutas y navegación según permisos efectivos.
- Administrar roles, permisos, usuarios, estructura organizacional, empleados y asignaciones.
- Consultar y revocar sesiones desde las acciones de cada usuario.
- Consultar la auditoría y presentar valores anteriores/nuevos.

## Estructura

```text
src/
├── app/          layouts y enrutamiento
├── components/   componentes compartidos y UI
├── config/       navegación y configuración del cliente
├── lib/          utilidades
└── modules/      funcionalidades por dominio
```

Los contratos HTTP se importan desde `@sigip/shared`. En desarrollo, Vite resuelve este paquete contra `packages/shared/src` para evitar contratos compilados obsoletos durante HMR.

Se prefiere un componente React exportado por archivo. Los subcomponentes visuales con responsabilidad propia deben extraerse; los helpers puros de uso exclusivo pueden permanecer con su componente.

## Ejecución

Desde la raíz del repositorio:

```bash
pnpm dev:frontend
pnpm --filter frontend build
pnpm --filter frontend lint
pnpm --filter frontend preview
```

El servidor de desarrollo usa `http://localhost:5173` de forma predeterminada. El backend debe permitir ese origen mediante `FRONTEND_ORIGIN` y aceptar credenciales para la cookie de sesión.

## Seguridad

- La cookie de sesión es `HttpOnly`; el frontend no debe leer ni almacenar el token.
- Las solicitudes autenticadas incluyen credenciales.
- Ocultar una acción por permisos mejora la UX, pero la autorización definitiva siempre corresponde al backend.
- Nunca enviar IDs de actor para operaciones de dominio; se derivan de la sesión autenticada.

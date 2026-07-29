# SIGIP

Sistema de Gestion de Incidencias de Personal.

## Estructura

```text
apps/
  frontend/       React, Vite y TypeScript
  backend/        NestJS y TypeScript
packages/
  shared/         Base para contratos compartidos
docs/             Documentacion del proyecto
```

## Requisitos

- Node.js 20.19 o superior
- pnpm 11.15.1
- Nest CLI 11

## Instalacion

Todas las dependencias del workspace se instalan desde la raiz:

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev:frontend
pnpm dev:backend
```

## Verificacion

```bash
pnpm build
pnpm lint
pnpm test
pnpm typecheck
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

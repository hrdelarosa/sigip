# Repository Guidelines

## Project Structure & Module Organization

SIGIP is a pnpm monorepo. `apps/frontend/` contains the React 19 + Vite client; keep components, styles, and browser assets under `src/`, with static files in `public/`. `apps/backend/` contains the NestJS API and its Drizzle/MySQL integration. Organize domain code in `src/modules/<feature>/`, environment configuration in `src/config/`, database infrastructure and schemas in `src/database/`, generated SQL migrations in `apps/backend/drizzle/`, and end-to-end tests in `test/`. Reusable contracts belong in `packages/shared/src/`. Project decisions and database documentation live in `docs/`. The root `docker-compose.yml` provides the local MySQL 8.4 service.

## Build, Test, and Development Commands

Run commands from the repository root with pnpm 11.15.1:

- `pnpm install` installs all workspace dependencies.
- `pnpm dev:frontend` starts the Vite development server.
- `pnpm dev:backend` starts NestJS in watch mode.
- `pnpm build` builds every workspace that defines a build script.
- `pnpm lint` runs workspace lint checks.
- `pnpm test` runs available Jest suites.
- `pnpm typecheck` runs workspace TypeScript checks where configured.
- `pnpm --filter backend test:e2e` runs backend end-to-end tests.
- `docker compose up -d mysql` starts the local MySQL service.
- `pnpm db:generate` generates a Drizzle migration from schema changes.
- `pnpm db:migrate` applies pending migrations.
- `pnpm db:push` synchronizes the schema directly during local development.
- `pnpm db:seed` idempotently loads development roles, permissions, and the local administrator; it must never run in production.

Use filters for focused validation, for example `pnpm --filter frontend build` or `pnpm --filter backend test`.

## Coding Style & Naming Conventions

Write TypeScript with two-space indentation and let ESLint and Prettier enforce formatting. Use `PascalCase` for classes and React components, `camelCase` for functions and variables, and descriptive kebab-case filenames. Follow NestJS suffixes such as `users.controller.ts`, `create-user.dto.ts`, and `users.schema.ts`. Prefer feature modules, constructor injection, explicit DTO validation, and strongly typed database access; avoid `any` and unchecked assertions.

## Backend & Database Conventions

The API uses the global `/api` prefix and a global `ValidationPipe` that transforms DTO values, strips no undeclared input silently, and rejects non-whitelisted properties. Keep health checks under `src/health/`; `GET /api/health` is the current service probe. Environment variables are loaded globally through `ConfigModule` and validated with Joi. `DATABASE_URL` is required and must be a MySQL URL; access configuration through `ConfigService` or registered configuration instead of reading `process.env` throughout application modules.

Define Drizzle tables under `src/database/schema/<domain>/` and re-export them through the schema index files. Use the shared UUID and timestamp column helpers where applicable, preserve explicit foreign-key behavior and indexes, and export inferred row/insert types. After changing a schema, generate and review the SQL migration before applying it. Do not edit an already-applied migration to represent a new schema change.

The global `DatabaseModule` exports the `MYSQL_POOL` and `DRIZZLE_DATABASE` injection tokens. Inject these tokens rather than creating feature-specific pools. Ensure acquired connections are released and that new infrastructure participates in graceful shutdown. Development seed data belongs in `src/database/seeds/`, must remain safe to rerun, and must refuse to execute when `NODE_ENV=production`.

## Environment & Secrets

The root `.env` configures Docker Compose with `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and optional `MYSQL_PORT`. `apps/backend/.env` configures NestJS and Drizzle with `NODE_ENV`, `PORT`, and `DATABASE_URL`; use `apps/backend/.env.example` as the template. Never commit either real `.env` file or production credentials. Keep the Docker and backend credentials aligned for local development, and update `.env.example` whenever the backend gains a required environment variable.

## Testing Guidelines

The backend uses Jest, ts-jest, and Supertest. Name unit tests `*.spec.ts` beside source code and end-to-end tests `*.e2e-spec.ts` under `apps/backend/test/`. Add tests for new behavior and regressions. Run `pnpm --filter backend test:cov` when changing critical business logic; no fixed coverage threshold is currently configured.

## Commit & Pull Request Guidelines

Follow the repository's Conventional Commit style: `feat(backend): add user lookup`, `chore: update tooling`, or `docs: clarify setup`. Keep commits focused. Pull requests should explain the change, list verification commands, link related issues, and call out schema or environment changes. Include screenshots for visible frontend changes and never commit secrets; copy `apps/backend/.env.example` for local configuration.

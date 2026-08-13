# Repository Guidelines

## Project Structure & Module Organization

SIGIP is a pnpm monorepo. `apps/frontend/` contains the React 19 + Vite client; keep components, styles, and browser assets under `src/`, with static files in `public/`. `apps/backend/` contains the NestJS API and its Drizzle/MySQL integration. Organize domain code in `src/modules/<feature>/`, environment configuration in `src/config/`, database infrastructure and schemas in `src/database/`, generated SQL migrations in `apps/backend/drizzle/`, and end-to-end tests in `test/`. Reusable contracts belong in `packages/shared/src/`. Project decisions and database documentation live in `docs/`. The root `docker-compose.yml` provides the local MySQL 8.4 service.

## Source of Truth & Current Phase

Read `docs/Contexto_Maestro_SIGIP_v4.md` before planning a new feature; it is the source of truth for product scope, architecture, domain rules, implementation status, and sequencing. When a confirmed decision changes, update that document in the same change so it does not drift from the code. If the document conflicts with a newer explicit user decision, follow the newer decision and then synchronize the document.

The administrative foundation is functionally complete in backend and frontend: roles, permissions, users, organizational units, positions, employees, and employee assignments. MySQL, Drizzle schemas/migrations, Docker Compose, and development seeds are active infrastructure; do not reintroduce in-memory repositories or describe persistence/frontend work as future setup.

The `Auth + Sessions` phase is complete end to end:

1. Login, logout, and `GET /api/auth/me`.
2. Opaque session token in an `HttpOnly` cookie, with only its hash persisted.
3. Idle and absolute expiration, revocation, and session administration.
4. Global session authentication plus permission-based authorization.
5. Real frontend session restoration and permission-aware route protection.
6. Automated tests for authentication, expiration/revocation, and authorization failures.

Audit infrastructure is also active: `audit_logs` is append-only, `GET /api/audit` and `GET /api/audit/:id` require `audit:read`, and the frontend provides filtering and detailed before/after values. Authentication, session, and user mutations already write audit events; remaining administrative and domain mutations must be integrated as they are touched. Never audit passwords, hashes, tokens, cookies, authorization headers, secrets, or binary content. When a sensitive mutation is transactional, its audit write belongs to the same transaction.

The active phase is now `Incident Types`. Then implement in this order: Incidents with Incident Occurrences; Document Types and private document storage; remaining cross-cutting Audit integration; Dashboard. Incidents are the core domain. Actor fields such as `registeredBy`, `updatedBy`, `cancelledBy`, and `uploadedBy` must come from the authenticated request context and must never be accepted from client input.

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

Write TypeScript with two-space indentation and let ESLint and Prettier enforce formatting. Use `PascalCase` for classes and React components, `camelCase` for functions and variables, and descriptive kebab-case filenames. Follow NestJS suffixes such as `users.controller.ts`, `create-user.dto.ts`, and `users.schema.ts`. Prefer one exported React component per file; extract meaningful visual subcomponents instead of accumulating several components in a page or Sheet file, while keeping one-use pure helpers colocated with their owning component. Prefer feature modules, constructor injection, explicit DTO validation, and strongly typed database access; avoid `any` and unchecked assertions.

## Backend & Database Conventions

The API uses the global `/api` prefix and a global `ValidationPipe` that transforms DTO values, strips no undeclared input silently, and rejects non-whitelisted properties. Keep health checks under `src/health/`; `GET /api/health` is the current service probe. Environment variables are loaded globally through `ConfigModule` and validated with Joi. `DATABASE_URL` is required and must be a MySQL URL; access configuration through `ConfigService` or registered configuration instead of reading `process.env` throughout application modules.

Define Drizzle tables under `src/database/schema/<domain>/` and re-export them through the schema index files. Use the shared UUID and timestamp column helpers where applicable, preserve explicit foreign-key behavior and indexes, and export inferred row/insert types. After changing a schema, generate and review the SQL migration before applying it. Do not edit an already-applied migration to represent a new schema change.

The global `DatabaseModule` exports the `MYSQL_POOL` and `DRIZZLE_DATABASE` injection tokens. Inject these tokens rather than creating feature-specific pools. Ensure acquired connections are released and that new infrastructure participates in graceful shutdown. Development seed data belongs in `src/database/seeds/`, must remain safe to rerun, and must refuse to execute when `NODE_ENV=production`.

Persistent feature modules should follow the established `Controller -> Service -> Repository` direction. Services depend on abstract repository contracts; Drizzle implementations own SQL, UUID binary/text conversion, and persistence-specific mapping. Use presenters for HTTP response shaping when internal models contain persistence or sensitive fields. Follow an existing administrative module before introducing a new layer or pattern.

Authentication uses server-side sessions, not JWT as the primary mechanism. Never store raw session tokens, expose password hashes, or trust user/actor identifiers supplied by the frontend. Cookie, CORS, expiration, revocation, and permission checks are part of the same security boundary and must be verified together.

Session administration lives in each user's actions, not in a global sessions page. `GET /api/users/:userId/sessions` requires `sessions:read`; revocation requires `sessions:revoke`. Administrative session history is limited to the most recent seven days. User details may enrich the response with effective permissions, session summary, creator derived from the `CREATED` audit event, and recent audit only when the requester has `audit:read`.

## Environment & Secrets

The root `.env` configures Docker Compose with `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and optional `MYSQL_PORT`. `apps/backend/.env` configures NestJS and Drizzle with `NODE_ENV`, `PORT`, and `DATABASE_URL`; use `apps/backend/.env.example` as the template. Never commit either real `.env` file or production credentials. Keep the Docker and backend credentials aligned for local development, and update `.env.example` whenever the backend gains a required environment variable.

## Testing Guidelines

The backend uses Jest, ts-jest, and Supertest. Name unit tests `*.spec.ts` beside source code and end-to-end tests `*.e2e-spec.ts` under `apps/backend/test/`. Add tests for new behavior and regressions. Run `pnpm --filter backend test:cov` when changing critical business logic; no fixed coverage threshold is currently configured.

Auth/session and incident rules are critical business logic. Cover service rules with unit tests and the browser-facing security flow with e2e tests, including successful behavior, invalid input, unauthenticated access, insufficient permissions, expiration/revocation, and transactional rollback where applicable.

## Commit & Pull Request Guidelines

Follow the repository's Conventional Commit style: `feat(backend): add user lookup`, `chore: update tooling`, or `docs: clarify setup`. Keep commits focused. Pull requests should explain the change, list verification commands, link related issues, and call out schema or environment changes. Include screenshots for visible frontend changes and never commit secrets; copy `apps/backend/.env.example` for local configuration.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the repo root. The root `package.json` orchestrates the pnpm workspace via `--filter` / `--recursive`.

```bash
# Dev servers
pnpm dev               # Next.js web app (apps/web) on http://localhost:3000
pnpm dev:mobile        # Expo dev server (apps/mobile)

# Build
pnpm build             # Web production build
pnpm build:mobile      # Expo build

# Quality
pnpm lint              # ESLint, recursive across workspace
pnpm type-check        # `tsc --noEmit`, recursive
pnpm format            # Prettier on **/*.{ts,tsx,js,jsx,json,md}

# Database (Prisma, schema lives at repo root)
pnpm db:generate       # Regenerate Prisma client (run after schema edits)
pnpm db:push           # Sync schema to the dev DB (SQLite)
pnpm db:studio         # Prisma Studio
```

Single-package commands: use `pnpm --filter web <script>` or `pnpm --filter mobile <script>` (e.g. `pnpm --filter web type-check`).

**Tests are not configured.** `pnpm test` is wired as a recursive script but neither app defines a `test` script and no test framework is installed — do not assume a runnable test suite exists.

Dependencies must be installed at the repo root with `pnpm install`. The workspace uses `workspace:*` references — never `pnpm install` inside a sub-package.

## Architecture

### Workspace layout

- `apps/web` — Next.js 14 (App Router) web app and REST API.
- `apps/mobile` — Expo + React Native app using Expo Router.
- `packages/shared` — Shared TypeScript types and utilities, consumed by both apps as `@project-management/shared` (`workspace:*`).
- `prisma/schema.prisma` — Single Prisma schema at the repo root, shared across the workspace.

### Web app (`apps/web`)

- **API routes** live under `src/app/api/...` (App Router route handlers). Resources: `projects` and `tasks` (full CRUD), plus `integrations/github` and `integrations/slack`.
- **Prisma client** is exposed as a singleton from `src/lib/prisma.ts` — always import from there to avoid connection-pool exhaustion in dev. Dev logging is guarded behind `NODE_ENV`.
- **Response shape** is standardised through `src/lib/api-response.ts` + `src/lib/error-handler.ts`, wrapping payloads in the shared `ApiResponse<T>` envelope (success flag, error object, metadata for pagination).
- **State**: TanStack React Query (server state) + Zustand (client state), wired in `src/app/providers.tsx`.
- **UI primitives** live in `src/components/ui` (shadcn-style: badge, button, card, input, select, textarea).
- **`next.config.js`** sets `transpilePackages: ['@project-management/shared']` so the workspace package is compiled by Next, and whitelists GitHub/Google avatar domains — add new image hosts here when introducing them.

### Mobile app (`apps/mobile`)

- **Expo Router** under `src/app` mirrors the web resource shape (`projects`, `tasks`, etc.).
- **API layer** is `src/services/api/`: an axios instance with request/response interceptors and a custom `ApiError` class. Per-resource service modules (tasks, projects) sit beside it — add new resources here.
- **Offline support**: `src/hooks/useOfflineData` plus AsyncStorage cache data; `components/NetworkStatus` and `components/ErrorBoundary` are the corresponding UI hooks. See `apps/mobile/OFFLINE_STORAGE.md`.

### Shared package (`packages/shared`)

Source of truth for cross-platform code. Exports types (`project`, `task`, `user`, `integration`, `api` envelope) and utilities (`date`, `validators`, `constants`) via `src/index.ts`. Add new cross-app types here rather than duplicating them in each app.

### Database (Prisma)

- **Provider**: SQLite for dev (`DATABASE_URL="file:./dev.db"`); PostgreSQL is supported for prod.
- **Core models**: `User` (roles `USER` / `ADMIN` / `MANAGER`), `Project` (status `PLANNING` / `IN_PROGRESS` / `ON_HOLD` / `COMPLETED` / `ARCHIVED`; priority `LOW` / `MEDIUM` / `HIGH` / `URGENT`), `Task` (status `TODO` / `IN_PROGRESS` / `IN_REVIEW` / `DONE` / `BLOCKED`), plus `GitHubIntegration` and `SlackIntegration`.
- After editing `prisma/schema.prisma`, always run `pnpm db:generate` then `pnpm db:push`.

### External integrations

GitHub and Slack clients live in `apps/web/src/lib/integrations`. They read tokens from env (`GITHUB_PERSONAL_ACCESS_TOKEN`, `SLACK_WEBHOOK_URL`, plus optional OAuth pairs). See `.env.example` for the full list of expected env vars.

## Conventions and gotchas

- **TypeScript** is strict, with `noUnusedLocals` / `noUnusedParameters` enabled in the root `tsconfig.json`. Prefix intentionally unused parameters with `_`.
- **ESLint** (`.eslintrc.json`) integrates with Prettier and permits `console`. Lint failures usually mean a formatting or unused-symbol issue.
- **Documentation language**: `README.md` and the `*_SETUP_GUIDE.md` / `70代向け_*.md` / `USER_TASKS.md` files are end-user docs in Japanese (the senior-friendly guides are for non-technical users). They are not architecture references — rely on the code and this file for technical context.
- **`start-app.sh`** is a convenience launcher that `cd`s into `apps/web` and runs `pnpm dev` with an automatic browser open. Don't add tooling that conflicts with it.

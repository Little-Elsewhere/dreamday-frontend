# AGENTS.md

Dreamday travel planning frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui (Base UI), next-intl, Zod.

This root file orients agents to the repo. Put domain- or package-specific instructions in a nested `AGENTS.md` closer to that code (nearest file wins). Cursor-scoped coding rules live in `.cursor/rules/*.mdc`.

The codebase and folder layout are still incomplete (~80% of the intended organization). Treat the paths below as the current map, not a finished contract. When unsure where a file or folder should live, or when a change would invent a new top-level / feature layout, ask the user before creating or moving structure.

## Setup commands

- Install: `pnpm install`
- Dev server: `pnpm dev` (port 4000)
- Production build: `pnpm build`
- Start standalone: `pnpm start`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Typecheck: `pnpm typecheck`
- Unit tests: `pnpm test:unit`
- E2E tests: `pnpm test:e2e`

Copy `.env.example` to `.env` before build when needed. Do not commit secrets.

## Project structure

### Top level

- `src/` — application source
- `messages/` — next-intl catalogs (`en/`, `vi/`), split by domain (`auth`, `common`, `trips`)
- `public/` — static assets (fonts, images, icons)
- `e2e/` — Playwright specs
- `scripts/` — repo scripts (standalone prepare/start)
- `docker/` — Docker assets for dev/prod
- `.github/workflows/` — CI, CD, release
- `.cursor/rules/` — Cursor rule modules
- `.agents/`, `.claude/` — agent skills and Claude helpers
- `.storybook/` — Storybook config
- `.husky/` — Git hooks

### `src/`

- `src/app/` — App Router layouts, pages, route handlers, PWA (`sw.ts`, `manifest.ts`, Serwist)
- `src/app/[locale]/` — locale-prefixed routes
- `src/app/[locale]/(private)/` — authenticated surfaces (trips, account)
- `src/app/[locale]/(public)/` — public surfaces (auth, maintenance)
- `src/app/api/` — Route Handlers
- `src/features/` — feature modules colocated by domain
- `src/features/auth/` — auth UI, session helpers, schemas/utils
- `src/features/trips/` — trip UI, hooks, schemas, data loaders
- `src/components/ui/` — shared shadcn/ui primitives
- `src/components/common/` — cross-feature presentational pieces
- `src/constants/` — shared constants (routes, locale, HTTP statuses)
- `src/env/` — typed env (`client.ts`, `server.ts`)
- `src/i18n/` — next-intl routing, navigation, request config
- `src/schemas/` — cross-cutting Zod schemas
- `src/types/` — shared TypeScript types
- `src/utils/` — shared helpers (`cn`, locale, action-result)
- `src/stories/` — Storybook stories
- `src/proxy.ts` — request proxy / middleware entry

Feature folders typically use `components/`, `hooks/`, `schemas/`, `utils/`, `constants/`, `types/`, and `data/` when server data access is needed.

## Code style

Follow `.cursor/rules/` for enforceable conventions:

- `typescript.mdc` — untrusted input, return types, Props, interface vs type
- `tailwind.mdc` — `cn()` for conditional/merged classes only
- `i18n.mdc` — next-intl for UI copy and formatters
- `hooks.mdc` — group complex hook returns by data/handlers/statuses/refs
- `react-compiler.mdc` — no manual `memo` / `useMemo` / `useCallback` by default

Match nearby files before inventing new patterns. Prefer Server Components; keep Client Components small and leaf-level.

## Testing instructions

- Unit: Vitest via `pnpm test:unit` (colocated `*.test.ts(x)` under `src/`)
- E2E: Playwright via `pnpm test:e2e` (specs under `e2e/`)
- Stories: `src/**/*.stories.tsx`, Storybook on port 6006
- Before finishing a change, run the checks relevant to what you touched (`lint`, `typecheck`, unit tests). CI on PRs to `develop`/`main` runs a Quality job (commitlint + format + lint + typecheck), Vitest (`pnpm test:unit`), Playwright (`pnpm test:e2e`), and build from `.env.example`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `deps`, `style`, `revert`). Enforced by commitlint (Husky + CI).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

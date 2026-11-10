# AGENTS.md

Dreamday travel planning frontend (Next.js App Router, next-intl, shadcn/ui on Base UI).

The folder layout is still incomplete (~80% of the intended organization). Match nearby files before inventing patterns. When unsure where a file belongs, or when a change would add a new top-level / feature layout, ask the user before creating or moving structure.

## Conventions

Enforceable rules live in `.claude/rules/*.md`. Beyond those:

- Prefer Server Components; keep Client Components small and leaf-level.
- In feature `actions/`, keep HTTP/session helpers in separate files from `'use server'` modules.
- Locale-aware links and redirects come from `@/i18n/navigation`, not `next/link` / `next/navigation`.
- Regexes live only in a global `src/constants/` or feature `constants/` module, as a `const` or a property of a `const` object. Semgrep rejects them anywhere else, including a local `const`.

### shadcn/ui

Add components with the shadcn CLI (`npx shadcn@latest info` for project context).

- Semantic colors only (`bg-primary`, `text-muted-foreground`), never raw palette values.
- `className` on components is for layout only; don't override their colors.
- Use `flex` + `gap-*`, not `space-x-*` / `space-y-*`.
- No manual `z-index` on overlays (Dialog, Sheet, Popover, …).
- Icons in `Button` use `data-icon="inline-start"` / `"inline-end"`, no sizing classes.

## Before finishing

- Run the checks relevant to what you touched: `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`.
- E2E integration specs need the backend API and Mailpit running.
- Commits follow Conventional Commits (commitlint via Husky + CI).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

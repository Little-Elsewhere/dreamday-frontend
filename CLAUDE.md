# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Start dev server (http://localhost:3000/en)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config)
pnpm format       # Format with Prettier
pnpm typecheck    # Run TypeScript type checking
pnpm storybook    # Start Storybook (:6006)
pnpm build-storybook  # Build static Storybook
pnpm clean        # Remove .next and node_modules
```

## Versioning & Release

This project uses **release-please** for automatic versioning and changelog generation.

### Workflow

1. **On `develop`**: Code freely, use conventional commits
2. **Merge to `main`**: release-please detects conventional commits
3. **Automatic**: Creates Release PR with version bump and CHANGELOG
4. **Merge Release PR**: Version tagged, CHANGELOG updated

### Conventional Commits Format

Follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
Enforced by **commitlint** (Husky `commit-msg` + CI on PRs to `develop`).

```
<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]
```

| Type       | Description      | Example                             |
| ---------- | ---------------- | ----------------------------------- |
| `feat`     | New feature      | `feat: add lesson card component`   |
| `fix`      | Bug fix          | `fix: button click issue on mobile` |
| `docs`     | Documentation    | `docs: update README`               |
| `refactor` | Code refactoring | `refactor: simplify UserService`    |
| `perf`     | Performance      | `perf: optimize image loading`      |
| `test`     | Tests            | `test: add unit tests for utils`    |
| `build`    | Build system     | `build: update project tooling`     |
| `ci`       | CI/CD            | `ci: add GitHub Actions workflow`   |
| `chore`    | Maintenance      | `chore: update dependencies`        |
| `deps`     | Dependency bumps | `deps: bump zod to v4`              |
| `style`    | Styles           | `style: adjust button spacing`      |
| `revert`   | Revert           | `revert: undo loading changes`      |

### Breaking Changes

Add `!` after type or `BREAKING CHANGE:` in footer:

```
feat!: change API response format

BREAKING CHANGE: User API now returns id instead of _id
```

### Version Bump

| Commit Type                  | Version Bump          |
| ---------------------------- | --------------------- |
| `feat`                       | minor (1.0.0 → 1.1.0) |
| `fix`                        | patch (1.0.0 → 1.0.1) |
| `feat!` or `BREAKING CHANGE` | major (1.0.0 → 2.0.0) |

### Branch Strategy

| Branch           | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `develop`        | Main development branch                      |
| `main`           | Release branch (release-please watches this) |
| Feature branches | Branch from `develop`, merge back via PR     |

### Release PR

When commits are merged to `main`, release-please creates a PR:

- Title: "chore(main): release X.Y.Z"
- Body: Lists all commits with their authors and PRs
- Merging this PR triggers the release

## Architecture

### Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** with shadcn/ui (base-maia style)
- **@base-ui/react** for UI primitives
- **@hugeicons/react** for icons
- **next-intl** for i18n (en, vi locales)
- **Serwist** for PWA/service worker
- **Vitest + Playwright + Storybook** for testing

### Key Paths

- `src/app/` — Next.js App Router pages and layouts
- `src/app/[locale]/` — Locale-routed pages (en, vi)
- `src/components/ui/` — shadcn/ui components
- `src/hooks/` — Custom React hooks (add your own)
- `src/utils/` — Utility functions (cn.ts, barrel export)
- `messages/` — Translation files (en/, vi/)
- `src/stories/` — Storybook stories

### Project Structure

Empty directories use `.gitkeep` to preserve structure in git:

- `src/components/`, `src/constants/`, `src/hooks/`, `src/modules/`, `src/schemas/`, `src/types/`
- Add actual files when you need them (e.g., `src/hooks/use-media-query.ts`)

### Next.js Config

- React Compiler enabled (`reactCompiler: true`)
- Serwist wraps the config: `withSerwist(withNextIntl(nextConfig))`
- PWA features only activate in production builds

## Conventions

### shadcn/ui

Components are added via CLI. Run `npx shadcn@latest info` for project context.

**Critical rules:**

- Use **semantic colors** (`bg-primary`, `text-muted-foreground`) — never raw values (`bg-blue-500`)
- **`className` for layout only** — don't override component colors
- No `space-x-*` or `space-y-*` — use `flex` with `gap-*`
- Use `cn()` for conditional classes
- No manual `z-index` on overlay components (Dialog, Sheet, Popover, etc.)
- Icons in Button use `data-icon="inline-start"` or `data-icon="inline-end"`, no sizing classes

### Icons

Import from `@hugeicons/react` (configured iconLibrary). Example:

```tsx
import { SearchIcon } from '@hugeicons/react'
```

### i18n

- Supported locales: `en`, `vi`
- Root `/` redirects to `/en`
- Use `next-intl/navigation` for locale-aware links
- Translations in `messages/{locale}/`

### Testing

- Storybook runs with Vitest plugin (Chromatic, a11y, docs addons)
- Stories in `src/**/*.stories.tsx`

## PWA

- Service worker: `src/app/sw.ts`
- Manifest: `src/app/manifest.ts` (served at `/manifest.webmanifest`)
- Offline fallback: `src/app/[locale]/~offline/page.tsx`

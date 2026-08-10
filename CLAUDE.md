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

# Changesets (versioning)
pnpm changeset           # Create a new changeset file
pnpm changelog           # Bump version + update lockfile
```

## Versioning & Release

This project uses **Changesets** for versioning (private project, no npm publish).

### Workflow

1. Create changeset before committing:

   ```bash
   pnpm changeset
   ```
   - Select package (`next16-codebase`)
   - Choose bump type: `patch` (bug fix), `minor` (new feature), `major` (breaking change)
   - Write description of changes

2. Commit the changeset file (`.changeset/*.md`) along with your code changes

3. When PR is merged to `develop`:
   - CI runs changeset-enforce to verify changeset exists
   - release.yml creates "Version Packages" PR with version bump

### Version Bump Types

| Type    | Example       | When to use                        |
| ------- | ------------- | ---------------------------------- |
| `patch` | 1.0.0 → 1.0.1 | Bug fixes                          |
| `minor` | 1.0.0 → 1.1.0 | New features (backward compatible) |
| `major` | 1.0.0 → 2.0.0 | Breaking changes                   |

### Branch Strategy

| Branch           | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `develop`        | Main development branch, contains latest version |
| Feature branches | Branch from `develop`, merge back via PR         |

CI/CD runs on every push to `develop` and every PR targeting `develop`.

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

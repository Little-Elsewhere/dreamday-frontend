# WeList

A Next.js 16 starter with React 19, TypeScript, Tailwind CSS v4, i18n, Storybook, and PWA support.

## Tech Stack

| Category      | Tech                                          |
| :------------ | :-------------------------------------------- |
| Framework     | Next.js 16.2.4, React 19.2.5                  |
| Language      | TypeScript 5 (strict mode)                    |
| Styling       | Tailwind CSS v4 + shadcn/ui (base-maia style) |
| UI Primitives | @base-ui/react                                |
| Icons         | @hugeicons/react                              |
| i18n          | next-intl                                     |
| Validation    | Zod                                           |
| Testing       | Vitest + Playwright + Storybook               |
| Docs          | Storybook                                     |
| PWA           | Serwist                                       |
| Linting       | ESLint (flat config)                          |
| Formatting    | Prettier + Tailwind Prettier plugin           |
| Git hooks     | Husky + lint-staged                           |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000/en
```

> **Note:** This project uses locale-based routing via next-intl. The root `/` redirects to `/en`. Supported locales: `en`, `vi`.

## Scripts

```bash
pnpm dev             # Start dev server
pnpm build           # Production build
pnpm start           # Start production server
pnpm typecheck       # Run TypeScript type checking
pnpm lint            # Run ESLint
pnpm format          # Format all files with Prettier
pnpm storybook       # Start Storybook on :6006
pnpm build-storybook # Build static Storybook
pnpm clean           # Remove .next and node_modules
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── [locale]/         # Locale-routed pages (en, vi)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout (Serwist, fonts, metadata)
│   ├── globals.css       # Tailwind v4 CSS with design tokens
│   └── sw.ts             # Service worker source
├── components/
│   ├── ui/               # shadcn/ui components
│   └── index.ts
├── hooks/                # Custom React hooks
├── utils/
│   └── cn.ts             # clsx + tailwind-merge
├── i18n/                 # next-intl config
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
├── types/                # TypeScript types
├── schemas/              # Zod schemas
├── modules/              # Feature modules
├── constants/            # Constants
└── stories/              # Storybook stories
messages/                 # i18n translation files
├── en/
└── vi/
```

## Features

### i18n (next-intl)

- Supported locales: `en`, `vi`
- Translations in `messages/{locale}/`
- Use `next-intl/navigation` for locale-aware links

### shadcn/ui

- Components managed via `shadcn` CLI
- Style: `base-maia`, icons: `@hugeicons/react`
- Add new components:

```bash
npx shadcn add button
```

### Storybook

- Run: `pnpm storybook`
- Addons: a11y, chromatic (visual regression), vitest, docs
- Stories in `src/**/*.stories.tsx`

### PWA (Serwist)

- Service worker in `src/app/sw.ts`
- Manifest in `src/app/manifest.ts` (served at `/manifest.webmanifest`)
- Offline fallback page at `src/app/[locale]/~offline/page.tsx`
- Configured in `next.config.ts`
- PWA features (precache, offline fallback) only activate in production builds (`pnpm build && pnpm start`)

### Pre-commit Hooks

- Husky runs `lint-staged` on staged files
- ESLint + Prettier format on commit
- Hook setup runs automatically via `prepare` script

## Docker

```bash
# Development
pnpm docker:dev              # Start dev container
pnpm docker:dev:down        # Stop dev container

# Production
pnpm docker:prod             # Build production image
```

## Environment Variables

```bash
cp .env.example .env.local
```

| Variable                         | Description                      |
| :------------------------------- | :------------------------------- |
| `NEXT_PUBLIC_APP_NAME`           | App name                         |
| `NEXT_PUBLIC_APP_DEFAULT_TITLE`  | Default page title               |
| `NEXT_PUBLIC_APP_TITLE_TEMPLATE` | Title template (%s = page title) |
| `NEXT_PUBLIC_APP_DESCRIPTION`    | Meta description                 |

## Environment Setup

This project uses **pnpm**. Install it if you haven't:

```bash
npm install -g pnpm
```

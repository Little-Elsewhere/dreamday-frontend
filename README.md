# Next 16 Codebase

A modern web application starter built with Next.js App Router, internationalization, a component system, PWA/offline support, and development quality tooling.

## Tech Stack

| Category             | Technology                                        |
| :------------------- | :------------------------------------------------ |
| Framework            | Next.js 16.3.0, App Router, Turbopack             |
| UI runtime           | React 19.2.8, React Compiler                      |
| Language             | TypeScript 6, strict mode                         |
| Styling              | Tailwind CSS v4, `tw-animate-css`                 |
| UI components        | shadcn/ui base-maia, `@base-ui/react`             |
| Icons                | `@hugeicons/react`                                |
| Internationalization | `next-intl`, locales `en` and `vi`                |
| Validation           | Zod 4                                             |
| Analytics            | PostHog (`posthog-js`)                            |
| PWA                  | Serwist, service worker, and offline fallback     |
| Tooling              | ESLint 9, Prettier, Vitest, Playwright, Storybook |
| Git workflow         | Husky, lint-staged, commitlint, release-please    |

## Requirements

- Node.js 24, as used in CI
- pnpm 10
- Docker Desktop for container-based development

Install pnpm if it is not already available:

```bash
npm install --global pnpm
```

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) or
[http://localhost:3000/vi](http://localhost:3000/vi).

The application uses locale-based routing. The default locale is `en`; supported
locales are defined in `src/i18n/routing.ts`.

## Environment Variables

The `.env.example` file contains the variables required for local development:

| Variable                            | Required | Description                                          |
| :---------------------------------- | :------: | :--------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`              |   Yes    | Application name                                     |
| `NEXT_PUBLIC_APP_DEFAULT_TITLE`     |   Yes    | Default page title                                   |
| `NEXT_PUBLIC_APP_TITLE_TEMPLATE`    |   Yes    | Title template; use `%s` for the page title          |
| `NEXT_PUBLIC_APP_DESCRIPTION`       |   Yes    | Application and metadata description                 |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` |    No    | PostHog token; leave empty to disable analytics      |
| `NEXT_PUBLIC_POSTHOG_HOST`          |    No    | PostHog host, defaults to `https://us.i.posthog.com` |

Environment variables are validated with Zod in `src/env/server.ts` and
`src/env/client.ts`.

## Scripts

```bash
pnpm dev                 # Start the development server
pnpm build               # Create a production build
pnpm start               # Start the production server
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript checks
pnpm format              # Format the project with Prettier
pnpm storybook           # Start Storybook at http://localhost:6006
pnpm build-storybook     # Build Storybook as a static site
pnpm clean               # Remove .next and node_modules
pnpm docker:dev          # Build and run the development container
pnpm docker:dev:down     # Stop the development container
pnpm docker:prod         # Build the production Docker image
pnpm commitlint          # Validate commit messages
```

Vitest and Playwright are installed for unit and browser testing. Dedicated test
scripts will be added alongside the corresponding test suites.

## Project Structure

```text
src/
├── app/
│   ├── [locale]/              # Locale-based routes: en, vi
│   │   ├── layout.tsx         # Metadata, font, i18n provider, Serwist
│   │   ├── page.tsx           # Home page
│   │   └── ~offline/          # Offline fallback page
│   ├── api/csp-report/        # CSP violation reports endpoint
│   ├── globals.css            # Design tokens and Tailwind CSS v4
│   ├── manifest.ts            # PWA manifest
│   └── sw.ts                  # Service worker source
├── components/ui/             # shadcn/ui components
├── hooks/                     # Custom React hooks
├── i18n/                      # Routing, request config, and navigation
├── modules/                   # Feature modules
├── schemas/                   # Zod schemas
├── types/                     # TypeScript types
├── constants/                 # Shared constants
├── env/                       # Environment variable validation
└── utils/cn.ts                # className utility
messages/
├── en/                        # English translations
└── vi/                        # Vietnamese translations
```

## Development Conventions

### Internationalization

Translation files live in `messages/{locale}/` and are loaded in
`src/i18n/request.ts`. Use `getTranslations` in Server Components,
`useTranslations` in Client Components, and the helpers in
`src/i18n/navigation.ts` for locale-aware links and redirects.

### Components and Styling

UI components use shadcn/ui with the configuration in `components.json`,
CSS-first Tailwind CSS v4, and Hugeicons. Add a new component with:

```bash
pnpm dlx shadcn add button
```

### PWA and Offline Support

Serwist is integrated in `next.config.ts`. The manifest is available at
`/manifest.webmanifest`, the service worker at `/serwist/sw.js`, and the offline
page at `/[locale]/~offline`. Precache and offline features require a production
build:

```bash
pnpm build
pnpm start
```

### Commits and CI

Husky runs `lint-staged` before commits. Commit messages must follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example:

```text
feat(i18n): add Vietnamese offline page
fix(ui): improve button focus state
```

CI checks commitlint, formatting, linting, type safety, and the Docker build.
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the complete contribution guide.

## License

This is an internal/starter codebase. Add license information if the project is
released publicly.

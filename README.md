# Next 16 Codebase

A modern web application starter built with Next.js App Router, internationalization, a component system, PWA/offline support, and development quality tooling.

## Tech Stack

| Category             | Technology                                                                                   |
| :------------------- | :------------------------------------------------------------------------------------------- |
| Framework            | Next.js 16.3.5 with the App Router, Turbopack, Cache Components, and partial prefetching     |
| UI runtime           | React 19.3.0, React DOM 19.3.0, and the React Compiler                                       |
| Language             | TypeScript 6.0.3 with strict mode                                                            |
| Styling              | Tailwind CSS 4.3, PostCSS, `tw-animate-css`, `clsx`, and `tailwind-merge`                    |
| UI components        | shadcn/ui v4 (base-maia), `@base-ui/react`, and Class Variance Authority                     |
| Forms                | React Hook Form with `@hookform/resolvers`                                                   |
| Icons                | Hugeicons (`@hugeicons/react` and `@hugeicons/core-free-icons`)                              |
| Internationalization | `next-intl` 4.13 with locale-based routing for English (`en`) and Vietnamese (`vi`)          |
| Validation           | Zod 4.4                                                                                      |
| Analytics            | PostHog (`posthog-js`)                                                                       |
| PWA and offline      | Serwist 9.5, a service worker, web app manifest, and a locale-aware offline fallback         |
| Security             | Content Security Policy, CSP reporting endpoint, and standard security response headers      |
| Component workshop   | Storybook 10 with the Next.js + Vite framework, Chromatic, docs, and accessibility add-ons   |
| Testing              | Vitest 4 browser tests through Playwright/Chromium, including Storybook story tests          |
| Code quality         | ESLint 9 (Next.js Core Web Vitals and Storybook rules) and Prettier with Tailwind CSS plugin |
| Git workflow         | Husky, lint-staged, Commitlint, Conventional Commits, and release-please                     |

## Requirements

- Node.js 24, as used in CI
- pnpm 10

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

The application uses Supabase Auth for email/password sign-in, registration, and
password recovery. Supabase configuration is required. Copy `.env.example` to
`.env.local` and fill in its required values. Set `DOPPLER_ENVIRONMENT` and the
server-only `DATABASE_PASSWORD` in the environment used by the Doppler-backed
`pnpm dev` and `pnpm build` scripts.

| Variable                               | Required | Description                                          |
| :------------------------------------- | :------: | :--------------------------------------------------- |
| `DOPPLER_ENVIRONMENT`                  |   Yes    | Doppler environment (`dev` or `prod`)                |
| `NEXT_PUBLIC_APP_NAME`                 |   Yes    | Application name                                     |
| `NEXT_PUBLIC_APP_DEFAULT_TITLE`        |   Yes    | Default page title                                   |
| `NEXT_PUBLIC_APP_TITLE_TEMPLATE`       |   Yes    | Title template; use `%s` for the page title          |
| `NEXT_PUBLIC_APP_DESCRIPTION`          |   Yes    | Application and metadata description                 |
| `DATABASE_PASSWORD`                    |   Yes    | Server-only value required by environment validation |
| `NEXT_PUBLIC_SUPABASE_URL`             |   Yes    | Supabase project URL                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |   Yes    | Supabase publishable key; safe for browser exposure  |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`    |    No    | PostHog token; leave empty to disable analytics      |
| `NEXT_PUBLIC_POSTHOG_HOST`             |    No    | PostHog host, defaults to `https://us.i.posthog.com` |

Environment variables are validated with Zod in `src/env/server.ts` and
`src/env/client.ts`. The Supabase URL and publishable key are required by the
client and server schemas; never use a Supabase secret or `service_role` key in
the `NEXT_PUBLIC_*` variables.

In Supabase Auth, enable the Email provider and add the local and production
callback URL (`/auth/confirm`) to **URL Configuration → Redirect URLs**. The
callback URL sent to Supabase is locale-neutral. `next-intl` selects the locale
from the `NEXT_LOCALE` cookie, then the browser's `Accept-Language` header, and
finally falls back to `en`; it routes the callback to `/{locale}/auth/confirm`.
The app supports Supabase's PKCE `code` callback. If you customize the email
templates to use the `token_hash` callback format, send confirmation links to
`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` and recovery links to
`{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery`. Configure a
production email provider for reliable confirmation and recovery email delivery.

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

CI checks commitlint, formatting, linting, type safety, and the Next.js build.
See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the complete contribution guide.

## License

This is an internal/starter codebase. Add license information if the project is
released publicly.

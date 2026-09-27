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
pnpm dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) or
[http://localhost:3000/vi](http://localhost:3000/vi).

The application uses locale-based routing. The default locale is `en`; supported
locales are defined in `src/i18n/routing.ts`.

## Environment Variables

The application uses Supabase Auth for email/password sign-in, registration, and
password recovery. Local commands use `.env.local`; copy `.env.example` to
`.env.local` and fill in the required values. `pnpm dev` overrides the Supabase
connection values with local values and sets the local app origin.
`pnpm build:dev` and `pnpm build:prod` load `dreamday/dev` and `dreamday/prod`,
respectively, for CI/CD.

The GitHub Actions `dev` and `prod` environments each need a `DOPPLER_TOKEN`
secret. Use read-only Doppler Service Tokens scoped to `dreamday/dev` and
`dreamday/prod`, respectively. CI fetches application variables from Doppler;
GitHub does not store or pass the application's env values to the build.

| Variable                               | Required | Description                                           |
| :------------------------------------- | :------: | :---------------------------------------------------- |
| `DOPPLER_ENVIRONMENT`                  |   Yes    | App mode (`dev` or `prod`); set to `dev` locally      |
| `NEXT_PUBLIC_APP_NAME`                 |   Yes    | Application name                                      |
| `NEXT_PUBLIC_APP_DEFAULT_TITLE`        |   Yes    | Default page title                                    |
| `NEXT_PUBLIC_APP_TITLE_TEMPLATE`       |   Yes    | Title template; use `%s` for the page title           |
| `NEXT_PUBLIC_APP_DESCRIPTION`          |   Yes    | Application and metadata description                  |
| `NEXT_PUBLIC_APP_URL`                  |   Yes    | Canonical application origin for Supabase email links |
| `DATABASE_PASSWORD`                    |   Yes    | Server-only value required by environment validation  |
| `NEXT_PUBLIC_SUPABASE_URL`             |   Yes    | Supabase project URL                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |   Yes    | Supabase publishable key; safe for browser exposure   |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`    |    No    | PostHog token; omit to disable analytics              |
| `NEXT_PUBLIC_POSTHOG_HOST`             |    No    | PostHog host, defaults to `https://us.i.posthog.com`  |

Environment variables are validated with Zod in `src/env/server.ts` and
`src/env/client.ts`. The Supabase URL and publishable key are required by the
client and server schemas; never use a Supabase secret or `service_role` key in
the `NEXT_PUBLIC_*` variables.

`next.config.ts` uses `DOPPLER_ENVIRONMENT` when building security headers. Set
it to `dev` in `.env.local`; CI/CD gets it from the matching Doppler config.

Set `NEXT_PUBLIC_APP_URL` to the canonical origin in `.env.local` and the
respective Doppler config. The `pnpm dev` command overrides it to
`http://localhost:3000` for local Auth email links. Auth email links do not
depend on a request-supplied `Origin` header.

In Supabase Auth, enable the Email provider, set **URL Configuration → Site URL**
to the canonical app origin, and add the local and production callback URL
(`/auth/confirm`) to **Redirect URLs**. The email templates use `{{ .SiteURL }}`
to build the callback link. The callback URL sent to Supabase is locale-neutral.
`next-intl` selects the locale
from the `NEXT_LOCALE` cookie, then the browser's `Accept-Language` header, and
finally falls back to `en`; it routes the callback to `/{locale}/auth/confirm`.

The **Confirm signup** and **Reset password** email templates use direct
`token_hash` links to `/auth/confirm`, with `type=email` and `type=recovery`,
respectively. The callback verifies the token with `verifyOtp` and chooses the
destination from `type`: signup goes to the account page; recovery goes to
`/auth/update-password`. The callback intentionally ignores the templates'
`next` parameter; do not use it to control redirects. Configure a production
email provider for reliable delivery.

## Local Supabase and email testing

The Supabase CLI runs an isolated local stack in Docker. Its local SMTP service
captures Auth emails in Mailpit instead of delivering them. Start the stack and
inspect its local URLs and keys with:

```bash
pnpm supabase:start
pnpm supabase:status
```

Mailpit is available at `http://127.0.0.1:54324`; Supabase Studio is at
`http://127.0.0.1:54323`. `pnpm dev` reads the API URL and Publishable key from
`supabase status --output json` at startup, then injects them into Next.js along
with the local database password (`postgres`). The helper rejects a non-local
Supabase URL and never forwards the Supabase Secret key to the app.

Use `.env.local` for app variables during local development. The local helper
overrides `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `DATABASE_PASSWORD` with local
values. It also removes both PostHog variables before starting Next.js, so they
do not reach the local app process. Set `DOPPLER_ENVIRONMENT=dev` in
`.env.local`. These Supabase variables can remain blank for `pnpm dev`; for
`pnpm build` or `pnpm start`, set the URL and publishable key from
`pnpm supabase:status` in `.env.local`.

Start the Supabase stack first with `pnpm supabase:start`, then launch the app
with `pnpm dev`. The command uses `.env.local` for application settings and
always uses local Supabase values. Email confirmations are enabled in local
Auth so signup and recovery tests can exercise the real flow; generated emails
are captured by Mailpit. The local email and verification request limits are
raised for repeated test runs.

Use `pnpm supabase:reset:local` to reset only the local database and replay
migrations and seed data. This repository does not yet contain application
database migrations, so add versioned migrations and deterministic seed data
before writing E2E cases that depend on app tables.

## Scripts

```bash
pnpm dev                 # Start with local Supabase and env from .env.local
pnpm build:dev           # CI/CD build with Doppler dreamday/dev
pnpm build:prod          # CI/CD build with Doppler dreamday/prod
pnpm start               # Start production build with env from .env.local
pnpm supabase:start      # Start local Supabase and Mailpit
pnpm supabase:status     # Show local Supabase URLs and keys
pnpm supabase:stop       # Stop local Supabase
pnpm supabase:reset:local # Reset only the local Supabase database
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

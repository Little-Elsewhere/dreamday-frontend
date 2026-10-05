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
make setup
pnpm dev
```

Open `http://localhost:<NEXT_PUBLIC_APP_PORT>/en` or
`http://localhost:<NEXT_PUBLIC_APP_PORT>/vi`. The default port is `4000`.

The application uses locale-based routing. The default locale is `en`; supported
locales are defined in `src/i18n/routing.ts`.

## Environment Variables

The application uses Supabase Auth for email/password sign-in, registration, and
password recovery. Run `make setup` to create `.env.local` from Doppler
`dreamday/dev` and override its Supabase values with the local stack's status.
Then `pnpm dev` starts the Docker development stack. Install and authenticate
the Doppler CLI before setup. `pnpm start`, `pnpm build:dev`, and
`pnpm build:prod` continue to load their variables from Doppler.

Set a repository-level GitHub Actions secret named `DOPPLER_TOKEN`. Both build
workflows read this secret directly, so they do not need a GitHub Environment
selection. Use a read-only Doppler Service Token that can read the `dreamday/dev`
and `dreamday/prod` configs used by the workflows. CI fetches application
variables from Doppler; GitHub stores the Doppler access token, not the
application env values passed to the build.

| Variable                               | Required | Description                                                     |
| :------------------------------------- | :------: | :-------------------------------------------------------------- |
| `DOPPLER_ENVIRONMENT`                  |   Yes    | App mode (`dev` or `prod`); set to `dev` locally                |
| `NEXT_PUBLIC_APP_NAME`                 |   Yes    | Application name                                                |
| `NEXT_PUBLIC_APP_DEFAULT_TITLE`        |   Yes    | Default page title                                              |
| `NEXT_PUBLIC_APP_TITLE_TEMPLATE`       |   Yes    | Title template; use `%s` for the page title                     |
| `NEXT_PUBLIC_APP_DESCRIPTION`          |   Yes    | Application and metadata description                            |
| `NEXT_PUBLIC_APP_URL`                  |   Yes    | Canonical application origin for Supabase email links           |
| `NEXT_PUBLIC_APP_PORT`                 |   Yes    | Next.js listener and Docker host/container port; usually `4000` |
| `DATABASE_PASSWORD`                    |   Yes    | Server-only value required by environment validation            |
| `NEXT_PUBLIC_SUPABASE_URL`             |   Yes    | Supabase project URL                                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |   Yes    | Supabase publishable key; safe for browser exposure             |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`    |    No    | PostHog token; omit to disable analytics                        |
| `NEXT_PUBLIC_POSTHOG_HOST`             |    No    | PostHog host, defaults to `https://us.i.posthog.com`            |

Environment variables are validated with Zod in `src/env/server.ts` and
`src/env/client.ts`. The Supabase URL and publishable key are required by the
client and server schemas; never use a Supabase secret or `service_role` key in
the `NEXT_PUBLIC_*` variables.

`pnpm dev` passes `NEXT_PUBLIC_APP_PORT` from the `dreamday/dev` Doppler config
to Docker Compose, which maps the same host and container port and sets the
container's Next.js `PORT`. The default is `4000`. For local development, keep
`NEXT_PUBLIC_APP_URL` in `dreamday/dev` set to the matching origin (for example,
`http://localhost:4100` when the port is `4100`).

`next.config.ts` uses `DOPPLER_ENVIRONMENT` when building security headers.
Set it to `dev` in Doppler `dreamday/dev`; CI/CD gets it from the matching
Doppler config.

Set `NEXT_PUBLIC_APP_URL` to the canonical origin in the respective Doppler
config. Auth email links do not depend on a request-supplied `Origin` header.

In Supabase Auth, enable the Email provider, set **URL Configuration → Site
URL** to the canonical app origin, and allow the app's Auth redirect
destinations.
Registration stores the selected locale in user metadata, which selects the
email subject and body. Signup and password recovery pass a locale-prefixed
confirmation callback; recovery uses the locale of the forgot-password form.
Locale-specific confirmation and recovery source templates live in
`supabase/templates/{en,vi}/`; the template builder combines them into the Go
templates referenced by `supabase/config.toml`. `pnpm supabase:start` and
`make setup` build those files before starting Supabase. Users without locale
metadata receive the English template.

Local Supabase CLI commands run under `dreamday/dev` so the Auth `site_url` in
`supabase/config.toml` can resolve `NEXT_PUBLIC_APP_URL` from Doppler.

The localized **Confirm signup** and **Reset password** templates use direct
`token_hash` links to `/{locale}/auth/confirm`, with `type=email` and
`type=recovery`, respectively. The callback verifies the token with `verifyOtp`
and selects a fixed destination from the verified email type. Configure a
production email provider for reliable delivery.

## Local Supabase

The Supabase CLI runs the configuration in `supabase/config.toml` as a local
stack in Docker. Its local SMTP service captures Auth emails in Mailpit instead
of delivering them. `make setup` adds this mapping to `/etc/hosts` so your
browser resolves the local domains to the machine running Docker:

```text
127.0.0.1 supabase.local mailpit.local
127.0.0.1 studio.supabase.local
```

The Makefile uses `sudo tee` to add missing host mappings and skips entries that
are already present; enter your administrator password if prompted. You can
also run `make local-hosts` by itself. `make setup` creates the shared
`dreamday-local-network`, starts Supabase on it, downloads the `dreamday/dev`
Doppler config, generates `.env.local`, and starts the local-domain proxy. The
generator sets `NEXT_PUBLIC_SUPABASE_URL` to `http://supabase.local` and overrides
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `DATABASE_PASSWORD` with values from
`supabase status -o json`. Other variables come from Doppler, including the
required `NEXT_PUBLIC_APP_PORT`. Running the target again refreshes the file
from the current Doppler config.

```bash
make setup
pnpm dev
pnpm supabase:status
```

If Supabase was started separately with `pnpm supabase:start`, run
`make env-local` and `make local-domains-start` to generate `.env.local` and
start the proxy.

The local-domain proxy listens on `127.0.0.1:80` and routes
`http://supabase.local` to the Supabase API on port `54321`,
`http://studio.supabase.local` to Supabase Studio on port `54323`, and
`http://mailpit.local` to Mailpit on port `54324`. URLs therefore do not need
those service ports. Keep host port `80` free. The `.local` suffix is used by
multicast DNS/Bonjour and can conflict with local network name resolution on
some systems ([RFC 6761](https://www.rfc-editor.org/rfc/rfc6761)). Local Supabase Auth uses
`NEXT_PUBLIC_APP_URL` as its site URL and allows localhost redirect URLs on any
port. The development CSP allows the configured Supabase HTTP and WebSocket
origins; it omits `upgrade-insecure-requests` so the local HTTP endpoint stays
HTTP.

Use `pnpm supabase:reset:local` to reset only the local database and replay
migrations and seed data. This repository does not yet contain application
database migrations; add versioned migrations and deterministic seed data when
the app needs local database tables.

Stop the local Supabase containers when you want to release their resources:

```bash
pnpm supabase:stop
```

## Run the app with Docker

The develop container bind-mounts the project into `/app`, so source edits are
picked up by Next.js. Its `node_modules` and `.next` directories use named
volumes to keep Linux dependencies and the development cache out of the host
checkout.

```bash
make setup
export DOPPLER_TOKEN='YOUR_READ_ONLY_DEV_SERVICE_TOKEN'
pnpm dev
```

`pnpm dev` runs Docker Compose under Doppler. Doppler supplies
`NEXT_PUBLIC_APP_PORT` to Compose interpolation and passes the token through for
the Compose secret. Compose mounts that token as a secret; Doppler CLI loads the
config again when the container starts.
`make setup` generates one `.env.local` file with Doppler values and local
Supabase overrides. Compose reads that file into the dev container; the local
Supabase URL, publishable key, and database password are preserved when Doppler
loads the remaining dev secrets.

The app container and `local-domains` proxy join the `dreamday-local-network`
created by `make setup`; Supabase CLI joins the same network with
`--network-id`. The proxy routes both host and container requests through the
same `http://supabase.local` URL, so no separate server URL is needed. Open
`http://localhost:<NEXT_PUBLIC_APP_PORT>` (default `4000`) for the app and
`http://mailpit.local` for Mailpit. The hosts-file entries above are required
for browser access. After changing dependencies, run:

```bash
doppler run --project dreamday --config dev --no-fallback -- \
  docker compose -f docker/dev/compose.yaml exec app pnpm install --frozen-lockfile
```

The production target uses Next.js standalone output and runs as the unprivileged
`node` user. Set `DOPPLER_TOKEN` to a read-only Service Token for
`dreamday/prod`. The Docker build mounts it as a BuildKit secret and runs
`next build` with values fetched from that config; the running container also
loads its server environment from Doppler.

```bash
export DOPPLER_TOKEN='YOUR_READ_ONLY_PROD_SERVICE_TOKEN'
doppler run --project dreamday --config prod --no-fallback -- \
  docker compose -f docker/prod/compose.yaml up --build -d
```

Next.js embeds `NEXT_PUBLIC_*` values into the browser bundle during the build.
If those values change in Doppler, rebuild the image without cache so Docker
does not reuse a build layer created with the previous config:

```bash
doppler run --project dreamday --config prod --no-fallback -- \
  docker compose -f docker/prod/compose.yaml build --no-cache
doppler run --project dreamday --config prod --no-fallback -- \
  docker compose -f docker/prod/compose.yaml up -d
```

Stop each environment under its matching Doppler config so Compose resolves the
same port used by the application:

```bash
doppler run --project dreamday --config dev --no-fallback -- \
  docker compose -f docker/dev/compose.yaml down
doppler run --project dreamday --config prod --no-fallback -- \
  docker compose -f docker/prod/compose.yaml down
```

## Scripts

```bash
pnpm dev                 # Build and start the Docker development stack
pnpm build:dev           # CI/CD build with Doppler dreamday/dev
pnpm build:prod          # CI/CD build with Doppler dreamday/prod
pnpm start               # Start production build with Doppler dreamday/dev
make setup               # Start local Supabase and generate .env.local
pnpm supabase:templates  # Build generated Auth templates from en/ and vi/
pnpm supabase:start      # Build templates, then start Supabase services
pnpm supabase:status     # Show local Supabase URLs and keys
pnpm supabase:stop       # Stop local Supabase
pnpm supabase:reset:local # Build templates, then reset the local database
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

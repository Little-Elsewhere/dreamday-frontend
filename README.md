# Dreamday frontend

This repository contains a Next.js application and its development and production Docker configuration.

## Getting started

Install dependencies and run the app with Doppler:

```bash
pnpm install
pnpm dev
```

`pnpm dev` loads the `dreamday-frontend/dev` Doppler config and runs on port 4000. Authenticate the Doppler CLI first, either with `doppler login` or a read-only `DOPPLER_TOKEN`. Keep port 4000 in `NEXT_PUBLIC_APP_URL` for local development.

To run the development container, put any local overrides such as `NEXT_PUBLIC_APP_URL` in `.env.local`, export `DOPPLER_TOKEN` in your shell, then run:

```bash
docker compose -f docker/dev/compose.yaml up --build
```

The app uses locale-based routing (`en` and `vi`) configured in `src/i18n/routing.ts`.

## Data integration status

The auth and trip screens remain available with client-side form validation and local editing where supported. Server actions, remote persistence, and authentication callbacks have been removed while API endpoints are pending. Data reads return empty results, and submissions include TODO comments for future API work. Changes are not persisted between page loads. The existing auth and private-trip Playwright cases are retained and skipped.

## Environment

Application settings are loaded through the `dreamday-frontend/dev` or `dreamday-frontend/prod` Doppler config. The frontend validates application settings with Zod in `src/schemas/env.ts`; `DOPPLER_ENVIRONMENT` and `NEXT_DEV_ALLOWED_ORIGINS` are also read by `next.config.ts`.

| Variable                          | Required | Description                                                                          |
| --------------------------------- | :------: | ------------------------------------------------------------------------------------ |
| DOPPLER_ENVIRONMENT               |   Yes    | App mode (`dev` or `prod`); Docker Compose sets this for its environment             |
| NEXT_DEV_ALLOWED_ORIGINS          |    No    | Comma-separated entries passed to Next.js `allowedDevOrigins`; used only in dev mode |
| NEXT_PUBLIC_APP_NAME              |   Yes    | Application name                                                                     |
| NEXT_PUBLIC_APP_DEFAULT_TITLE     |   Yes    | Default page title                                                                   |
| NEXT_PUBLIC_APP_TITLE_TEMPLATE    |   Yes    | Page title template; `%s` is the page title                                          |
| NEXT_PUBLIC_APP_DESCRIPTION       |   Yes    | Application and metadata description                                                 |
| NEXT_PUBLIC_APP_URL               |   Yes    | Canonical application origin                                                         |
| MAINTENANCE_MODE                  |    No    | Enables the maintenance page; defaults to `false`                                    |
| NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN |    No    | Omit to disable analytics                                                            |
| NEXT_PUBLIC_POSTHOG_HOST          |    No    | PostHog host; defaults to `https://us.i.posthog.com`                                 |

`DOPPLER_TOKEN` is the credential used by Doppler CLI for `pnpm dev`, build and start commands, and Docker/CI. Docker Compose passes it as a secret. Provide it through your shell or secret manager; do not commit it to `.env.local`.

## Scripts

```bash
pnpm dev                 # Run Next.js directly on the host
pnpm build:dev           # Build with Doppler dreamday-frontend/dev
pnpm build:prod          # Build with Doppler dreamday-frontend/prod
pnpm start               # Start the standalone build
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript checks
pnpm test:unit           # Run unit tests in Node.js
pnpm test:e2e            # Run skipped Playwright auth cases
pnpm format              # Format the project with Prettier
pnpm format:check        # Check formatting without changing files
pnpm storybook           # Start Storybook
pnpm build-storybook     # Build Storybook
pnpm clean               # Remove .next and node_modules
pnpm commitlint          # Validate commit messages
```

## Project structure

```text
src/
├── app/                  # Locale-based pages and API routes
├── components/           # Shared and UI components
├── features/
│   ├── auth/             # Auth screens and form schemas
│   └── trips/            # Trip screens, local interactions, and domain helpers
├── i18n/                 # Routing, request config, and navigation
├── schemas/              # Zod schemas
├── types/                # Application types
├── env/                  # Environment validation
└── utils/                # Shared helpers
messages/
├── en/
└── vi/
```

## Playwright

The auth and private-trip cases in `e2e/auth` are marked skipped while authentication and test-account setup are pending. The config keeps desktop, tablet, and mobile projects and does not start application services.

## Docker

Development and production Dockerfiles and Compose files are in `docker/`.

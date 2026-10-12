# Dreamday frontend

This repository contains a Next.js application and its development and production Docker configuration.

## Getting started

Install dependencies and run the app with Doppler:

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs on port 4000. Keep that port in `NEXT_PUBLIC_APP_URL` for local development.

To run the development container, provide the values listed in the Environment section in `.env.local`, export `DOPPLER_TOKEN`, then run:

```bash
docker compose -f docker/dev/compose.yaml up --build
```

The app uses locale-based routing (`en` and `vi`) configured in `src/i18n/routing.ts`.

## Data integration status

The auth and trip screens remain available with client-side form validation and local editing where supported. Server actions, remote persistence, and authentication callbacks have been removed while API endpoints are pending. Data reads return empty results, and submissions include TODO comments for future API work. Changes are not persisted between page loads. The existing auth and private-trip Playwright cases are retained and skipped.

## Environment

Application variables are loaded through Doppler. The frontend validates them with Zod in `src/schemas/env.ts`.

| Variable                          | Required | Description                                          |
| --------------------------------- | :------: | ---------------------------------------------------- |
| DOPPLER_ENVIRONMENT               |   Yes    | App mode (`dev` or `prod`)                           |
| NEXT_PUBLIC_APP_NAME              |   Yes    | Application name                                     |
| NEXT_PUBLIC_APP_DEFAULT_TITLE     |   Yes    | Default page title                                   |
| NEXT_PUBLIC_APP_TITLE_TEMPLATE    |   Yes    | Page title template; `%s` is the page title          |
| NEXT_PUBLIC_APP_DESCRIPTION       |   Yes    | Application and metadata description                 |
| NEXT_PUBLIC_APP_URL               |   Yes    | Canonical application origin                         |
| MAINTENANCE_MODE                  |    No    | Enables the maintenance page                         |
| NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN |    No    | Omit to disable analytics                            |
| NEXT_PUBLIC_POSTHOG_HOST          |    No    | PostHog host; defaults to `https://us.i.posthog.com` |

## Scripts

```bash
pnpm dev                 # Run Next.js directly on the host
pnpm build:dev           # Build with Doppler dreamday/dev
pnpm build:prod          # Build with Doppler dreamday/prod
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

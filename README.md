# Dreamday frontend

This repository contains a Next.js application and its development and production Docker configuration.

## Getting started

Create a local environment file from the committed example, then install dependencies and run the app:

```bash
cp .env.example .env
pnpm install
pnpm dev
```

`pnpm dev` loads values from `.env` and runs on port 4000. Keep port 4000 in `NEXT_PUBLIC_APP_URL` for local development. Local `.env` files are ignored by Git; commit changes to `.env.example` only when adding or changing configuration keys.

To run the development container, use the same `.env` file:

```bash
docker compose -f docker/dev/compose.yaml up --build
```

The app uses locale-based routing (`en` and `vi`) configured in `src/i18n/routing.ts`.

## Data integration status

The auth and trip screens remain available with client-side form validation and local editing where supported. Server actions, remote persistence, and authentication callbacks have been removed while API endpoints are pending. Data reads return empty results, and submissions include TODO comments for future API work. Changes are not persisted between page loads. The existing auth and private-trip Playwright cases are retained and skipped.

## Environment

The frontend validates application settings with Zod in `src/schemas/env.ts`. Next.js loads `.env` files automatically. It sets `NODE_ENV` to `development` for `next dev` and `production` for builds and production starts.

| Group                       | Variables                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public application metadata | `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DEFAULT_TITLE`, `NEXT_PUBLIC_APP_TITLE_TEMPLATE`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_APP_URL` |
| Runtime behavior            | `MAINTENANCE_MODE` (defaults to `false`)                                                                                                        |
| Client-side analytics       | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (optional; omit to disable), `NEXT_PUBLIC_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`)            |
| Development server          | `NEXT_DEV_ALLOWED_ORIGINS` (optional comma-separated hostnames)                                                                                 |

All `NEXT_PUBLIC_*` values are included in browser-facing output. Do not place secrets in them. The current frontend configuration contains no server credentials. For production Docker builds, `NEXT_PUBLIC_*` settings are read from the local `.env` file at build time; the same file is passed to the running container. Keep that host file out of Git.

## Scripts

```bash
pnpm dev                 # Run Next.js directly on the host
pnpm build               # Build using the local .env file
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

Most auth and private-trip cases in `e2e/auth` are marked skipped while authentication and test-account setup are pending. The config keeps desktop, tablet, and mobile projects. `webServer` starts `pnpm dev` when no server is already listening on `NEXT_PUBLIC_APP_URL` (required in CI).

## Docker

Development and production Dockerfiles and Compose files are in `docker/`. The production build needs a local `.env` file in this repository because public application settings are compiled into the frontend. Create it from `.env.example`, set the environment-specific public values, and start the production Compose file from this directory:

```bash
cp .env.example .env
docker compose --env-file .env -f docker/prod/compose.yaml up --build
```

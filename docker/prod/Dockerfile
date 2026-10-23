# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies

RUN npm install --global pnpm@12.8.1 && npm cache clean --force
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=dreamday-pnpm-store-prod,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

FROM dependencies AS builder

ENV NODE_ENV=production
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DEFAULT_TITLE
ARG NEXT_PUBLIC_APP_TITLE_TEMPLATE
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
ARG MAINTENANCE_MODE=false
COPY . .
RUN if [ -z "${NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN:-}" ]; then unset NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN; fi \
    && pnpm exec next build

FROM base AS runner

ENV NODE_ENV=production \
    PORT=4000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir -p .next/cache && chown node:node .next/cache

USER node
EXPOSE 4000
CMD ["node", "server.js"]

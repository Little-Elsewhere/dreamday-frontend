# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN wget -T 15 -t 3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
      -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub \
    && echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' \
      >> /etc/apk/repositories \
    && apk add --no-cache doppler

FROM base AS dependencies

RUN npm install --global pnpm@12.8.1 && npm cache clean --force
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=dreamday-pnpm-store-prod,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

FROM dependencies AS builder

ARG NEXT_PUBLIC_APP_PORT=4000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_PORT=${NEXT_PUBLIC_APP_PORT}
COPY . .
RUN --mount=type=secret,id=doppler_token,required=true \
    export DOPPLER_TOKEN="$(cat /run/secrets/doppler_token)" \
    && export DOPPLER_ENVIRONMENT=prod \
    && doppler run --project dreamday --config prod --no-fallback \
      --preserve-env=DOPPLER_ENVIRONMENT,NEXT_PUBLIC_APP_PORT -- \
      env -u DOPPLER_TOKEN pnpm exec next build

FROM base AS runner

ARG NEXT_PUBLIC_APP_PORT=4000

ENV NODE_ENV=production \
    PORT=${NEXT_PUBLIC_APP_PORT} \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --chmod=755 docker/doppler-entrypoint.sh /usr/local/bin/doppler-entrypoint.sh
RUN mkdir -p .next/cache && chown node:node .next/cache

USER node
EXPOSE ${NEXT_PUBLIC_APP_PORT}
ENTRYPOINT ["/usr/local/bin/doppler-entrypoint.sh"]
CMD ["--project", \
  "dreamday", \
  "--config", \
  "prod", \
  "--no-fallback", \
  "--preserve-env=DOPPLER_ENVIRONMENT,NEXT_PUBLIC_APP_PORT,PORT", \
  "--", \
  "env", \
  "-u", \
  "DOPPLER_TOKEN", \
  "node", \
  "server.js"]

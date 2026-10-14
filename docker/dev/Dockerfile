# syntax=docker/dockerfile:1.7

FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development

RUN wget -T 15 -t 3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
      -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub \
    && echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' \
      >> /etc/apk/repositories \
    && apk add --no-cache doppler

RUN npm install --global pnpm@12.8.1 && npm cache clean --force

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=dreamday-pnpm-store-dev,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

COPY --chmod=755 docker/doppler-entrypoint.sh /usr/local/bin/doppler-entrypoint.sh

RUN mkdir -p /app/.next && chown -R node:node /app
USER node

EXPOSE 4000 9229 9230
ENTRYPOINT ["/usr/local/bin/doppler-entrypoint.sh"]
CMD ["--project", \
  "dreamday", \
  "--config", \
  "dev", \
  "--no-fallback", \
  "--preserve-env=DOPPLER_ENVIRONMENT,NEXT_PUBLIC_APP_URL", \
  "--", \
  "env", \
  "-u", \
  "DOPPLER_TOKEN", \
  "pnpm", \
  "exec", \
  "next", \
  "dev", \
  "--hostname", \
  "0.0.0.0", \
  "--inspect=0.0.0.0", \
  "--port", \
  "4000"]

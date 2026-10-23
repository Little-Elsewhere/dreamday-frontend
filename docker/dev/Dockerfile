# syntax=docker/dockerfile:1.7

FROM node:22-alpine

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development

RUN npm install --global pnpm@12.8.1 && npm cache clean --force

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=dreamday-pnpm-store-dev,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

RUN mkdir -p /app/.next && chown -R node:node /app
USER node

EXPOSE 4000 9229 9230
CMD ["pnpm", "exec", "next", "dev", \
  "--hostname", "0.0.0.0", \
  "--inspect=0.0.0.0", \
  "--port", "4000"]

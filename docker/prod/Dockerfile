# ============== Build Stage ==============
FROM node:24-alpine AS builder

RUN npm install -g pnpm@10

WORKDIR /app

# Public env vars required at build time (Next.js + Zod)
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DEFAULT_TITLE
ARG NEXT_PUBLIC_APP_TITLE_TEMPLATE
ARG NEXT_PUBLIC_APP_DESCRIPTION

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_DEFAULT_TITLE=$NEXT_PUBLIC_APP_DEFAULT_TITLE \
    NEXT_PUBLIC_APP_TITLE_TEMPLATE=$NEXT_PUBLIC_APP_TITLE_TEMPLATE \
    NEXT_PUBLIC_APP_DESCRIPTION=$NEXT_PUBLIC_APP_DESCRIPTION \
    NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY messages ./messages

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ============== Production Stage ==============
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]

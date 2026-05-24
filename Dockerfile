# syntax=docker/dockerfile:1.7
#
# One image, many roles. The web app and every worker run from this same image
# with a different CMD set in docker-compose.production.yml. Workers run via
# tsx so we ship the TypeScript source rather than compiling each entrypoint.

############################################
# Base — Node + pnpm + native build deps
############################################
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl curl tini
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app

############################################
# Deps — restore workspace dependencies
# Cached unless any package.json or the lockfile changes.
############################################
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/workers/package.json ./apps/workers/
COPY apps/region-probe/package.json ./apps/region-probe/
COPY packages/ai/package.json ./packages/ai/
COPY packages/billing/package.json ./packages/billing/
COPY packages/checker/package.json ./packages/checker/
COPY packages/db/package.json ./packages/db/
COPY packages/logger/package.json ./packages/logger/
COPY packages/queue/package.json ./packages/queue/
COPY packages/status-pages/package.json ./packages/status-pages/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/types/package.json ./packages/types/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

############################################
# Builder — generate Prisma client, build all packages + Next.js
############################################
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# Copy the full workspace from deps so per-package node_modules
# (apps/*/node_modules, packages/*/node_modules) are preserved —
# pnpm with shamefully-hoist=false keeps binaries like prisma there.
COPY --from=deps /app ./
COPY . .
RUN pnpm --filter @beaconmon/db exec prisma generate
RUN pnpm run build

############################################
# Runner — production image
############################################
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy the entire built workspace. tsx workers need the source tree;
# Next.js needs .next; Prisma client lives in node_modules.
COPY --from=builder /app ./

# Run unprivileged.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000

# tini reaps zombies and forwards SIGTERM cleanly to the Node process,
# which the workers' graceful-shutdown handlers depend on.
ENTRYPOINT ["/sbin/tini", "--"]

# Default for the web service. Each docker-compose service overrides this.
CMD ["pnpm", "run", "start:web"]

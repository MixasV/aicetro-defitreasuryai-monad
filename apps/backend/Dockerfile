FROM node:20-bullseye AS base
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable pnpm

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @defitreasuryai/types build
RUN pnpm --filter defitreasuryai-backend... prisma:generate
RUN pnpm --filter defitreasuryai-backend... build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/scripts ./apps/backend/scripts
COPY --from=builder /app/packages/types ./packages/types

# Install production dependencies FIRST
RUN pnpm install --frozen-lockfile --prod --filter defitreasuryai-backend...

# Copy generated Prisma Client from builder stage
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client ./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma ./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma
RUN chmod +x ./apps/backend/scripts/docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./apps/backend/scripts/docker-entrypoint.sh"]

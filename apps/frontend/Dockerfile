FROM node:20-bullseye AS base
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable pnpm

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @defitreasuryai/types build

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_TRUSTLESS_TREASURY_ADDRESS

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}
ENV NEXT_PUBLIC_TRUSTLESS_TREASURY_ADDRESS=${NEXT_PUBLIC_TRUSTLESS_TREASURY_ADDRESS}

RUN pnpm --filter defitreasuryai-frontend... build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/next.config.mjs ./apps/frontend/next.config.mjs
COPY --from=builder /app/apps/frontend/postcss.config.mjs ./apps/frontend/postcss.config.mjs
COPY --from=builder /app/apps/frontend/tailwind.config.ts ./apps/frontend/tailwind.config.ts
COPY --from=builder /app/apps/frontend/tsconfig.json ./apps/frontend/tsconfig.json
COPY --from=builder /app/packages/types ./packages/types

RUN pnpm install --frozen-lockfile --prod --filter defitreasuryai-frontend...

EXPOSE 3000
CMD ["pnpm", "--filter", "defitreasuryai-frontend", "start"]

#!/bin/sh
set -eo pipefail

cd /app

if [ -f "apps/backend/prisma/schema.prisma" ]; then
  pnpm --filter defitreasuryai-backend prisma:migrate:deploy
fi

exec pnpm --filter defitreasuryai-backend start

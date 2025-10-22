#!/bin/bash
set -e

cd /app

# Migrations already applied during development
# if [ -f "apps/backend/prisma/schema.prisma" ]; then
#   pnpm --filter defitreasuryai-backend prisma:migrate:deploy
# fi

exec pnpm --filter defitreasuryai-backend start

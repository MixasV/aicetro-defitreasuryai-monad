const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { config: loadEnv } = require('dotenv')

const rootEnvPath = path.resolve(__dirname, '../../../.env')
loadEnv({ path: rootEnvPath, override: true })

const prismaEnvPath = path.resolve(__dirname, '../prisma/.env')
loadEnv({ path: prismaEnvPath, override: true })

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('[run-prisma] Не переданы аргументы для Prisma CLI')
  process.exit(1)
}

const prismaBinaryBase = path.resolve(__dirname, '../node_modules/.bin/prisma')
const prismaBinary = process.platform === 'win32' ? `${prismaBinaryBase}.cmd` : prismaBinaryBase

const result = spawnSync(prismaBinary, args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
})

if (result.error) {
  console.error('[run-prisma] Ошибка запуска Prisma CLI', result.error)
  process.exit(1)
}

process.exit(result.status ?? 0)

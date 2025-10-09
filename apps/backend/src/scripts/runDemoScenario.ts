import { demoService } from '../services/demo/demo.service'

async function main () {
  console.log('[demo] Запуск сценария...')
  const result = await demoService.runScenario()
  console.log('[demo] AI execution summary:', JSON.stringify(result.execution, null, 2))
  console.log('[demo] Aggregated summary:', JSON.stringify(result.summary, null, 2))
}

main().catch((error) => {
  console.error('[demo] Ошибка запуска сценария', error)
  process.exitCode = 1
})

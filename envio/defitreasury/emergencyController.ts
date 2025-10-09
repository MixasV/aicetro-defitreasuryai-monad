import { EmergencyController, EmergencyStatus } from '../../generated'

EmergencyController.EmergencyStatusChanged.handler(async ({ event, context }) => {
  const statusEntry: EmergencyStatus = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    paused: event.params.paused,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp
  }

  await context.EmergencyStatus.set(statusEntry)
})

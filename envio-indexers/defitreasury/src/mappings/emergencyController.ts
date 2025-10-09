import { EmergencyController } from '../../generated'
import { EventMeta, getEventId, getTxHash, toBigInt } from '../utils/event'

type EmergencyStatusEntity = {
  id: string
  paused: boolean
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type EmergencyStores = {
  EmergencyStatus: {
    set(entity: EmergencyStatusEntity): void
  }
}

EmergencyController.EmergencyStatusChanged.handler(async ({ event, context }) => {
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as EmergencyStores

  const statusEntry: EmergencyStatusEntity = {
    id: eventId,
    paused: event.params.paused,
    txHash: getTxHash(eventMeta, eventId),
    blockNumber: toBigInt(event.block.number),
    timestamp: toBigInt(event.block.timestamp)
  }

  stores.EmergencyStatus.set(statusEntry)
})

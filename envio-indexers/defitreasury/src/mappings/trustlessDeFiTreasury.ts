import { TrustlessDeFiTreasury } from '../../generated'
import { normalizeAddress } from '../utils/address'
import { EventMeta, getEventId, getTxHash, toBigInt } from '../utils/event'

type DelegationEntity = {
  id: string
  user: string
  aiAgent: string
  dailyLimitUsd: bigint
  spentTodayUsd: bigint
  validUntil: bigint
  active: boolean
  allowedProtocols: string[]
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type SpendRecordedEntity = {
  id: string
  user: string
  protocol: string
  valueUsd: bigint
  spentTodayUsd: bigint
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type TrustlessStores = {
  TrustlessDeFiTreasury_Delegation: {
    get(id: string): Promise<DelegationEntity | undefined>
    set(entity: DelegationEntity): void
  }
  TrustlessDeFiTreasury_SpendRecorded: {
    set(entity: SpendRecordedEntity): void
  }
}

const buildDelegationEntity = (
  id: string,
  user: string,
  aiAgent: string,
  dailyLimitUsd: bigint,
  validUntil: bigint,
  allowedProtocols: readonly string[],
  eventMeta: EventMeta,
  eventId: string
): DelegationEntity => ({
  id,
  user,
  aiAgent,
  dailyLimitUsd,
  spentTodayUsd: 0n,
  validUntil,
  active: true,
  allowedProtocols: Array.from(new Set(allowedProtocols.map(normalizeAddress))),
  txHash: getTxHash(eventMeta, eventId),
  blockNumber: toBigInt(eventMeta.block.number),
  timestamp: toBigInt(eventMeta.block.timestamp)
})

const updateDelegationMeta = (
  entity: DelegationEntity,
  eventMeta: EventMeta,
  eventId: string
) => {
  entity.txHash = getTxHash(eventMeta, eventId)
  entity.blockNumber = toBigInt(eventMeta.block.number)
  entity.timestamp = toBigInt(eventMeta.block.timestamp)
}

TrustlessDeFiTreasury.DelegationGranted.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const aiAgent = normalizeAddress(event.params.aiAgent)
  const id = user
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const delegation = buildDelegationEntity(
    id,
    user,
    aiAgent,
    event.params.dailyLimitUSD,
    event.params.validUntil,
    event.params.protocolWhitelist,
    eventMeta,
    eventId
  )

  stores.TrustlessDeFiTreasury_Delegation.set(delegation)
})

TrustlessDeFiTreasury.DelegationUpdated.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const aiAgent = normalizeAddress(event.params.aiAgent)
  const id = user
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const existing = await stores.TrustlessDeFiTreasury_Delegation.get(id)
  const delegation: DelegationEntity = existing ?? buildDelegationEntity(
    id,
    user,
    aiAgent,
    event.params.dailyLimitUSD,
    event.params.validUntil,
    event.params.protocolWhitelist,
    eventMeta,
    eventId
  )

  delegation.aiAgent = aiAgent
  delegation.dailyLimitUsd = event.params.dailyLimitUSD
  delegation.validUntil = event.params.validUntil
  delegation.allowedProtocols = Array.from(new Set(event.params.protocolWhitelist.map(normalizeAddress)))
  delegation.active = true
  updateDelegationMeta(delegation, eventMeta, eventId)

  stores.TrustlessDeFiTreasury_Delegation.set(delegation)
})

TrustlessDeFiTreasury.DelegationRevoked.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const id = user
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const delegation = await stores.TrustlessDeFiTreasury_Delegation.get(id)
  if (delegation == null) {
    return
  }

  delegation.active = false
  delegation.dailyLimitUsd = 0n
  delegation.validUntil = 0n
  delegation.allowedProtocols = []
  updateDelegationMeta(delegation, eventMeta, eventId)

  stores.TrustlessDeFiTreasury_Delegation.set(delegation)
})

TrustlessDeFiTreasury.DelegationPaused.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const id = user
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const delegation = await stores.TrustlessDeFiTreasury_Delegation.get(id)
  if (delegation == null) {
    return
  }

  delegation.active = false
  updateDelegationMeta(delegation, eventMeta, eventId)

  stores.TrustlessDeFiTreasury_Delegation.set(delegation)
})

TrustlessDeFiTreasury.DelegationResumed.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const id = user
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const delegation = await stores.TrustlessDeFiTreasury_Delegation.get(id)
  if (delegation == null) {
    return
  }

  delegation.active = true
  delegation.validUntil = event.params.validUntil
  updateDelegationMeta(delegation, eventMeta, eventId)

  stores.TrustlessDeFiTreasury_Delegation.set(delegation)
})

TrustlessDeFiTreasury.SpendRecorded.handler(async ({ event, context }) => {
  const user = normalizeAddress(event.params.user)
  const protocol = normalizeAddress(event.params.protocol)
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as TrustlessStores

  const spend: SpendRecordedEntity = {
    id: eventId,
    user,
    protocol,
    valueUsd: event.params.valueUsd,
    spentTodayUsd: event.params.spentToday,
    txHash: getTxHash(eventMeta, eventId),
    blockNumber: toBigInt(event.block.number),
    timestamp: toBigInt(event.block.timestamp)
  }

  stores.TrustlessDeFiTreasury_SpendRecorded.set(spend)

  const delegation = await stores.TrustlessDeFiTreasury_Delegation.get(user)
  if (delegation != null) {
    delegation.spentTodayUsd = event.params.spentToday
    updateDelegationMeta(delegation, eventMeta, eventId)
    stores.TrustlessDeFiTreasury_Delegation.set(delegation)
  }
})

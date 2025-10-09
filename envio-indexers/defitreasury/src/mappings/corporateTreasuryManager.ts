import { CorporateTreasuryManager } from '../../generated'
import { normalizeAddress } from '../utils/address'
import { EventMeta, getEventId, getTxHash, toBigInt } from '../utils/event'

type CorporateAccountEntity = {
  id: string
  smartAccount: string
  owners: string[]
  threshold: bigint
  createdAt: bigint
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type DelegationEntity = {
  id: string
  account: string
  delegate: string
  dailyLimit: bigint
  spent24h: bigint
  active: boolean
  whitelist: string[]
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type DelegationSpendingEntity = {
  id: string
  account: string
  amount: bigint
  newSpent: bigint
  txHash: string
  blockNumber: bigint
  timestamp: bigint
}

type CorporateManagerStores = {
  CorporateAccount: {
    set(entity: CorporateAccountEntity): void
  }
  Delegation: {
    get(id: string): Promise<DelegationEntity | undefined>
    set(entity: DelegationEntity): void
  }
  DelegationSpending: {
    set(entity: DelegationSpendingEntity): void
  }
}

CorporateTreasuryManager.CorporateAccountCreated.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as CorporateManagerStores

  const corporateAccount: CorporateAccountEntity = {
    id: accountId,
    smartAccount: accountId,
    owners: event.params.owners.map(normalizeAddress),
    threshold: event.params.threshold,
    createdAt: toBigInt(event.block.timestamp),
    txHash: getTxHash(eventMeta, eventId),
    blockNumber: toBigInt(event.block.number),
    timestamp: toBigInt(event.block.timestamp)
  }

  stores.CorporateAccount.set(corporateAccount)
})

CorporateTreasuryManager.DelegationUpdated.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)
  const delegateId = normalizeAddress(event.params.delegate)
  const delegationId = accountId
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const stores = context as unknown as CorporateManagerStores

  const existing = await stores.Delegation.get(delegationId)

  const delegation: DelegationEntity = {
    id: delegationId,
    account: accountId,
    delegate: delegateId,
    dailyLimit: event.params.limit,
    spent24h: existing?.spent24h ?? 0n,
    active: event.params.active,
    whitelist: existing?.whitelist ?? [],
    txHash: getTxHash(eventMeta, eventId),
    blockNumber: toBigInt(event.block.number),
    timestamp: toBigInt(event.block.timestamp)
  }

  stores.Delegation.set(delegation)
})

CorporateTreasuryManager.DelegationSpending.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)
  const eventMeta: EventMeta = event
  const eventId = getEventId(eventMeta)
  const txHash = getTxHash(eventMeta, eventId)
  const stores = context as unknown as CorporateManagerStores

  const spendingEntry: DelegationSpendingEntity = {
    id: eventId,
    account: accountId,
    amount: event.params.amount,
    newSpent: event.params.newSpent,
    txHash,
    blockNumber: toBigInt(event.block.number),
    timestamp: toBigInt(event.block.timestamp)
  }

  stores.DelegationSpending.set(spendingEntry)

  const delegationId = accountId
  const currentDelegation = await stores.Delegation.get(delegationId)
  if (currentDelegation) {
    currentDelegation.spent24h = event.params.newSpent
    currentDelegation.txHash = txHash
    currentDelegation.blockNumber = toBigInt(event.block.number)
    currentDelegation.timestamp = toBigInt(event.block.timestamp)
    stores.Delegation.set(currentDelegation)
  }
})

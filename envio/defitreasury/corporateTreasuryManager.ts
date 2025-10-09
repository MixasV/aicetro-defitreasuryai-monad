import { CorporateAccount, CorporateTreasuryManager, Delegation, DelegationSpending } from '../../generated'
import { normalizeAddress } from '../utils/address'

CorporateTreasuryManager.CorporateAccountCreated.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)

  const corporateAccount: CorporateAccount = {
    id: accountId,
    smartAccount: accountId,
    owners: event.params.owners.map(normalizeAddress),
    threshold: event.params.threshold,
    createdAt: event.block.timestamp,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp
  }

  await context.CorporateAccount.set(corporateAccount)
})

CorporateTreasuryManager.DelegationUpdated.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)
  const existing = await context.Delegation.get(accountId)

  const delegation: Delegation = {
    id: accountId,
    account: accountId,
    delegate: normalizeAddress(event.params.delegate),
    dailyLimit: event.params.limit,
    spent24h: existing?.spent24h ?? 0n,
    active: event.params.active,
    whitelist: existing?.whitelist ?? [],
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp
  }

  await context.Delegation.set(delegation)
})

CorporateTreasuryManager.DelegationSpending.handler(async ({ event, context }) => {
  const accountId = normalizeAddress(event.params.account)
  const eventId = `${event.transaction.hash}-${event.logIndex}`

  const spendingEntry: DelegationSpending = {
    id: eventId,
    account: accountId,
    amount: event.params.amount,
    newSpent: event.params.newSpent,
    txHash: event.transaction.hash,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp
  }

  await context.DelegationSpending.set(spendingEntry)

  const currentDelegation = await context.Delegation.get(accountId)
  if (currentDelegation) {
    currentDelegation.spent24h = event.params.newSpent
    currentDelegation.txHash = event.transaction.hash
    currentDelegation.blockNumber = event.block.number
    currentDelegation.timestamp = event.block.timestamp
    await context.Delegation.set(currentDelegation)
  }
})

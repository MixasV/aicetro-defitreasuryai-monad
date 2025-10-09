export type EventMeta = {
  chainId: number
  logIndex: number
  block: {
    number: number
    timestamp: number
    hash: string
  }
  transaction: unknown
}

export const toBigInt = (value: number | bigint): bigint => (typeof value === 'bigint' ? value : BigInt(value))

export const getEventId = (event: EventMeta): string => `${event.chainId}-${event.block.hash}-${event.logIndex}`

export const getTxHash = (event: EventMeta, fallback?: string): string => {
  const tx = event.transaction as { hash?: string | undefined }
  if (typeof tx?.hash === 'string' && tx.hash.length > 0) {
    return tx.hash
  }

  const legacy = (event as unknown as { transactionHash?: string | undefined }).transactionHash
  if (typeof legacy === 'string' && legacy.length > 0) {
    return legacy
  }

  return fallback ?? getEventId(event)
}

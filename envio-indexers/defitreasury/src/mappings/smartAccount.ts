import {
  AITreasurySmartAccount,
} from "../../generated";

AITreasurySmartAccount.DailyLimitUpdated.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    smartAccount: event.srcAddress.toLowerCase(),
    spentToday: event.params.spentToday,
    remainingLimit: event.params.remainingLimit,
    resetTime: event.params.resetTime,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
  };

  context.AITreasurySmartAccount_DailyLimitUpdated.set(entity);

  context.log.info(`[DailyLimit] ${event.srcAddress} spent: $${event.params.spentToday / 1000000n}, remaining: $${event.params.remainingLimit / 1000000n}`);
});

AITreasurySmartAccount.EmergencyRevoke.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    smartAccount: event.srcAddress.toLowerCase(),
    revokedBy: event.params.revokedBy.toLowerCase(),
    reason: event.params.reason,
    revokeTimestamp: event.params.timestamp,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
  };

  context.AITreasurySmartAccount_EmergencyRevoke.set(entity);

  context.log.warn(`[EmergencyRevoke] ${event.srcAddress} revoked by ${event.params.revokedBy}: ${event.params.reason}`);
});

AITreasurySmartAccount.HighRiskAlert.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    smartAccount: event.srcAddress.toLowerCase(),
    protocol: event.params.protocol.toLowerCase(),
    estimatedLossUsd: event.params.estimatedLossUsd,
    alertType: event.params.alertType,
    alertTimestamp: event.params.timestamp,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
  };

  context.AITreasurySmartAccount_HighRiskAlert.set(entity);

  context.log.warn(`[RiskAlert] ${event.srcAddress} - ${event.params.alertType} on ${event.params.protocol}: potential loss $${event.params.estimatedLossUsd / 1000000n}`);
});

AITreasurySmartAccount.DelegationConfigured.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    smartAccount: event.srcAddress.toLowerCase(),
    aiAgent: event.params.aiAgent.toLowerCase(),
    dailyLimitUsd: event.params.dailyLimitUsd,
    validUntil: event.params.validUntil,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
  };

  context.AITreasurySmartAccount_DelegationConfigured.set(entity);

  context.log.info(`[Delegation] ${event.srcAddress} configured for AI ${event.params.aiAgent}, limit: $${event.params.dailyLimitUsd / 1000000n}/day`);
});

/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type AISmartAccountFactory_AccountCreated_t = {
  readonly account: string; 
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly owner: string; 
  readonly salt: bigint; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type AISmartAccountFactory_AccountCreated_indexedFieldOperations = {};

export type AITreasurySmartAccount_DailyLimitUpdated_t = {
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly remainingLimit: bigint; 
  readonly resetTime: bigint; 
  readonly smartAccount: string; 
  readonly spentToday: bigint; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type AITreasurySmartAccount_DailyLimitUpdated_indexedFieldOperations = {};

export type AITreasurySmartAccount_DelegationConfigured_t = {
  readonly aiAgent: string; 
  readonly blockNumber: bigint; 
  readonly dailyLimitUsd: bigint; 
  readonly id: id; 
  readonly smartAccount: string; 
  readonly timestamp: bigint; 
  readonly txHash: string; 
  readonly validUntil: bigint
};

export type AITreasurySmartAccount_DelegationConfigured_indexedFieldOperations = {};

export type AITreasurySmartAccount_EmergencyRevoke_t = {
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly reason: string; 
  readonly revokeTimestamp: bigint; 
  readonly revokedBy: string; 
  readonly smartAccount: string; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type AITreasurySmartAccount_EmergencyRevoke_indexedFieldOperations = {};

export type AITreasurySmartAccount_HighRiskAlert_t = {
  readonly alertTimestamp: bigint; 
  readonly alertType: string; 
  readonly blockNumber: bigint; 
  readonly estimatedLossUsd: bigint; 
  readonly id: id; 
  readonly protocol: string; 
  readonly smartAccount: string; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type AITreasurySmartAccount_HighRiskAlert_indexedFieldOperations = {};

export type EmergencyController_EmergencyStatusChanged_t = {
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly paused: boolean; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type EmergencyController_EmergencyStatusChanged_indexedFieldOperations = {};

export type EntryPoint_UserOperationEvent_t = {
  readonly actualGasCost: bigint; 
  readonly actualGasUsed: bigint; 
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly nonce: bigint; 
  readonly paymaster: string; 
  readonly sender: string; 
  readonly smartAccount: string; 
  readonly source: string; 
  readonly success: boolean; 
  readonly timestamp: bigint; 
  readonly txHash: string; 
  readonly userOpHash: string
};

export type EntryPoint_UserOperationEvent_indexedFieldOperations = {};

export type Pool_t = {
  readonly asset: (undefined | string); 
  readonly assetAddress: (undefined | string); 
  readonly createdAt: bigint; 
  readonly id: id; 
  readonly lastActivityAt: bigint; 
  readonly lastReserveUpdate: (undefined | bigint); 
  readonly poolAddress: string; 
  readonly poolType: string; 
  readonly protocol: string; 
  readonly reserve0: (undefined | bigint); 
  readonly reserve1: (undefined | bigint); 
  readonly token0: (undefined | string); 
  readonly token0Address: (undefined | string); 
  readonly token1: (undefined | string); 
  readonly token1Address: (undefined | string); 
  readonly totalDeposits: bigint; 
  readonly totalSwapVolume: bigint; 
  readonly totalWithdrawals: bigint; 
  readonly transactionCount: number; 
  readonly uniqueUsers: number
};

export type Pool_indexedFieldOperations = {};

export type PoolTransaction_t = {
  readonly amount0: (undefined | bigint); 
  readonly amount1: (undefined | bigint); 
  readonly blockNumber: bigint; 
  readonly gasUsed: (undefined | bigint); 
  readonly id: id; 
  readonly pool_id: id; 
  readonly shares: (undefined | bigint); 
  readonly timestamp: bigint; 
  readonly tokenIn: (undefined | string); 
  readonly tokenOut: (undefined | string); 
  readonly transactionType: string; 
  readonly txHash: string; 
  readonly user: string
};

export type PoolTransaction_indexedFieldOperations = {};

export type TrustlessDeFiTreasury_Delegation_t = {
  readonly active: boolean; 
  readonly aiAgent: string; 
  readonly allowedProtocols: string[]; 
  readonly blockNumber: bigint; 
  readonly dailyLimitUsd: bigint; 
  readonly id: id; 
  readonly spentTodayUsd: bigint; 
  readonly timestamp: bigint; 
  readonly txHash: string; 
  readonly user: string; 
  readonly validUntil: bigint
};

export type TrustlessDeFiTreasury_Delegation_indexedFieldOperations = {};

export type TrustlessDeFiTreasury_SpendRecorded_t = {
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly protocol: string; 
  readonly spentTodayUsd: bigint; 
  readonly timestamp: bigint; 
  readonly txHash: string; 
  readonly user: string; 
  readonly valueUsd: bigint
};

export type TrustlessDeFiTreasury_SpendRecorded_indexedFieldOperations = {};

export type UserPosition_t = {
  readonly depositCount: number; 
  readonly firstDepositAt: bigint; 
  readonly id: id; 
  readonly lastActivityAt: bigint; 
  readonly pool_id: id; 
  readonly shares: bigint; 
  readonly totalDeposited: bigint; 
  readonly totalWithdrawn: bigint; 
  readonly user: string; 
  readonly withdrawCount: number
};

export type UserPosition_indexedFieldOperations = {};

/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type EmergencyController_EmergencyStatusChanged_t = {
  readonly blockNumber: bigint; 
  readonly id: id; 
  readonly paused: boolean; 
  readonly timestamp: bigint; 
  readonly txHash: string
};

export type EmergencyController_EmergencyStatusChanged_indexedFieldOperations = {};

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

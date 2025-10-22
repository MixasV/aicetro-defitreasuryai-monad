/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {AISmartAccountFactory_AccountCreated_event as Types_AISmartAccountFactory_AccountCreated_event} from './Types.gen';

import type {AITreasurySmartAccount_DailyLimitUpdated_event as Types_AITreasurySmartAccount_DailyLimitUpdated_event} from './Types.gen';

import type {AITreasurySmartAccount_DelegationConfigured_event as Types_AITreasurySmartAccount_DelegationConfigured_event} from './Types.gen';

import type {AITreasurySmartAccount_EmergencyRevoke_event as Types_AITreasurySmartAccount_EmergencyRevoke_event} from './Types.gen';

import type {AITreasurySmartAccount_HighRiskAlert_event as Types_AITreasurySmartAccount_HighRiskAlert_event} from './Types.gen';

import type {EmergencyController_EmergencyStatusChanged_event as Types_EmergencyController_EmergencyStatusChanged_event} from './Types.gen';

import type {EntryPoint_UserOperationEvent_event as Types_EntryPoint_UserOperationEvent_event} from './Types.gen';

import type {NablaUSDCPool_Deposit_event as Types_NablaUSDCPool_Deposit_event} from './Types.gen';

import type {NablaUSDCPool_Swap_event as Types_NablaUSDCPool_Swap_event} from './Types.gen';

import type {NablaUSDCPool_Withdraw_event as Types_NablaUSDCPool_Withdraw_event} from './Types.gen';

import type {NablaUSDTPool_Deposit_event as Types_NablaUSDTPool_Deposit_event} from './Types.gen';

import type {NablaUSDTPool_Swap_event as Types_NablaUSDTPool_Swap_event} from './Types.gen';

import type {NablaUSDTPool_Withdraw_event as Types_NablaUSDTPool_Withdraw_event} from './Types.gen';

import type {NablaWBTCPool_Deposit_event as Types_NablaWBTCPool_Deposit_event} from './Types.gen';

import type {NablaWBTCPool_Swap_event as Types_NablaWBTCPool_Swap_event} from './Types.gen';

import type {NablaWBTCPool_Withdraw_event as Types_NablaWBTCPool_Withdraw_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationGranted_event as Types_TrustlessDeFiTreasury_DelegationGranted_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationPaused_event as Types_TrustlessDeFiTreasury_DelegationPaused_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationResumed_event as Types_TrustlessDeFiTreasury_DelegationResumed_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationRevoked_event as Types_TrustlessDeFiTreasury_DelegationRevoked_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationUpdated_event as Types_TrustlessDeFiTreasury_DelegationUpdated_event} from './Types.gen';

import type {TrustlessDeFiTreasury_SpendRecorded_event as Types_TrustlessDeFiTreasury_SpendRecorded_event} from './Types.gen';

import type {UniswapV2Factory_PairCreated_event as Types_UniswapV2Factory_PairCreated_event} from './Types.gen';

import type {UniswapV2Pair_USDC_USDT_Burn_event as Types_UniswapV2Pair_USDC_USDT_Burn_event} from './Types.gen';

import type {UniswapV2Pair_USDC_USDT_Mint_event as Types_UniswapV2Pair_USDC_USDT_Mint_event} from './Types.gen';

import type {UniswapV2Pair_USDC_USDT_Swap_event as Types_UniswapV2Pair_USDC_USDT_Swap_event} from './Types.gen';

import type {UniswapV2Pair_USDC_USDT_Sync_event as Types_UniswapV2Pair_USDC_USDT_Sync_event} from './Types.gen';

import type {UniswapV2Pair_USDC_WMON_Burn_event as Types_UniswapV2Pair_USDC_WMON_Burn_event} from './Types.gen';

import type {UniswapV2Pair_USDC_WMON_Mint_event as Types_UniswapV2Pair_USDC_WMON_Mint_event} from './Types.gen';

import type {UniswapV2Pair_USDC_WMON_Swap_event as Types_UniswapV2Pair_USDC_WMON_Swap_event} from './Types.gen';

import type {UniswapV2Pair_USDC_WMON_Sync_event as Types_UniswapV2Pair_USDC_WMON_Sync_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type AISmartAccountFactory_AccountCreated_createMockArgs = {
  readonly account?: Address_t; 
  readonly owner?: Address_t; 
  readonly salt?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AITreasurySmartAccount_DailyLimitUpdated_createMockArgs = {
  readonly spentToday?: bigint; 
  readonly remainingLimit?: bigint; 
  readonly resetTime?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AITreasurySmartAccount_EmergencyRevoke_createMockArgs = {
  readonly revokedBy?: Address_t; 
  readonly reason?: string; 
  readonly timestamp?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AITreasurySmartAccount_HighRiskAlert_createMockArgs = {
  readonly protocol?: Address_t; 
  readonly estimatedLossUsd?: bigint; 
  readonly alertType?: string; 
  readonly timestamp?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AITreasurySmartAccount_DelegationConfigured_createMockArgs = {
  readonly aiAgent?: Address_t; 
  readonly dailyLimitUsd?: bigint; 
  readonly validUntil?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type EmergencyController_EmergencyStatusChanged_createMockArgs = { readonly paused?: boolean; readonly mockEventData?: EventFunctions_mockEventData };

export type EntryPoint_UserOperationEvent_createMockArgs = {
  readonly userOpHash?: string; 
  readonly sender?: Address_t; 
  readonly paymaster?: Address_t; 
  readonly nonce?: bigint; 
  readonly success?: boolean; 
  readonly actualGasCost?: bigint; 
  readonly actualGasUsed?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDCPool_Deposit_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDCPool_Withdraw_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDCPool_Swap_createMockArgs = {
  readonly sender?: Address_t; 
  readonly tokenIn?: Address_t; 
  readonly tokenOut?: Address_t; 
  readonly amountIn?: bigint; 
  readonly amountOut?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDTPool_Deposit_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDTPool_Withdraw_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaUSDTPool_Swap_createMockArgs = {
  readonly sender?: Address_t; 
  readonly tokenIn?: Address_t; 
  readonly tokenOut?: Address_t; 
  readonly amountIn?: bigint; 
  readonly amountOut?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaWBTCPool_Deposit_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaWBTCPool_Withdraw_createMockArgs = {
  readonly user?: Address_t; 
  readonly assets?: bigint; 
  readonly shares?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type NablaWBTCPool_Swap_createMockArgs = {
  readonly sender?: Address_t; 
  readonly tokenIn?: Address_t; 
  readonly tokenOut?: Address_t; 
  readonly amountIn?: bigint; 
  readonly amountOut?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TrustlessDeFiTreasury_DelegationGranted_createMockArgs = {
  readonly user?: Address_t; 
  readonly aiAgent?: Address_t; 
  readonly dailyLimitUSD?: bigint; 
  readonly validUntil?: bigint; 
  readonly protocolWhitelist?: Address_t[]; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TrustlessDeFiTreasury_DelegationUpdated_createMockArgs = {
  readonly user?: Address_t; 
  readonly aiAgent?: Address_t; 
  readonly dailyLimitUSD?: bigint; 
  readonly validUntil?: bigint; 
  readonly protocolWhitelist?: Address_t[]; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TrustlessDeFiTreasury_DelegationRevoked_createMockArgs = {
  readonly user?: Address_t; 
  readonly aiAgent?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TrustlessDeFiTreasury_DelegationPaused_createMockArgs = { readonly user?: Address_t; readonly mockEventData?: EventFunctions_mockEventData };

export type TrustlessDeFiTreasury_DelegationResumed_createMockArgs = {
  readonly user?: Address_t; 
  readonly validUntil?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TrustlessDeFiTreasury_SpendRecorded_createMockArgs = {
  readonly user?: Address_t; 
  readonly protocol?: Address_t; 
  readonly valueUsd?: bigint; 
  readonly spentToday?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Factory_PairCreated_createMockArgs = {
  readonly token0?: Address_t; 
  readonly token1?: Address_t; 
  readonly pair?: Address_t; 
  readonly _3?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_USDT_Mint_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0?: bigint; 
  readonly amount1?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_USDT_Burn_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0?: bigint; 
  readonly amount1?: bigint; 
  readonly to?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_USDT_Swap_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0In?: bigint; 
  readonly amount1In?: bigint; 
  readonly amount0Out?: bigint; 
  readonly amount1Out?: bigint; 
  readonly to?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_USDT_Sync_createMockArgs = {
  readonly reserve0?: bigint; 
  readonly reserve1?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_WMON_Mint_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0?: bigint; 
  readonly amount1?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_WMON_Burn_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0?: bigint; 
  readonly amount1?: bigint; 
  readonly to?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_WMON_Swap_createMockArgs = {
  readonly sender?: Address_t; 
  readonly amount0In?: bigint; 
  readonly amount1In?: bigint; 
  readonly amount0Out?: bigint; 
  readonly amount1Out?: bigint; 
  readonly to?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type UniswapV2Pair_USDC_WMON_Sync_createMockArgs = {
  readonly reserve0?: bigint; 
  readonly reserve1?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const AISmartAccountFactory_AccountCreated_processEvent: EventFunctions_eventProcessor<Types_AISmartAccountFactory_AccountCreated_event> = TestHelpersJS.AISmartAccountFactory.AccountCreated.processEvent as any;

export const AISmartAccountFactory_AccountCreated_createMockEvent: (args:AISmartAccountFactory_AccountCreated_createMockArgs) => Types_AISmartAccountFactory_AccountCreated_event = TestHelpersJS.AISmartAccountFactory.AccountCreated.createMockEvent as any;

export const AITreasurySmartAccount_DailyLimitUpdated_processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_DailyLimitUpdated_event> = TestHelpersJS.AITreasurySmartAccount.DailyLimitUpdated.processEvent as any;

export const AITreasurySmartAccount_DailyLimitUpdated_createMockEvent: (args:AITreasurySmartAccount_DailyLimitUpdated_createMockArgs) => Types_AITreasurySmartAccount_DailyLimitUpdated_event = TestHelpersJS.AITreasurySmartAccount.DailyLimitUpdated.createMockEvent as any;

export const AITreasurySmartAccount_EmergencyRevoke_processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_EmergencyRevoke_event> = TestHelpersJS.AITreasurySmartAccount.EmergencyRevoke.processEvent as any;

export const AITreasurySmartAccount_EmergencyRevoke_createMockEvent: (args:AITreasurySmartAccount_EmergencyRevoke_createMockArgs) => Types_AITreasurySmartAccount_EmergencyRevoke_event = TestHelpersJS.AITreasurySmartAccount.EmergencyRevoke.createMockEvent as any;

export const AITreasurySmartAccount_HighRiskAlert_processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_HighRiskAlert_event> = TestHelpersJS.AITreasurySmartAccount.HighRiskAlert.processEvent as any;

export const AITreasurySmartAccount_HighRiskAlert_createMockEvent: (args:AITreasurySmartAccount_HighRiskAlert_createMockArgs) => Types_AITreasurySmartAccount_HighRiskAlert_event = TestHelpersJS.AITreasurySmartAccount.HighRiskAlert.createMockEvent as any;

export const AITreasurySmartAccount_DelegationConfigured_processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_DelegationConfigured_event> = TestHelpersJS.AITreasurySmartAccount.DelegationConfigured.processEvent as any;

export const AITreasurySmartAccount_DelegationConfigured_createMockEvent: (args:AITreasurySmartAccount_DelegationConfigured_createMockArgs) => Types_AITreasurySmartAccount_DelegationConfigured_event = TestHelpersJS.AITreasurySmartAccount.DelegationConfigured.createMockEvent as any;

export const EmergencyController_EmergencyStatusChanged_processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event> = TestHelpersJS.EmergencyController.EmergencyStatusChanged.processEvent as any;

export const EmergencyController_EmergencyStatusChanged_createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event = TestHelpersJS.EmergencyController.EmergencyStatusChanged.createMockEvent as any;

export const EntryPoint_UserOperationEvent_processEvent: EventFunctions_eventProcessor<Types_EntryPoint_UserOperationEvent_event> = TestHelpersJS.EntryPoint.UserOperationEvent.processEvent as any;

export const EntryPoint_UserOperationEvent_createMockEvent: (args:EntryPoint_UserOperationEvent_createMockArgs) => Types_EntryPoint_UserOperationEvent_event = TestHelpersJS.EntryPoint.UserOperationEvent.createMockEvent as any;

export const NablaUSDCPool_Deposit_processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Deposit_event> = TestHelpersJS.NablaUSDCPool.Deposit.processEvent as any;

export const NablaUSDCPool_Deposit_createMockEvent: (args:NablaUSDCPool_Deposit_createMockArgs) => Types_NablaUSDCPool_Deposit_event = TestHelpersJS.NablaUSDCPool.Deposit.createMockEvent as any;

export const NablaUSDCPool_Withdraw_processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Withdraw_event> = TestHelpersJS.NablaUSDCPool.Withdraw.processEvent as any;

export const NablaUSDCPool_Withdraw_createMockEvent: (args:NablaUSDCPool_Withdraw_createMockArgs) => Types_NablaUSDCPool_Withdraw_event = TestHelpersJS.NablaUSDCPool.Withdraw.createMockEvent as any;

export const NablaUSDCPool_Swap_processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Swap_event> = TestHelpersJS.NablaUSDCPool.Swap.processEvent as any;

export const NablaUSDCPool_Swap_createMockEvent: (args:NablaUSDCPool_Swap_createMockArgs) => Types_NablaUSDCPool_Swap_event = TestHelpersJS.NablaUSDCPool.Swap.createMockEvent as any;

export const NablaUSDTPool_Deposit_processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Deposit_event> = TestHelpersJS.NablaUSDTPool.Deposit.processEvent as any;

export const NablaUSDTPool_Deposit_createMockEvent: (args:NablaUSDTPool_Deposit_createMockArgs) => Types_NablaUSDTPool_Deposit_event = TestHelpersJS.NablaUSDTPool.Deposit.createMockEvent as any;

export const NablaUSDTPool_Withdraw_processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Withdraw_event> = TestHelpersJS.NablaUSDTPool.Withdraw.processEvent as any;

export const NablaUSDTPool_Withdraw_createMockEvent: (args:NablaUSDTPool_Withdraw_createMockArgs) => Types_NablaUSDTPool_Withdraw_event = TestHelpersJS.NablaUSDTPool.Withdraw.createMockEvent as any;

export const NablaUSDTPool_Swap_processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Swap_event> = TestHelpersJS.NablaUSDTPool.Swap.processEvent as any;

export const NablaUSDTPool_Swap_createMockEvent: (args:NablaUSDTPool_Swap_createMockArgs) => Types_NablaUSDTPool_Swap_event = TestHelpersJS.NablaUSDTPool.Swap.createMockEvent as any;

export const NablaWBTCPool_Deposit_processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Deposit_event> = TestHelpersJS.NablaWBTCPool.Deposit.processEvent as any;

export const NablaWBTCPool_Deposit_createMockEvent: (args:NablaWBTCPool_Deposit_createMockArgs) => Types_NablaWBTCPool_Deposit_event = TestHelpersJS.NablaWBTCPool.Deposit.createMockEvent as any;

export const NablaWBTCPool_Withdraw_processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Withdraw_event> = TestHelpersJS.NablaWBTCPool.Withdraw.processEvent as any;

export const NablaWBTCPool_Withdraw_createMockEvent: (args:NablaWBTCPool_Withdraw_createMockArgs) => Types_NablaWBTCPool_Withdraw_event = TestHelpersJS.NablaWBTCPool.Withdraw.createMockEvent as any;

export const NablaWBTCPool_Swap_processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Swap_event> = TestHelpersJS.NablaWBTCPool.Swap.processEvent as any;

export const NablaWBTCPool_Swap_createMockEvent: (args:NablaWBTCPool_Swap_createMockArgs) => Types_NablaWBTCPool_Swap_event = TestHelpersJS.NablaWBTCPool.Swap.createMockEvent as any;

export const TrustlessDeFiTreasury_DelegationGranted_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationGranted_event> = TestHelpersJS.TrustlessDeFiTreasury.DelegationGranted.processEvent as any;

export const TrustlessDeFiTreasury_DelegationGranted_createMockEvent: (args:TrustlessDeFiTreasury_DelegationGranted_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationGranted_event = TestHelpersJS.TrustlessDeFiTreasury.DelegationGranted.createMockEvent as any;

export const TrustlessDeFiTreasury_DelegationUpdated_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationUpdated_event> = TestHelpersJS.TrustlessDeFiTreasury.DelegationUpdated.processEvent as any;

export const TrustlessDeFiTreasury_DelegationUpdated_createMockEvent: (args:TrustlessDeFiTreasury_DelegationUpdated_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationUpdated_event = TestHelpersJS.TrustlessDeFiTreasury.DelegationUpdated.createMockEvent as any;

export const TrustlessDeFiTreasury_DelegationRevoked_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationRevoked_event> = TestHelpersJS.TrustlessDeFiTreasury.DelegationRevoked.processEvent as any;

export const TrustlessDeFiTreasury_DelegationRevoked_createMockEvent: (args:TrustlessDeFiTreasury_DelegationRevoked_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationRevoked_event = TestHelpersJS.TrustlessDeFiTreasury.DelegationRevoked.createMockEvent as any;

export const TrustlessDeFiTreasury_DelegationPaused_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationPaused_event> = TestHelpersJS.TrustlessDeFiTreasury.DelegationPaused.processEvent as any;

export const TrustlessDeFiTreasury_DelegationPaused_createMockEvent: (args:TrustlessDeFiTreasury_DelegationPaused_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationPaused_event = TestHelpersJS.TrustlessDeFiTreasury.DelegationPaused.createMockEvent as any;

export const TrustlessDeFiTreasury_DelegationResumed_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationResumed_event> = TestHelpersJS.TrustlessDeFiTreasury.DelegationResumed.processEvent as any;

export const TrustlessDeFiTreasury_DelegationResumed_createMockEvent: (args:TrustlessDeFiTreasury_DelegationResumed_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationResumed_event = TestHelpersJS.TrustlessDeFiTreasury.DelegationResumed.createMockEvent as any;

export const TrustlessDeFiTreasury_SpendRecorded_processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_SpendRecorded_event> = TestHelpersJS.TrustlessDeFiTreasury.SpendRecorded.processEvent as any;

export const TrustlessDeFiTreasury_SpendRecorded_createMockEvent: (args:TrustlessDeFiTreasury_SpendRecorded_createMockArgs) => Types_TrustlessDeFiTreasury_SpendRecorded_event = TestHelpersJS.TrustlessDeFiTreasury.SpendRecorded.createMockEvent as any;

export const UniswapV2Factory_PairCreated_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Factory_PairCreated_event> = TestHelpersJS.UniswapV2Factory.PairCreated.processEvent as any;

export const UniswapV2Factory_PairCreated_createMockEvent: (args:UniswapV2Factory_PairCreated_createMockArgs) => Types_UniswapV2Factory_PairCreated_event = TestHelpersJS.UniswapV2Factory.PairCreated.createMockEvent as any;

export const UniswapV2Pair_USDC_USDT_Mint_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Mint_event> = TestHelpersJS.UniswapV2Pair_USDC_USDT.Mint.processEvent as any;

export const UniswapV2Pair_USDC_USDT_Mint_createMockEvent: (args:UniswapV2Pair_USDC_USDT_Mint_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Mint_event = TestHelpersJS.UniswapV2Pair_USDC_USDT.Mint.createMockEvent as any;

export const UniswapV2Pair_USDC_USDT_Burn_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Burn_event> = TestHelpersJS.UniswapV2Pair_USDC_USDT.Burn.processEvent as any;

export const UniswapV2Pair_USDC_USDT_Burn_createMockEvent: (args:UniswapV2Pair_USDC_USDT_Burn_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Burn_event = TestHelpersJS.UniswapV2Pair_USDC_USDT.Burn.createMockEvent as any;

export const UniswapV2Pair_USDC_USDT_Swap_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Swap_event> = TestHelpersJS.UniswapV2Pair_USDC_USDT.Swap.processEvent as any;

export const UniswapV2Pair_USDC_USDT_Swap_createMockEvent: (args:UniswapV2Pair_USDC_USDT_Swap_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Swap_event = TestHelpersJS.UniswapV2Pair_USDC_USDT.Swap.createMockEvent as any;

export const UniswapV2Pair_USDC_USDT_Sync_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Sync_event> = TestHelpersJS.UniswapV2Pair_USDC_USDT.Sync.processEvent as any;

export const UniswapV2Pair_USDC_USDT_Sync_createMockEvent: (args:UniswapV2Pair_USDC_USDT_Sync_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Sync_event = TestHelpersJS.UniswapV2Pair_USDC_USDT.Sync.createMockEvent as any;

export const UniswapV2Pair_USDC_WMON_Mint_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Mint_event> = TestHelpersJS.UniswapV2Pair_USDC_WMON.Mint.processEvent as any;

export const UniswapV2Pair_USDC_WMON_Mint_createMockEvent: (args:UniswapV2Pair_USDC_WMON_Mint_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Mint_event = TestHelpersJS.UniswapV2Pair_USDC_WMON.Mint.createMockEvent as any;

export const UniswapV2Pair_USDC_WMON_Burn_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Burn_event> = TestHelpersJS.UniswapV2Pair_USDC_WMON.Burn.processEvent as any;

export const UniswapV2Pair_USDC_WMON_Burn_createMockEvent: (args:UniswapV2Pair_USDC_WMON_Burn_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Burn_event = TestHelpersJS.UniswapV2Pair_USDC_WMON.Burn.createMockEvent as any;

export const UniswapV2Pair_USDC_WMON_Swap_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Swap_event> = TestHelpersJS.UniswapV2Pair_USDC_WMON.Swap.processEvent as any;

export const UniswapV2Pair_USDC_WMON_Swap_createMockEvent: (args:UniswapV2Pair_USDC_WMON_Swap_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Swap_event = TestHelpersJS.UniswapV2Pair_USDC_WMON.Swap.createMockEvent as any;

export const UniswapV2Pair_USDC_WMON_Sync_processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Sync_event> = TestHelpersJS.UniswapV2Pair_USDC_WMON.Sync.processEvent as any;

export const UniswapV2Pair_USDC_WMON_Sync_createMockEvent: (args:UniswapV2Pair_USDC_WMON_Sync_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Sync_event = TestHelpersJS.UniswapV2Pair_USDC_WMON.Sync.createMockEvent as any;

export const UniswapV2Pair_USDC_WMON: {
  Sync: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Sync_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_WMON_Sync_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Sync_event
  }; 
  Mint: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Mint_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_WMON_Mint_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Mint_event
  }; 
  Burn: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Burn_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_WMON_Burn_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Burn_event
  }; 
  Swap: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_WMON_Swap_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_WMON_Swap_createMockArgs) => Types_UniswapV2Pair_USDC_WMON_Swap_event
  }
} = TestHelpersJS.UniswapV2Pair_USDC_WMON as any;

export const UniswapV2Factory: { PairCreated: { processEvent: EventFunctions_eventProcessor<Types_UniswapV2Factory_PairCreated_event>; createMockEvent: (args:UniswapV2Factory_PairCreated_createMockArgs) => Types_UniswapV2Factory_PairCreated_event } } = TestHelpersJS.UniswapV2Factory as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const AITreasurySmartAccount: {
  DelegationConfigured: {
    processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_DelegationConfigured_event>; 
    createMockEvent: (args:AITreasurySmartAccount_DelegationConfigured_createMockArgs) => Types_AITreasurySmartAccount_DelegationConfigured_event
  }; 
  EmergencyRevoke: {
    processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_EmergencyRevoke_event>; 
    createMockEvent: (args:AITreasurySmartAccount_EmergencyRevoke_createMockArgs) => Types_AITreasurySmartAccount_EmergencyRevoke_event
  }; 
  HighRiskAlert: {
    processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_HighRiskAlert_event>; 
    createMockEvent: (args:AITreasurySmartAccount_HighRiskAlert_createMockArgs) => Types_AITreasurySmartAccount_HighRiskAlert_event
  }; 
  DailyLimitUpdated: {
    processEvent: EventFunctions_eventProcessor<Types_AITreasurySmartAccount_DailyLimitUpdated_event>; 
    createMockEvent: (args:AITreasurySmartAccount_DailyLimitUpdated_createMockArgs) => Types_AITreasurySmartAccount_DailyLimitUpdated_event
  }
} = TestHelpersJS.AITreasurySmartAccount as any;

export const UniswapV2Pair_USDC_USDT: {
  Sync: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Sync_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_USDT_Sync_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Sync_event
  }; 
  Mint: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Mint_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_USDT_Mint_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Mint_event
  }; 
  Burn: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Burn_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_USDT_Burn_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Burn_event
  }; 
  Swap: {
    processEvent: EventFunctions_eventProcessor<Types_UniswapV2Pair_USDC_USDT_Swap_event>; 
    createMockEvent: (args:UniswapV2Pair_USDC_USDT_Swap_createMockArgs) => Types_UniswapV2Pair_USDC_USDT_Swap_event
  }
} = TestHelpersJS.UniswapV2Pair_USDC_USDT as any;

export const EntryPoint: { UserOperationEvent: { processEvent: EventFunctions_eventProcessor<Types_EntryPoint_UserOperationEvent_event>; createMockEvent: (args:EntryPoint_UserOperationEvent_createMockArgs) => Types_EntryPoint_UserOperationEvent_event } } = TestHelpersJS.EntryPoint as any;

export const TrustlessDeFiTreasury: {
  DelegationGranted: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationGranted_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_DelegationGranted_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationGranted_event
  }; 
  DelegationResumed: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationResumed_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_DelegationResumed_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationResumed_event
  }; 
  SpendRecorded: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_SpendRecorded_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_SpendRecorded_createMockArgs) => Types_TrustlessDeFiTreasury_SpendRecorded_event
  }; 
  DelegationRevoked: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationRevoked_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_DelegationRevoked_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationRevoked_event
  }; 
  DelegationUpdated: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationUpdated_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_DelegationUpdated_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationUpdated_event
  }; 
  DelegationPaused: {
    processEvent: EventFunctions_eventProcessor<Types_TrustlessDeFiTreasury_DelegationPaused_event>; 
    createMockEvent: (args:TrustlessDeFiTreasury_DelegationPaused_createMockArgs) => Types_TrustlessDeFiTreasury_DelegationPaused_event
  }
} = TestHelpersJS.TrustlessDeFiTreasury as any;

export const NablaWBTCPool: {
  Deposit: {
    processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Deposit_event>; 
    createMockEvent: (args:NablaWBTCPool_Deposit_createMockArgs) => Types_NablaWBTCPool_Deposit_event
  }; 
  Withdraw: {
    processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Withdraw_event>; 
    createMockEvent: (args:NablaWBTCPool_Withdraw_createMockArgs) => Types_NablaWBTCPool_Withdraw_event
  }; 
  Swap: {
    processEvent: EventFunctions_eventProcessor<Types_NablaWBTCPool_Swap_event>; 
    createMockEvent: (args:NablaWBTCPool_Swap_createMockArgs) => Types_NablaWBTCPool_Swap_event
  }
} = TestHelpersJS.NablaWBTCPool as any;

export const EmergencyController: { EmergencyStatusChanged: { processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event>; createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event } } = TestHelpersJS.EmergencyController as any;

export const NablaUSDCPool: {
  Deposit: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Deposit_event>; 
    createMockEvent: (args:NablaUSDCPool_Deposit_createMockArgs) => Types_NablaUSDCPool_Deposit_event
  }; 
  Withdraw: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Withdraw_event>; 
    createMockEvent: (args:NablaUSDCPool_Withdraw_createMockArgs) => Types_NablaUSDCPool_Withdraw_event
  }; 
  Swap: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDCPool_Swap_event>; 
    createMockEvent: (args:NablaUSDCPool_Swap_createMockArgs) => Types_NablaUSDCPool_Swap_event
  }
} = TestHelpersJS.NablaUSDCPool as any;

export const NablaUSDTPool: {
  Deposit: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Deposit_event>; 
    createMockEvent: (args:NablaUSDTPool_Deposit_createMockArgs) => Types_NablaUSDTPool_Deposit_event
  }; 
  Withdraw: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Withdraw_event>; 
    createMockEvent: (args:NablaUSDTPool_Withdraw_createMockArgs) => Types_NablaUSDTPool_Withdraw_event
  }; 
  Swap: {
    processEvent: EventFunctions_eventProcessor<Types_NablaUSDTPool_Swap_event>; 
    createMockEvent: (args:NablaUSDTPool_Swap_createMockArgs) => Types_NablaUSDTPool_Swap_event
  }
} = TestHelpersJS.NablaUSDTPool as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;

export const AISmartAccountFactory: { AccountCreated: { processEvent: EventFunctions_eventProcessor<Types_AISmartAccountFactory_AccountCreated_event>; createMockEvent: (args:AISmartAccountFactory_AccountCreated_createMockArgs) => Types_AISmartAccountFactory_AccountCreated_event } } = TestHelpersJS.AISmartAccountFactory as any;

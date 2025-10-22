/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {AISmartAccountFactory_AccountCreated_t as Entities_AISmartAccountFactory_AccountCreated_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_DailyLimitUpdated_t as Entities_AITreasurySmartAccount_DailyLimitUpdated_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_DelegationConfigured_t as Entities_AITreasurySmartAccount_DelegationConfigured_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_EmergencyRevoke_t as Entities_AITreasurySmartAccount_EmergencyRevoke_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_HighRiskAlert_t as Entities_AITreasurySmartAccount_HighRiskAlert_t} from '../src/db/Entities.gen';

import type {EmergencyController_EmergencyStatusChanged_t as Entities_EmergencyController_EmergencyStatusChanged_t} from '../src/db/Entities.gen';

import type {EntryPoint_UserOperationEvent_t as Entities_EntryPoint_UserOperationEvent_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {PoolTransaction_t as Entities_PoolTransaction_t} from '../src/db/Entities.gen';

import type {Pool_t as Entities_Pool_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {TrustlessDeFiTreasury_Delegation_t as Entities_TrustlessDeFiTreasury_Delegation_t} from '../src/db/Entities.gen';

import type {TrustlessDeFiTreasury_SpendRecorded_t as Entities_TrustlessDeFiTreasury_SpendRecorded_t} from '../src/db/Entities.gen';

import type {UserPosition_t as Entities_UserPosition_t} from '../src/db/Entities.gen';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {noEventFilters as Internal_noEventFilters} from 'envio/src/Internal.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = {
  readonly log: Envio_logger; 
  readonly addAISmartAccountFactory: (_1:Address_t) => void; 
  readonly addAITreasurySmartAccount: (_1:Address_t) => void; 
  readonly addEmergencyController: (_1:Address_t) => void; 
  readonly addEntryPoint: (_1:Address_t) => void; 
  readonly addNablaUSDCPool: (_1:Address_t) => void; 
  readonly addNablaUSDTPool: (_1:Address_t) => void; 
  readonly addNablaWBTCPool: (_1:Address_t) => void; 
  readonly addTrustlessDeFiTreasury: (_1:Address_t) => void; 
  readonly addUniswapV2Factory: (_1:Address_t) => void; 
  readonly addUniswapV2Pair_USDC_USDT: (_1:Address_t) => void; 
  readonly addUniswapV2Pair_USDC_WMON: (_1:Address_t) => void
};

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type aISmartAccountFactory_AccountCreated = Entities_AISmartAccountFactory_AccountCreated_t;
export type AISmartAccountFactory_AccountCreated = aISmartAccountFactory_AccountCreated;

export type aITreasurySmartAccount_DailyLimitUpdated = Entities_AITreasurySmartAccount_DailyLimitUpdated_t;
export type AITreasurySmartAccount_DailyLimitUpdated = aITreasurySmartAccount_DailyLimitUpdated;

export type aITreasurySmartAccount_DelegationConfigured = Entities_AITreasurySmartAccount_DelegationConfigured_t;
export type AITreasurySmartAccount_DelegationConfigured = aITreasurySmartAccount_DelegationConfigured;

export type aITreasurySmartAccount_EmergencyRevoke = Entities_AITreasurySmartAccount_EmergencyRevoke_t;
export type AITreasurySmartAccount_EmergencyRevoke = aITreasurySmartAccount_EmergencyRevoke;

export type aITreasurySmartAccount_HighRiskAlert = Entities_AITreasurySmartAccount_HighRiskAlert_t;
export type AITreasurySmartAccount_HighRiskAlert = aITreasurySmartAccount_HighRiskAlert;

export type emergencyController_EmergencyStatusChanged = Entities_EmergencyController_EmergencyStatusChanged_t;
export type EmergencyController_EmergencyStatusChanged = emergencyController_EmergencyStatusChanged;

export type entryPoint_UserOperationEvent = Entities_EntryPoint_UserOperationEvent_t;
export type EntryPoint_UserOperationEvent = entryPoint_UserOperationEvent;

export type pool = Entities_Pool_t;
export type Pool = pool;

export type poolTransaction = Entities_PoolTransaction_t;
export type PoolTransaction = poolTransaction;

export type trustlessDeFiTreasury_Delegation = Entities_TrustlessDeFiTreasury_Delegation_t;
export type TrustlessDeFiTreasury_Delegation = trustlessDeFiTreasury_Delegation;

export type trustlessDeFiTreasury_SpendRecorded = Entities_TrustlessDeFiTreasury_SpendRecorded_t;
export type TrustlessDeFiTreasury_SpendRecorded = trustlessDeFiTreasury_SpendRecorded;

export type userPosition = Entities_UserPosition_t;
export type UserPosition = userPosition;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type AISmartAccountFactory_chainId = 10143;

export type AISmartAccountFactory_AccountCreated_eventArgs = {
  readonly account: Address_t; 
  readonly owner: Address_t; 
  readonly salt: bigint
};

export type AISmartAccountFactory_AccountCreated_block = Block_t;

export type AISmartAccountFactory_AccountCreated_transaction = Transaction_t;

export type AISmartAccountFactory_AccountCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AISmartAccountFactory_AccountCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AISmartAccountFactory_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AISmartAccountFactory_AccountCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AISmartAccountFactory_AccountCreated_block
};

export type AISmartAccountFactory_AccountCreated_loaderArgs = Internal_genericLoaderArgs<AISmartAccountFactory_AccountCreated_event,loaderContext>;

export type AISmartAccountFactory_AccountCreated_loader<loaderReturn> = Internal_genericLoader<AISmartAccountFactory_AccountCreated_loaderArgs,loaderReturn>;

export type AISmartAccountFactory_AccountCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AISmartAccountFactory_AccountCreated_event,handlerContext,loaderReturn>;

export type AISmartAccountFactory_AccountCreated_handler<loaderReturn> = Internal_genericHandler<AISmartAccountFactory_AccountCreated_handlerArgs<loaderReturn>>;

export type AISmartAccountFactory_AccountCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AISmartAccountFactory_AccountCreated_event,contractRegistrations>>;

export type AISmartAccountFactory_AccountCreated_eventFilter = { readonly account?: SingleOrMultiple_t<Address_t>; readonly owner?: SingleOrMultiple_t<Address_t> };

export type AISmartAccountFactory_AccountCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AISmartAccountFactory_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AISmartAccountFactory_AccountCreated_eventFiltersDefinition = 
    AISmartAccountFactory_AccountCreated_eventFilter
  | AISmartAccountFactory_AccountCreated_eventFilter[];

export type AISmartAccountFactory_AccountCreated_eventFilters = 
    AISmartAccountFactory_AccountCreated_eventFilter
  | AISmartAccountFactory_AccountCreated_eventFilter[]
  | ((_1:AISmartAccountFactory_AccountCreated_eventFiltersArgs) => AISmartAccountFactory_AccountCreated_eventFiltersDefinition);

export type AITreasurySmartAccount_chainId = 10143;

export type AITreasurySmartAccount_DailyLimitUpdated_eventArgs = {
  readonly spentToday: bigint; 
  readonly remainingLimit: bigint; 
  readonly resetTime: bigint
};

export type AITreasurySmartAccount_DailyLimitUpdated_block = Block_t;

export type AITreasurySmartAccount_DailyLimitUpdated_transaction = Transaction_t;

export type AITreasurySmartAccount_DailyLimitUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AITreasurySmartAccount_DailyLimitUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AITreasurySmartAccount_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AITreasurySmartAccount_DailyLimitUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AITreasurySmartAccount_DailyLimitUpdated_block
};

export type AITreasurySmartAccount_DailyLimitUpdated_loaderArgs = Internal_genericLoaderArgs<AITreasurySmartAccount_DailyLimitUpdated_event,loaderContext>;

export type AITreasurySmartAccount_DailyLimitUpdated_loader<loaderReturn> = Internal_genericLoader<AITreasurySmartAccount_DailyLimitUpdated_loaderArgs,loaderReturn>;

export type AITreasurySmartAccount_DailyLimitUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AITreasurySmartAccount_DailyLimitUpdated_event,handlerContext,loaderReturn>;

export type AITreasurySmartAccount_DailyLimitUpdated_handler<loaderReturn> = Internal_genericHandler<AITreasurySmartAccount_DailyLimitUpdated_handlerArgs<loaderReturn>>;

export type AITreasurySmartAccount_DailyLimitUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AITreasurySmartAccount_DailyLimitUpdated_event,contractRegistrations>>;

export type AITreasurySmartAccount_DailyLimitUpdated_eventFilter = {};

export type AITreasurySmartAccount_DailyLimitUpdated_eventFilters = Internal_noEventFilters;

export type AITreasurySmartAccount_EmergencyRevoke_eventArgs = {
  readonly revokedBy: Address_t; 
  readonly reason: string; 
  readonly timestamp: bigint
};

export type AITreasurySmartAccount_EmergencyRevoke_block = Block_t;

export type AITreasurySmartAccount_EmergencyRevoke_transaction = Transaction_t;

export type AITreasurySmartAccount_EmergencyRevoke_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AITreasurySmartAccount_EmergencyRevoke_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AITreasurySmartAccount_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AITreasurySmartAccount_EmergencyRevoke_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AITreasurySmartAccount_EmergencyRevoke_block
};

export type AITreasurySmartAccount_EmergencyRevoke_loaderArgs = Internal_genericLoaderArgs<AITreasurySmartAccount_EmergencyRevoke_event,loaderContext>;

export type AITreasurySmartAccount_EmergencyRevoke_loader<loaderReturn> = Internal_genericLoader<AITreasurySmartAccount_EmergencyRevoke_loaderArgs,loaderReturn>;

export type AITreasurySmartAccount_EmergencyRevoke_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AITreasurySmartAccount_EmergencyRevoke_event,handlerContext,loaderReturn>;

export type AITreasurySmartAccount_EmergencyRevoke_handler<loaderReturn> = Internal_genericHandler<AITreasurySmartAccount_EmergencyRevoke_handlerArgs<loaderReturn>>;

export type AITreasurySmartAccount_EmergencyRevoke_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AITreasurySmartAccount_EmergencyRevoke_event,contractRegistrations>>;

export type AITreasurySmartAccount_EmergencyRevoke_eventFilter = { readonly revokedBy?: SingleOrMultiple_t<Address_t> };

export type AITreasurySmartAccount_EmergencyRevoke_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AITreasurySmartAccount_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AITreasurySmartAccount_EmergencyRevoke_eventFiltersDefinition = 
    AITreasurySmartAccount_EmergencyRevoke_eventFilter
  | AITreasurySmartAccount_EmergencyRevoke_eventFilter[];

export type AITreasurySmartAccount_EmergencyRevoke_eventFilters = 
    AITreasurySmartAccount_EmergencyRevoke_eventFilter
  | AITreasurySmartAccount_EmergencyRevoke_eventFilter[]
  | ((_1:AITreasurySmartAccount_EmergencyRevoke_eventFiltersArgs) => AITreasurySmartAccount_EmergencyRevoke_eventFiltersDefinition);

export type AITreasurySmartAccount_HighRiskAlert_eventArgs = {
  readonly protocol: Address_t; 
  readonly estimatedLossUsd: bigint; 
  readonly alertType: string; 
  readonly timestamp: bigint
};

export type AITreasurySmartAccount_HighRiskAlert_block = Block_t;

export type AITreasurySmartAccount_HighRiskAlert_transaction = Transaction_t;

export type AITreasurySmartAccount_HighRiskAlert_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AITreasurySmartAccount_HighRiskAlert_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AITreasurySmartAccount_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AITreasurySmartAccount_HighRiskAlert_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AITreasurySmartAccount_HighRiskAlert_block
};

export type AITreasurySmartAccount_HighRiskAlert_loaderArgs = Internal_genericLoaderArgs<AITreasurySmartAccount_HighRiskAlert_event,loaderContext>;

export type AITreasurySmartAccount_HighRiskAlert_loader<loaderReturn> = Internal_genericLoader<AITreasurySmartAccount_HighRiskAlert_loaderArgs,loaderReturn>;

export type AITreasurySmartAccount_HighRiskAlert_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AITreasurySmartAccount_HighRiskAlert_event,handlerContext,loaderReturn>;

export type AITreasurySmartAccount_HighRiskAlert_handler<loaderReturn> = Internal_genericHandler<AITreasurySmartAccount_HighRiskAlert_handlerArgs<loaderReturn>>;

export type AITreasurySmartAccount_HighRiskAlert_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AITreasurySmartAccount_HighRiskAlert_event,contractRegistrations>>;

export type AITreasurySmartAccount_HighRiskAlert_eventFilter = { readonly protocol?: SingleOrMultiple_t<Address_t> };

export type AITreasurySmartAccount_HighRiskAlert_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AITreasurySmartAccount_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AITreasurySmartAccount_HighRiskAlert_eventFiltersDefinition = 
    AITreasurySmartAccount_HighRiskAlert_eventFilter
  | AITreasurySmartAccount_HighRiskAlert_eventFilter[];

export type AITreasurySmartAccount_HighRiskAlert_eventFilters = 
    AITreasurySmartAccount_HighRiskAlert_eventFilter
  | AITreasurySmartAccount_HighRiskAlert_eventFilter[]
  | ((_1:AITreasurySmartAccount_HighRiskAlert_eventFiltersArgs) => AITreasurySmartAccount_HighRiskAlert_eventFiltersDefinition);

export type AITreasurySmartAccount_DelegationConfigured_eventArgs = {
  readonly aiAgent: Address_t; 
  readonly dailyLimitUsd: bigint; 
  readonly validUntil: bigint
};

export type AITreasurySmartAccount_DelegationConfigured_block = Block_t;

export type AITreasurySmartAccount_DelegationConfigured_transaction = Transaction_t;

export type AITreasurySmartAccount_DelegationConfigured_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AITreasurySmartAccount_DelegationConfigured_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AITreasurySmartAccount_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AITreasurySmartAccount_DelegationConfigured_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AITreasurySmartAccount_DelegationConfigured_block
};

export type AITreasurySmartAccount_DelegationConfigured_loaderArgs = Internal_genericLoaderArgs<AITreasurySmartAccount_DelegationConfigured_event,loaderContext>;

export type AITreasurySmartAccount_DelegationConfigured_loader<loaderReturn> = Internal_genericLoader<AITreasurySmartAccount_DelegationConfigured_loaderArgs,loaderReturn>;

export type AITreasurySmartAccount_DelegationConfigured_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AITreasurySmartAccount_DelegationConfigured_event,handlerContext,loaderReturn>;

export type AITreasurySmartAccount_DelegationConfigured_handler<loaderReturn> = Internal_genericHandler<AITreasurySmartAccount_DelegationConfigured_handlerArgs<loaderReturn>>;

export type AITreasurySmartAccount_DelegationConfigured_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AITreasurySmartAccount_DelegationConfigured_event,contractRegistrations>>;

export type AITreasurySmartAccount_DelegationConfigured_eventFilter = { readonly aiAgent?: SingleOrMultiple_t<Address_t> };

export type AITreasurySmartAccount_DelegationConfigured_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AITreasurySmartAccount_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AITreasurySmartAccount_DelegationConfigured_eventFiltersDefinition = 
    AITreasurySmartAccount_DelegationConfigured_eventFilter
  | AITreasurySmartAccount_DelegationConfigured_eventFilter[];

export type AITreasurySmartAccount_DelegationConfigured_eventFilters = 
    AITreasurySmartAccount_DelegationConfigured_eventFilter
  | AITreasurySmartAccount_DelegationConfigured_eventFilter[]
  | ((_1:AITreasurySmartAccount_DelegationConfigured_eventFiltersArgs) => AITreasurySmartAccount_DelegationConfigured_eventFiltersDefinition);

export type EmergencyController_chainId = 10143;

export type EmergencyController_EmergencyStatusChanged_eventArgs = { readonly paused: boolean };

export type EmergencyController_EmergencyStatusChanged_block = Block_t;

export type EmergencyController_EmergencyStatusChanged_transaction = Transaction_t;

export type EmergencyController_EmergencyStatusChanged_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: EmergencyController_EmergencyStatusChanged_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: EmergencyController_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: EmergencyController_EmergencyStatusChanged_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: EmergencyController_EmergencyStatusChanged_block
};

export type EmergencyController_EmergencyStatusChanged_loaderArgs = Internal_genericLoaderArgs<EmergencyController_EmergencyStatusChanged_event,loaderContext>;

export type EmergencyController_EmergencyStatusChanged_loader<loaderReturn> = Internal_genericLoader<EmergencyController_EmergencyStatusChanged_loaderArgs,loaderReturn>;

export type EmergencyController_EmergencyStatusChanged_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<EmergencyController_EmergencyStatusChanged_event,handlerContext,loaderReturn>;

export type EmergencyController_EmergencyStatusChanged_handler<loaderReturn> = Internal_genericHandler<EmergencyController_EmergencyStatusChanged_handlerArgs<loaderReturn>>;

export type EmergencyController_EmergencyStatusChanged_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<EmergencyController_EmergencyStatusChanged_event,contractRegistrations>>;

export type EmergencyController_EmergencyStatusChanged_eventFilter = {};

export type EmergencyController_EmergencyStatusChanged_eventFilters = Internal_noEventFilters;

export type EntryPoint_chainId = 10143;

export type EntryPoint_UserOperationEvent_eventArgs = {
  readonly userOpHash: string; 
  readonly sender: Address_t; 
  readonly paymaster: Address_t; 
  readonly nonce: bigint; 
  readonly success: boolean; 
  readonly actualGasCost: bigint; 
  readonly actualGasUsed: bigint
};

export type EntryPoint_UserOperationEvent_block = Block_t;

export type EntryPoint_UserOperationEvent_transaction = Transaction_t;

export type EntryPoint_UserOperationEvent_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: EntryPoint_UserOperationEvent_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: EntryPoint_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: EntryPoint_UserOperationEvent_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: EntryPoint_UserOperationEvent_block
};

export type EntryPoint_UserOperationEvent_loaderArgs = Internal_genericLoaderArgs<EntryPoint_UserOperationEvent_event,loaderContext>;

export type EntryPoint_UserOperationEvent_loader<loaderReturn> = Internal_genericLoader<EntryPoint_UserOperationEvent_loaderArgs,loaderReturn>;

export type EntryPoint_UserOperationEvent_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<EntryPoint_UserOperationEvent_event,handlerContext,loaderReturn>;

export type EntryPoint_UserOperationEvent_handler<loaderReturn> = Internal_genericHandler<EntryPoint_UserOperationEvent_handlerArgs<loaderReturn>>;

export type EntryPoint_UserOperationEvent_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<EntryPoint_UserOperationEvent_event,contractRegistrations>>;

export type EntryPoint_UserOperationEvent_eventFilter = {
  readonly userOpHash?: SingleOrMultiple_t<string>; 
  readonly sender?: SingleOrMultiple_t<Address_t>; 
  readonly paymaster?: SingleOrMultiple_t<Address_t>
};

export type EntryPoint_UserOperationEvent_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: EntryPoint_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type EntryPoint_UserOperationEvent_eventFiltersDefinition = 
    EntryPoint_UserOperationEvent_eventFilter
  | EntryPoint_UserOperationEvent_eventFilter[];

export type EntryPoint_UserOperationEvent_eventFilters = 
    EntryPoint_UserOperationEvent_eventFilter
  | EntryPoint_UserOperationEvent_eventFilter[]
  | ((_1:EntryPoint_UserOperationEvent_eventFiltersArgs) => EntryPoint_UserOperationEvent_eventFiltersDefinition);

export type NablaUSDCPool_chainId = 10143;

export type NablaUSDCPool_Deposit_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaUSDCPool_Deposit_block = Block_t;

export type NablaUSDCPool_Deposit_transaction = Transaction_t;

export type NablaUSDCPool_Deposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDCPool_Deposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDCPool_Deposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDCPool_Deposit_block
};

export type NablaUSDCPool_Deposit_loaderArgs = Internal_genericLoaderArgs<NablaUSDCPool_Deposit_event,loaderContext>;

export type NablaUSDCPool_Deposit_loader<loaderReturn> = Internal_genericLoader<NablaUSDCPool_Deposit_loaderArgs,loaderReturn>;

export type NablaUSDCPool_Deposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDCPool_Deposit_event,handlerContext,loaderReturn>;

export type NablaUSDCPool_Deposit_handler<loaderReturn> = Internal_genericHandler<NablaUSDCPool_Deposit_handlerArgs<loaderReturn>>;

export type NablaUSDCPool_Deposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDCPool_Deposit_event,contractRegistrations>>;

export type NablaUSDCPool_Deposit_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaUSDCPool_Deposit_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDCPool_Deposit_eventFiltersDefinition = 
    NablaUSDCPool_Deposit_eventFilter
  | NablaUSDCPool_Deposit_eventFilter[];

export type NablaUSDCPool_Deposit_eventFilters = 
    NablaUSDCPool_Deposit_eventFilter
  | NablaUSDCPool_Deposit_eventFilter[]
  | ((_1:NablaUSDCPool_Deposit_eventFiltersArgs) => NablaUSDCPool_Deposit_eventFiltersDefinition);

export type NablaUSDCPool_Withdraw_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaUSDCPool_Withdraw_block = Block_t;

export type NablaUSDCPool_Withdraw_transaction = Transaction_t;

export type NablaUSDCPool_Withdraw_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDCPool_Withdraw_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDCPool_Withdraw_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDCPool_Withdraw_block
};

export type NablaUSDCPool_Withdraw_loaderArgs = Internal_genericLoaderArgs<NablaUSDCPool_Withdraw_event,loaderContext>;

export type NablaUSDCPool_Withdraw_loader<loaderReturn> = Internal_genericLoader<NablaUSDCPool_Withdraw_loaderArgs,loaderReturn>;

export type NablaUSDCPool_Withdraw_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDCPool_Withdraw_event,handlerContext,loaderReturn>;

export type NablaUSDCPool_Withdraw_handler<loaderReturn> = Internal_genericHandler<NablaUSDCPool_Withdraw_handlerArgs<loaderReturn>>;

export type NablaUSDCPool_Withdraw_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDCPool_Withdraw_event,contractRegistrations>>;

export type NablaUSDCPool_Withdraw_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaUSDCPool_Withdraw_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDCPool_Withdraw_eventFiltersDefinition = 
    NablaUSDCPool_Withdraw_eventFilter
  | NablaUSDCPool_Withdraw_eventFilter[];

export type NablaUSDCPool_Withdraw_eventFilters = 
    NablaUSDCPool_Withdraw_eventFilter
  | NablaUSDCPool_Withdraw_eventFilter[]
  | ((_1:NablaUSDCPool_Withdraw_eventFiltersArgs) => NablaUSDCPool_Withdraw_eventFiltersDefinition);

export type NablaUSDCPool_Swap_eventArgs = {
  readonly sender: Address_t; 
  readonly tokenIn: Address_t; 
  readonly tokenOut: Address_t; 
  readonly amountIn: bigint; 
  readonly amountOut: bigint
};

export type NablaUSDCPool_Swap_block = Block_t;

export type NablaUSDCPool_Swap_transaction = Transaction_t;

export type NablaUSDCPool_Swap_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDCPool_Swap_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDCPool_Swap_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDCPool_Swap_block
};

export type NablaUSDCPool_Swap_loaderArgs = Internal_genericLoaderArgs<NablaUSDCPool_Swap_event,loaderContext>;

export type NablaUSDCPool_Swap_loader<loaderReturn> = Internal_genericLoader<NablaUSDCPool_Swap_loaderArgs,loaderReturn>;

export type NablaUSDCPool_Swap_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDCPool_Swap_event,handlerContext,loaderReturn>;

export type NablaUSDCPool_Swap_handler<loaderReturn> = Internal_genericHandler<NablaUSDCPool_Swap_handlerArgs<loaderReturn>>;

export type NablaUSDCPool_Swap_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDCPool_Swap_event,contractRegistrations>>;

export type NablaUSDCPool_Swap_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t> };

export type NablaUSDCPool_Swap_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDCPool_Swap_eventFiltersDefinition = 
    NablaUSDCPool_Swap_eventFilter
  | NablaUSDCPool_Swap_eventFilter[];

export type NablaUSDCPool_Swap_eventFilters = 
    NablaUSDCPool_Swap_eventFilter
  | NablaUSDCPool_Swap_eventFilter[]
  | ((_1:NablaUSDCPool_Swap_eventFiltersArgs) => NablaUSDCPool_Swap_eventFiltersDefinition);

export type NablaUSDTPool_chainId = 10143;

export type NablaUSDTPool_Deposit_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaUSDTPool_Deposit_block = Block_t;

export type NablaUSDTPool_Deposit_transaction = Transaction_t;

export type NablaUSDTPool_Deposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDTPool_Deposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDTPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDTPool_Deposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDTPool_Deposit_block
};

export type NablaUSDTPool_Deposit_loaderArgs = Internal_genericLoaderArgs<NablaUSDTPool_Deposit_event,loaderContext>;

export type NablaUSDTPool_Deposit_loader<loaderReturn> = Internal_genericLoader<NablaUSDTPool_Deposit_loaderArgs,loaderReturn>;

export type NablaUSDTPool_Deposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDTPool_Deposit_event,handlerContext,loaderReturn>;

export type NablaUSDTPool_Deposit_handler<loaderReturn> = Internal_genericHandler<NablaUSDTPool_Deposit_handlerArgs<loaderReturn>>;

export type NablaUSDTPool_Deposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDTPool_Deposit_event,contractRegistrations>>;

export type NablaUSDTPool_Deposit_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaUSDTPool_Deposit_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDTPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDTPool_Deposit_eventFiltersDefinition = 
    NablaUSDTPool_Deposit_eventFilter
  | NablaUSDTPool_Deposit_eventFilter[];

export type NablaUSDTPool_Deposit_eventFilters = 
    NablaUSDTPool_Deposit_eventFilter
  | NablaUSDTPool_Deposit_eventFilter[]
  | ((_1:NablaUSDTPool_Deposit_eventFiltersArgs) => NablaUSDTPool_Deposit_eventFiltersDefinition);

export type NablaUSDTPool_Withdraw_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaUSDTPool_Withdraw_block = Block_t;

export type NablaUSDTPool_Withdraw_transaction = Transaction_t;

export type NablaUSDTPool_Withdraw_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDTPool_Withdraw_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDTPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDTPool_Withdraw_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDTPool_Withdraw_block
};

export type NablaUSDTPool_Withdraw_loaderArgs = Internal_genericLoaderArgs<NablaUSDTPool_Withdraw_event,loaderContext>;

export type NablaUSDTPool_Withdraw_loader<loaderReturn> = Internal_genericLoader<NablaUSDTPool_Withdraw_loaderArgs,loaderReturn>;

export type NablaUSDTPool_Withdraw_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDTPool_Withdraw_event,handlerContext,loaderReturn>;

export type NablaUSDTPool_Withdraw_handler<loaderReturn> = Internal_genericHandler<NablaUSDTPool_Withdraw_handlerArgs<loaderReturn>>;

export type NablaUSDTPool_Withdraw_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDTPool_Withdraw_event,contractRegistrations>>;

export type NablaUSDTPool_Withdraw_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaUSDTPool_Withdraw_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDTPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDTPool_Withdraw_eventFiltersDefinition = 
    NablaUSDTPool_Withdraw_eventFilter
  | NablaUSDTPool_Withdraw_eventFilter[];

export type NablaUSDTPool_Withdraw_eventFilters = 
    NablaUSDTPool_Withdraw_eventFilter
  | NablaUSDTPool_Withdraw_eventFilter[]
  | ((_1:NablaUSDTPool_Withdraw_eventFiltersArgs) => NablaUSDTPool_Withdraw_eventFiltersDefinition);

export type NablaUSDTPool_Swap_eventArgs = {
  readonly sender: Address_t; 
  readonly tokenIn: Address_t; 
  readonly tokenOut: Address_t; 
  readonly amountIn: bigint; 
  readonly amountOut: bigint
};

export type NablaUSDTPool_Swap_block = Block_t;

export type NablaUSDTPool_Swap_transaction = Transaction_t;

export type NablaUSDTPool_Swap_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaUSDTPool_Swap_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaUSDTPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaUSDTPool_Swap_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaUSDTPool_Swap_block
};

export type NablaUSDTPool_Swap_loaderArgs = Internal_genericLoaderArgs<NablaUSDTPool_Swap_event,loaderContext>;

export type NablaUSDTPool_Swap_loader<loaderReturn> = Internal_genericLoader<NablaUSDTPool_Swap_loaderArgs,loaderReturn>;

export type NablaUSDTPool_Swap_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaUSDTPool_Swap_event,handlerContext,loaderReturn>;

export type NablaUSDTPool_Swap_handler<loaderReturn> = Internal_genericHandler<NablaUSDTPool_Swap_handlerArgs<loaderReturn>>;

export type NablaUSDTPool_Swap_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaUSDTPool_Swap_event,contractRegistrations>>;

export type NablaUSDTPool_Swap_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t> };

export type NablaUSDTPool_Swap_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaUSDTPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaUSDTPool_Swap_eventFiltersDefinition = 
    NablaUSDTPool_Swap_eventFilter
  | NablaUSDTPool_Swap_eventFilter[];

export type NablaUSDTPool_Swap_eventFilters = 
    NablaUSDTPool_Swap_eventFilter
  | NablaUSDTPool_Swap_eventFilter[]
  | ((_1:NablaUSDTPool_Swap_eventFiltersArgs) => NablaUSDTPool_Swap_eventFiltersDefinition);

export type NablaWBTCPool_chainId = 10143;

export type NablaWBTCPool_Deposit_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaWBTCPool_Deposit_block = Block_t;

export type NablaWBTCPool_Deposit_transaction = Transaction_t;

export type NablaWBTCPool_Deposit_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaWBTCPool_Deposit_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaWBTCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaWBTCPool_Deposit_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaWBTCPool_Deposit_block
};

export type NablaWBTCPool_Deposit_loaderArgs = Internal_genericLoaderArgs<NablaWBTCPool_Deposit_event,loaderContext>;

export type NablaWBTCPool_Deposit_loader<loaderReturn> = Internal_genericLoader<NablaWBTCPool_Deposit_loaderArgs,loaderReturn>;

export type NablaWBTCPool_Deposit_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaWBTCPool_Deposit_event,handlerContext,loaderReturn>;

export type NablaWBTCPool_Deposit_handler<loaderReturn> = Internal_genericHandler<NablaWBTCPool_Deposit_handlerArgs<loaderReturn>>;

export type NablaWBTCPool_Deposit_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaWBTCPool_Deposit_event,contractRegistrations>>;

export type NablaWBTCPool_Deposit_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaWBTCPool_Deposit_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaWBTCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaWBTCPool_Deposit_eventFiltersDefinition = 
    NablaWBTCPool_Deposit_eventFilter
  | NablaWBTCPool_Deposit_eventFilter[];

export type NablaWBTCPool_Deposit_eventFilters = 
    NablaWBTCPool_Deposit_eventFilter
  | NablaWBTCPool_Deposit_eventFilter[]
  | ((_1:NablaWBTCPool_Deposit_eventFiltersArgs) => NablaWBTCPool_Deposit_eventFiltersDefinition);

export type NablaWBTCPool_Withdraw_eventArgs = {
  readonly user: Address_t; 
  readonly assets: bigint; 
  readonly shares: bigint
};

export type NablaWBTCPool_Withdraw_block = Block_t;

export type NablaWBTCPool_Withdraw_transaction = Transaction_t;

export type NablaWBTCPool_Withdraw_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaWBTCPool_Withdraw_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaWBTCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaWBTCPool_Withdraw_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaWBTCPool_Withdraw_block
};

export type NablaWBTCPool_Withdraw_loaderArgs = Internal_genericLoaderArgs<NablaWBTCPool_Withdraw_event,loaderContext>;

export type NablaWBTCPool_Withdraw_loader<loaderReturn> = Internal_genericLoader<NablaWBTCPool_Withdraw_loaderArgs,loaderReturn>;

export type NablaWBTCPool_Withdraw_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaWBTCPool_Withdraw_event,handlerContext,loaderReturn>;

export type NablaWBTCPool_Withdraw_handler<loaderReturn> = Internal_genericHandler<NablaWBTCPool_Withdraw_handlerArgs<loaderReturn>>;

export type NablaWBTCPool_Withdraw_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaWBTCPool_Withdraw_event,contractRegistrations>>;

export type NablaWBTCPool_Withdraw_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type NablaWBTCPool_Withdraw_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaWBTCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaWBTCPool_Withdraw_eventFiltersDefinition = 
    NablaWBTCPool_Withdraw_eventFilter
  | NablaWBTCPool_Withdraw_eventFilter[];

export type NablaWBTCPool_Withdraw_eventFilters = 
    NablaWBTCPool_Withdraw_eventFilter
  | NablaWBTCPool_Withdraw_eventFilter[]
  | ((_1:NablaWBTCPool_Withdraw_eventFiltersArgs) => NablaWBTCPool_Withdraw_eventFiltersDefinition);

export type NablaWBTCPool_Swap_eventArgs = {
  readonly sender: Address_t; 
  readonly tokenIn: Address_t; 
  readonly tokenOut: Address_t; 
  readonly amountIn: bigint; 
  readonly amountOut: bigint
};

export type NablaWBTCPool_Swap_block = Block_t;

export type NablaWBTCPool_Swap_transaction = Transaction_t;

export type NablaWBTCPool_Swap_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: NablaWBTCPool_Swap_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: NablaWBTCPool_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: NablaWBTCPool_Swap_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: NablaWBTCPool_Swap_block
};

export type NablaWBTCPool_Swap_loaderArgs = Internal_genericLoaderArgs<NablaWBTCPool_Swap_event,loaderContext>;

export type NablaWBTCPool_Swap_loader<loaderReturn> = Internal_genericLoader<NablaWBTCPool_Swap_loaderArgs,loaderReturn>;

export type NablaWBTCPool_Swap_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<NablaWBTCPool_Swap_event,handlerContext,loaderReturn>;

export type NablaWBTCPool_Swap_handler<loaderReturn> = Internal_genericHandler<NablaWBTCPool_Swap_handlerArgs<loaderReturn>>;

export type NablaWBTCPool_Swap_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<NablaWBTCPool_Swap_event,contractRegistrations>>;

export type NablaWBTCPool_Swap_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t> };

export type NablaWBTCPool_Swap_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: NablaWBTCPool_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type NablaWBTCPool_Swap_eventFiltersDefinition = 
    NablaWBTCPool_Swap_eventFilter
  | NablaWBTCPool_Swap_eventFilter[];

export type NablaWBTCPool_Swap_eventFilters = 
    NablaWBTCPool_Swap_eventFilter
  | NablaWBTCPool_Swap_eventFilter[]
  | ((_1:NablaWBTCPool_Swap_eventFiltersArgs) => NablaWBTCPool_Swap_eventFiltersDefinition);

export type TrustlessDeFiTreasury_chainId = 10143;

export type TrustlessDeFiTreasury_DelegationGranted_eventArgs = {
  readonly user: Address_t; 
  readonly aiAgent: Address_t; 
  readonly dailyLimitUSD: bigint; 
  readonly validUntil: bigint; 
  readonly protocolWhitelist: Address_t[]
};

export type TrustlessDeFiTreasury_DelegationGranted_block = Block_t;

export type TrustlessDeFiTreasury_DelegationGranted_transaction = Transaction_t;

export type TrustlessDeFiTreasury_DelegationGranted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_DelegationGranted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_DelegationGranted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_DelegationGranted_block
};

export type TrustlessDeFiTreasury_DelegationGranted_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_DelegationGranted_event,loaderContext>;

export type TrustlessDeFiTreasury_DelegationGranted_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_DelegationGranted_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationGranted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_DelegationGranted_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationGranted_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_DelegationGranted_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_DelegationGranted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_DelegationGranted_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_DelegationGranted_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t>; readonly aiAgent?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_DelegationGranted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_DelegationGranted_eventFiltersDefinition = 
    TrustlessDeFiTreasury_DelegationGranted_eventFilter
  | TrustlessDeFiTreasury_DelegationGranted_eventFilter[];

export type TrustlessDeFiTreasury_DelegationGranted_eventFilters = 
    TrustlessDeFiTreasury_DelegationGranted_eventFilter
  | TrustlessDeFiTreasury_DelegationGranted_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_DelegationGranted_eventFiltersArgs) => TrustlessDeFiTreasury_DelegationGranted_eventFiltersDefinition);

export type TrustlessDeFiTreasury_DelegationUpdated_eventArgs = {
  readonly user: Address_t; 
  readonly aiAgent: Address_t; 
  readonly dailyLimitUSD: bigint; 
  readonly validUntil: bigint; 
  readonly protocolWhitelist: Address_t[]
};

export type TrustlessDeFiTreasury_DelegationUpdated_block = Block_t;

export type TrustlessDeFiTreasury_DelegationUpdated_transaction = Transaction_t;

export type TrustlessDeFiTreasury_DelegationUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_DelegationUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_DelegationUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_DelegationUpdated_block
};

export type TrustlessDeFiTreasury_DelegationUpdated_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_DelegationUpdated_event,loaderContext>;

export type TrustlessDeFiTreasury_DelegationUpdated_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_DelegationUpdated_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_DelegationUpdated_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationUpdated_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_DelegationUpdated_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_DelegationUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_DelegationUpdated_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_DelegationUpdated_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t>; readonly aiAgent?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_DelegationUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_DelegationUpdated_eventFiltersDefinition = 
    TrustlessDeFiTreasury_DelegationUpdated_eventFilter
  | TrustlessDeFiTreasury_DelegationUpdated_eventFilter[];

export type TrustlessDeFiTreasury_DelegationUpdated_eventFilters = 
    TrustlessDeFiTreasury_DelegationUpdated_eventFilter
  | TrustlessDeFiTreasury_DelegationUpdated_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_DelegationUpdated_eventFiltersArgs) => TrustlessDeFiTreasury_DelegationUpdated_eventFiltersDefinition);

export type TrustlessDeFiTreasury_DelegationRevoked_eventArgs = { readonly user: Address_t; readonly aiAgent: Address_t };

export type TrustlessDeFiTreasury_DelegationRevoked_block = Block_t;

export type TrustlessDeFiTreasury_DelegationRevoked_transaction = Transaction_t;

export type TrustlessDeFiTreasury_DelegationRevoked_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_DelegationRevoked_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_DelegationRevoked_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_DelegationRevoked_block
};

export type TrustlessDeFiTreasury_DelegationRevoked_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_DelegationRevoked_event,loaderContext>;

export type TrustlessDeFiTreasury_DelegationRevoked_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_DelegationRevoked_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationRevoked_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_DelegationRevoked_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationRevoked_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_DelegationRevoked_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_DelegationRevoked_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_DelegationRevoked_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_DelegationRevoked_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t>; readonly aiAgent?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_DelegationRevoked_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_DelegationRevoked_eventFiltersDefinition = 
    TrustlessDeFiTreasury_DelegationRevoked_eventFilter
  | TrustlessDeFiTreasury_DelegationRevoked_eventFilter[];

export type TrustlessDeFiTreasury_DelegationRevoked_eventFilters = 
    TrustlessDeFiTreasury_DelegationRevoked_eventFilter
  | TrustlessDeFiTreasury_DelegationRevoked_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_DelegationRevoked_eventFiltersArgs) => TrustlessDeFiTreasury_DelegationRevoked_eventFiltersDefinition);

export type TrustlessDeFiTreasury_DelegationPaused_eventArgs = { readonly user: Address_t };

export type TrustlessDeFiTreasury_DelegationPaused_block = Block_t;

export type TrustlessDeFiTreasury_DelegationPaused_transaction = Transaction_t;

export type TrustlessDeFiTreasury_DelegationPaused_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_DelegationPaused_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_DelegationPaused_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_DelegationPaused_block
};

export type TrustlessDeFiTreasury_DelegationPaused_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_DelegationPaused_event,loaderContext>;

export type TrustlessDeFiTreasury_DelegationPaused_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_DelegationPaused_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationPaused_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_DelegationPaused_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationPaused_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_DelegationPaused_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_DelegationPaused_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_DelegationPaused_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_DelegationPaused_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_DelegationPaused_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_DelegationPaused_eventFiltersDefinition = 
    TrustlessDeFiTreasury_DelegationPaused_eventFilter
  | TrustlessDeFiTreasury_DelegationPaused_eventFilter[];

export type TrustlessDeFiTreasury_DelegationPaused_eventFilters = 
    TrustlessDeFiTreasury_DelegationPaused_eventFilter
  | TrustlessDeFiTreasury_DelegationPaused_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_DelegationPaused_eventFiltersArgs) => TrustlessDeFiTreasury_DelegationPaused_eventFiltersDefinition);

export type TrustlessDeFiTreasury_DelegationResumed_eventArgs = { readonly user: Address_t; readonly validUntil: bigint };

export type TrustlessDeFiTreasury_DelegationResumed_block = Block_t;

export type TrustlessDeFiTreasury_DelegationResumed_transaction = Transaction_t;

export type TrustlessDeFiTreasury_DelegationResumed_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_DelegationResumed_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_DelegationResumed_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_DelegationResumed_block
};

export type TrustlessDeFiTreasury_DelegationResumed_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_DelegationResumed_event,loaderContext>;

export type TrustlessDeFiTreasury_DelegationResumed_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_DelegationResumed_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationResumed_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_DelegationResumed_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_DelegationResumed_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_DelegationResumed_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_DelegationResumed_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_DelegationResumed_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_DelegationResumed_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_DelegationResumed_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_DelegationResumed_eventFiltersDefinition = 
    TrustlessDeFiTreasury_DelegationResumed_eventFilter
  | TrustlessDeFiTreasury_DelegationResumed_eventFilter[];

export type TrustlessDeFiTreasury_DelegationResumed_eventFilters = 
    TrustlessDeFiTreasury_DelegationResumed_eventFilter
  | TrustlessDeFiTreasury_DelegationResumed_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_DelegationResumed_eventFiltersArgs) => TrustlessDeFiTreasury_DelegationResumed_eventFiltersDefinition);

export type TrustlessDeFiTreasury_SpendRecorded_eventArgs = {
  readonly user: Address_t; 
  readonly protocol: Address_t; 
  readonly valueUsd: bigint; 
  readonly spentToday: bigint
};

export type TrustlessDeFiTreasury_SpendRecorded_block = Block_t;

export type TrustlessDeFiTreasury_SpendRecorded_transaction = Transaction_t;

export type TrustlessDeFiTreasury_SpendRecorded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TrustlessDeFiTreasury_SpendRecorded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TrustlessDeFiTreasury_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TrustlessDeFiTreasury_SpendRecorded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TrustlessDeFiTreasury_SpendRecorded_block
};

export type TrustlessDeFiTreasury_SpendRecorded_loaderArgs = Internal_genericLoaderArgs<TrustlessDeFiTreasury_SpendRecorded_event,loaderContext>;

export type TrustlessDeFiTreasury_SpendRecorded_loader<loaderReturn> = Internal_genericLoader<TrustlessDeFiTreasury_SpendRecorded_loaderArgs,loaderReturn>;

export type TrustlessDeFiTreasury_SpendRecorded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TrustlessDeFiTreasury_SpendRecorded_event,handlerContext,loaderReturn>;

export type TrustlessDeFiTreasury_SpendRecorded_handler<loaderReturn> = Internal_genericHandler<TrustlessDeFiTreasury_SpendRecorded_handlerArgs<loaderReturn>>;

export type TrustlessDeFiTreasury_SpendRecorded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TrustlessDeFiTreasury_SpendRecorded_event,contractRegistrations>>;

export type TrustlessDeFiTreasury_SpendRecorded_eventFilter = { readonly user?: SingleOrMultiple_t<Address_t>; readonly protocol?: SingleOrMultiple_t<Address_t> };

export type TrustlessDeFiTreasury_SpendRecorded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TrustlessDeFiTreasury_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TrustlessDeFiTreasury_SpendRecorded_eventFiltersDefinition = 
    TrustlessDeFiTreasury_SpendRecorded_eventFilter
  | TrustlessDeFiTreasury_SpendRecorded_eventFilter[];

export type TrustlessDeFiTreasury_SpendRecorded_eventFilters = 
    TrustlessDeFiTreasury_SpendRecorded_eventFilter
  | TrustlessDeFiTreasury_SpendRecorded_eventFilter[]
  | ((_1:TrustlessDeFiTreasury_SpendRecorded_eventFiltersArgs) => TrustlessDeFiTreasury_SpendRecorded_eventFiltersDefinition);

export type UniswapV2Factory_chainId = 10143;

export type UniswapV2Factory_PairCreated_eventArgs = {
  readonly token0: Address_t; 
  readonly token1: Address_t; 
  readonly pair: Address_t; 
  readonly _3: bigint
};

export type UniswapV2Factory_PairCreated_block = Block_t;

export type UniswapV2Factory_PairCreated_transaction = Transaction_t;

export type UniswapV2Factory_PairCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Factory_PairCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Factory_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Factory_PairCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Factory_PairCreated_block
};

export type UniswapV2Factory_PairCreated_loaderArgs = Internal_genericLoaderArgs<UniswapV2Factory_PairCreated_event,loaderContext>;

export type UniswapV2Factory_PairCreated_loader<loaderReturn> = Internal_genericLoader<UniswapV2Factory_PairCreated_loaderArgs,loaderReturn>;

export type UniswapV2Factory_PairCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Factory_PairCreated_event,handlerContext,loaderReturn>;

export type UniswapV2Factory_PairCreated_handler<loaderReturn> = Internal_genericHandler<UniswapV2Factory_PairCreated_handlerArgs<loaderReturn>>;

export type UniswapV2Factory_PairCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Factory_PairCreated_event,contractRegistrations>>;

export type UniswapV2Factory_PairCreated_eventFilter = { readonly token0?: SingleOrMultiple_t<Address_t>; readonly token1?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Factory_PairCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Factory_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Factory_PairCreated_eventFiltersDefinition = 
    UniswapV2Factory_PairCreated_eventFilter
  | UniswapV2Factory_PairCreated_eventFilter[];

export type UniswapV2Factory_PairCreated_eventFilters = 
    UniswapV2Factory_PairCreated_eventFilter
  | UniswapV2Factory_PairCreated_eventFilter[]
  | ((_1:UniswapV2Factory_PairCreated_eventFiltersArgs) => UniswapV2Factory_PairCreated_eventFiltersDefinition);

export type UniswapV2Pair_USDC_USDT_chainId = 10143;

export type UniswapV2Pair_USDC_USDT_Mint_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0: bigint; 
  readonly amount1: bigint
};

export type UniswapV2Pair_USDC_USDT_Mint_block = Block_t;

export type UniswapV2Pair_USDC_USDT_Mint_transaction = Transaction_t;

export type UniswapV2Pair_USDC_USDT_Mint_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_USDT_Mint_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_USDT_Mint_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_USDT_Mint_block
};

export type UniswapV2Pair_USDC_USDT_Mint_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_USDT_Mint_event,loaderContext>;

export type UniswapV2Pair_USDC_USDT_Mint_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_USDT_Mint_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Mint_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_USDT_Mint_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Mint_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_USDT_Mint_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_USDT_Mint_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_USDT_Mint_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_USDT_Mint_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_USDT_Mint_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_USDT_Mint_eventFiltersDefinition = 
    UniswapV2Pair_USDC_USDT_Mint_eventFilter
  | UniswapV2Pair_USDC_USDT_Mint_eventFilter[];

export type UniswapV2Pair_USDC_USDT_Mint_eventFilters = 
    UniswapV2Pair_USDC_USDT_Mint_eventFilter
  | UniswapV2Pair_USDC_USDT_Mint_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_USDT_Mint_eventFiltersArgs) => UniswapV2Pair_USDC_USDT_Mint_eventFiltersDefinition);

export type UniswapV2Pair_USDC_USDT_Burn_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0: bigint; 
  readonly amount1: bigint; 
  readonly to: Address_t
};

export type UniswapV2Pair_USDC_USDT_Burn_block = Block_t;

export type UniswapV2Pair_USDC_USDT_Burn_transaction = Transaction_t;

export type UniswapV2Pair_USDC_USDT_Burn_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_USDT_Burn_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_USDT_Burn_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_USDT_Burn_block
};

export type UniswapV2Pair_USDC_USDT_Burn_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_USDT_Burn_event,loaderContext>;

export type UniswapV2Pair_USDC_USDT_Burn_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_USDT_Burn_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Burn_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_USDT_Burn_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Burn_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_USDT_Burn_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_USDT_Burn_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_USDT_Burn_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_USDT_Burn_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_USDT_Burn_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_USDT_Burn_eventFiltersDefinition = 
    UniswapV2Pair_USDC_USDT_Burn_eventFilter
  | UniswapV2Pair_USDC_USDT_Burn_eventFilter[];

export type UniswapV2Pair_USDC_USDT_Burn_eventFilters = 
    UniswapV2Pair_USDC_USDT_Burn_eventFilter
  | UniswapV2Pair_USDC_USDT_Burn_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_USDT_Burn_eventFiltersArgs) => UniswapV2Pair_USDC_USDT_Burn_eventFiltersDefinition);

export type UniswapV2Pair_USDC_USDT_Swap_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0In: bigint; 
  readonly amount1In: bigint; 
  readonly amount0Out: bigint; 
  readonly amount1Out: bigint; 
  readonly to: Address_t
};

export type UniswapV2Pair_USDC_USDT_Swap_block = Block_t;

export type UniswapV2Pair_USDC_USDT_Swap_transaction = Transaction_t;

export type UniswapV2Pair_USDC_USDT_Swap_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_USDT_Swap_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_USDT_Swap_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_USDT_Swap_block
};

export type UniswapV2Pair_USDC_USDT_Swap_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_USDT_Swap_event,loaderContext>;

export type UniswapV2Pair_USDC_USDT_Swap_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_USDT_Swap_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Swap_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_USDT_Swap_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Swap_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_USDT_Swap_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_USDT_Swap_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_USDT_Swap_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_USDT_Swap_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_USDT_Swap_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_USDT_Swap_eventFiltersDefinition = 
    UniswapV2Pair_USDC_USDT_Swap_eventFilter
  | UniswapV2Pair_USDC_USDT_Swap_eventFilter[];

export type UniswapV2Pair_USDC_USDT_Swap_eventFilters = 
    UniswapV2Pair_USDC_USDT_Swap_eventFilter
  | UniswapV2Pair_USDC_USDT_Swap_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_USDT_Swap_eventFiltersArgs) => UniswapV2Pair_USDC_USDT_Swap_eventFiltersDefinition);

export type UniswapV2Pair_USDC_USDT_Sync_eventArgs = { readonly reserve0: bigint; readonly reserve1: bigint };

export type UniswapV2Pair_USDC_USDT_Sync_block = Block_t;

export type UniswapV2Pair_USDC_USDT_Sync_transaction = Transaction_t;

export type UniswapV2Pair_USDC_USDT_Sync_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_USDT_Sync_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_USDT_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_USDT_Sync_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_USDT_Sync_block
};

export type UniswapV2Pair_USDC_USDT_Sync_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_USDT_Sync_event,loaderContext>;

export type UniswapV2Pair_USDC_USDT_Sync_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_USDT_Sync_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Sync_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_USDT_Sync_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_USDT_Sync_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_USDT_Sync_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_USDT_Sync_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_USDT_Sync_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_USDT_Sync_eventFilter = {};

export type UniswapV2Pair_USDC_USDT_Sync_eventFilters = Internal_noEventFilters;

export type UniswapV2Pair_USDC_WMON_chainId = 10143;

export type UniswapV2Pair_USDC_WMON_Mint_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0: bigint; 
  readonly amount1: bigint
};

export type UniswapV2Pair_USDC_WMON_Mint_block = Block_t;

export type UniswapV2Pair_USDC_WMON_Mint_transaction = Transaction_t;

export type UniswapV2Pair_USDC_WMON_Mint_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_WMON_Mint_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_WMON_Mint_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_WMON_Mint_block
};

export type UniswapV2Pair_USDC_WMON_Mint_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_WMON_Mint_event,loaderContext>;

export type UniswapV2Pair_USDC_WMON_Mint_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_WMON_Mint_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Mint_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_WMON_Mint_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Mint_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_WMON_Mint_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_WMON_Mint_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_WMON_Mint_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_WMON_Mint_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_WMON_Mint_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_WMON_Mint_eventFiltersDefinition = 
    UniswapV2Pair_USDC_WMON_Mint_eventFilter
  | UniswapV2Pair_USDC_WMON_Mint_eventFilter[];

export type UniswapV2Pair_USDC_WMON_Mint_eventFilters = 
    UniswapV2Pair_USDC_WMON_Mint_eventFilter
  | UniswapV2Pair_USDC_WMON_Mint_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_WMON_Mint_eventFiltersArgs) => UniswapV2Pair_USDC_WMON_Mint_eventFiltersDefinition);

export type UniswapV2Pair_USDC_WMON_Burn_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0: bigint; 
  readonly amount1: bigint; 
  readonly to: Address_t
};

export type UniswapV2Pair_USDC_WMON_Burn_block = Block_t;

export type UniswapV2Pair_USDC_WMON_Burn_transaction = Transaction_t;

export type UniswapV2Pair_USDC_WMON_Burn_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_WMON_Burn_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_WMON_Burn_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_WMON_Burn_block
};

export type UniswapV2Pair_USDC_WMON_Burn_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_WMON_Burn_event,loaderContext>;

export type UniswapV2Pair_USDC_WMON_Burn_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_WMON_Burn_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Burn_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_WMON_Burn_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Burn_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_WMON_Burn_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_WMON_Burn_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_WMON_Burn_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_WMON_Burn_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_WMON_Burn_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_WMON_Burn_eventFiltersDefinition = 
    UniswapV2Pair_USDC_WMON_Burn_eventFilter
  | UniswapV2Pair_USDC_WMON_Burn_eventFilter[];

export type UniswapV2Pair_USDC_WMON_Burn_eventFilters = 
    UniswapV2Pair_USDC_WMON_Burn_eventFilter
  | UniswapV2Pair_USDC_WMON_Burn_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_WMON_Burn_eventFiltersArgs) => UniswapV2Pair_USDC_WMON_Burn_eventFiltersDefinition);

export type UniswapV2Pair_USDC_WMON_Swap_eventArgs = {
  readonly sender: Address_t; 
  readonly amount0In: bigint; 
  readonly amount1In: bigint; 
  readonly amount0Out: bigint; 
  readonly amount1Out: bigint; 
  readonly to: Address_t
};

export type UniswapV2Pair_USDC_WMON_Swap_block = Block_t;

export type UniswapV2Pair_USDC_WMON_Swap_transaction = Transaction_t;

export type UniswapV2Pair_USDC_WMON_Swap_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_WMON_Swap_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_WMON_Swap_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_WMON_Swap_block
};

export type UniswapV2Pair_USDC_WMON_Swap_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_WMON_Swap_event,loaderContext>;

export type UniswapV2Pair_USDC_WMON_Swap_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_WMON_Swap_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Swap_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_WMON_Swap_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Swap_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_WMON_Swap_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_WMON_Swap_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_WMON_Swap_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_WMON_Swap_eventFilter = { readonly sender?: SingleOrMultiple_t<Address_t>; readonly to?: SingleOrMultiple_t<Address_t> };

export type UniswapV2Pair_USDC_WMON_Swap_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type UniswapV2Pair_USDC_WMON_Swap_eventFiltersDefinition = 
    UniswapV2Pair_USDC_WMON_Swap_eventFilter
  | UniswapV2Pair_USDC_WMON_Swap_eventFilter[];

export type UniswapV2Pair_USDC_WMON_Swap_eventFilters = 
    UniswapV2Pair_USDC_WMON_Swap_eventFilter
  | UniswapV2Pair_USDC_WMON_Swap_eventFilter[]
  | ((_1:UniswapV2Pair_USDC_WMON_Swap_eventFiltersArgs) => UniswapV2Pair_USDC_WMON_Swap_eventFiltersDefinition);

export type UniswapV2Pair_USDC_WMON_Sync_eventArgs = { readonly reserve0: bigint; readonly reserve1: bigint };

export type UniswapV2Pair_USDC_WMON_Sync_block = Block_t;

export type UniswapV2Pair_USDC_WMON_Sync_transaction = Transaction_t;

export type UniswapV2Pair_USDC_WMON_Sync_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: UniswapV2Pair_USDC_WMON_Sync_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: UniswapV2Pair_USDC_WMON_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: UniswapV2Pair_USDC_WMON_Sync_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: UniswapV2Pair_USDC_WMON_Sync_block
};

export type UniswapV2Pair_USDC_WMON_Sync_loaderArgs = Internal_genericLoaderArgs<UniswapV2Pair_USDC_WMON_Sync_event,loaderContext>;

export type UniswapV2Pair_USDC_WMON_Sync_loader<loaderReturn> = Internal_genericLoader<UniswapV2Pair_USDC_WMON_Sync_loaderArgs,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Sync_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<UniswapV2Pair_USDC_WMON_Sync_event,handlerContext,loaderReturn>;

export type UniswapV2Pair_USDC_WMON_Sync_handler<loaderReturn> = Internal_genericHandler<UniswapV2Pair_USDC_WMON_Sync_handlerArgs<loaderReturn>>;

export type UniswapV2Pair_USDC_WMON_Sync_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<UniswapV2Pair_USDC_WMON_Sync_event,contractRegistrations>>;

export type UniswapV2Pair_USDC_WMON_Sync_eventFilter = {};

export type UniswapV2Pair_USDC_WMON_Sync_eventFilters = Internal_noEventFilters;

export type chainId = number;

export type chain = 10143;

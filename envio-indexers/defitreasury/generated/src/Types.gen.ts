/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {EmergencyController_EmergencyStatusChanged_t as Entities_EmergencyController_EmergencyStatusChanged_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {TrustlessDeFiTreasury_Delegation_t as Entities_TrustlessDeFiTreasury_Delegation_t} from '../src/db/Entities.gen';

import type {TrustlessDeFiTreasury_SpendRecorded_t as Entities_TrustlessDeFiTreasury_SpendRecorded_t} from '../src/db/Entities.gen';

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
  readonly addEmergencyController: (_1:Address_t) => void; 
  readonly addTrustlessDeFiTreasury: (_1:Address_t) => void
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

export type emergencyController_EmergencyStatusChanged = Entities_EmergencyController_EmergencyStatusChanged_t;
export type EmergencyController_EmergencyStatusChanged = emergencyController_EmergencyStatusChanged;

export type trustlessDeFiTreasury_Delegation = Entities_TrustlessDeFiTreasury_Delegation_t;
export type TrustlessDeFiTreasury_Delegation = trustlessDeFiTreasury_Delegation;

export type trustlessDeFiTreasury_SpendRecorded = Entities_TrustlessDeFiTreasury_SpendRecorded_t;
export type TrustlessDeFiTreasury_SpendRecorded = trustlessDeFiTreasury_SpendRecorded;

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

export type chainId = number;

export type chain = 10143;

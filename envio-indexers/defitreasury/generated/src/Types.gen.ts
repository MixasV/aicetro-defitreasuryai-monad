/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {CorporateTreasuryManager_CorporateAccountCreated_t as Entities_CorporateTreasuryManager_CorporateAccountCreated_t} from '../src/db/Entities.gen';

import type {CorporateTreasuryManager_DelegationSpending_t as Entities_CorporateTreasuryManager_DelegationSpending_t} from '../src/db/Entities.gen';

import type {CorporateTreasuryManager_DelegationUpdated_t as Entities_CorporateTreasuryManager_DelegationUpdated_t} from '../src/db/Entities.gen';

import type {EmergencyController_EmergencyStatusChanged_t as Entities_EmergencyController_EmergencyStatusChanged_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

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
  readonly addCorporateTreasuryManager: (_1:Address_t) => void; 
  readonly addEmergencyController: (_1:Address_t) => void
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

export type corporateTreasuryManager_CorporateAccountCreated = Entities_CorporateTreasuryManager_CorporateAccountCreated_t;
export type CorporateTreasuryManager_CorporateAccountCreated = corporateTreasuryManager_CorporateAccountCreated;

export type corporateTreasuryManager_DelegationSpending = Entities_CorporateTreasuryManager_DelegationSpending_t;
export type CorporateTreasuryManager_DelegationSpending = corporateTreasuryManager_DelegationSpending;

export type corporateTreasuryManager_DelegationUpdated = Entities_CorporateTreasuryManager_DelegationUpdated_t;
export type CorporateTreasuryManager_DelegationUpdated = corporateTreasuryManager_DelegationUpdated;

export type emergencyController_EmergencyStatusChanged = Entities_EmergencyController_EmergencyStatusChanged_t;
export type EmergencyController_EmergencyStatusChanged = emergencyController_EmergencyStatusChanged;

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

export type CorporateTreasuryManager_chainId = 10143;

export type CorporateTreasuryManager_CorporateAccountCreated_eventArgs = {
  readonly account: Address_t; 
  readonly owners: Address_t[]; 
  readonly threshold: bigint
};

export type CorporateTreasuryManager_CorporateAccountCreated_block = Block_t;

export type CorporateTreasuryManager_CorporateAccountCreated_transaction = Transaction_t;

export type CorporateTreasuryManager_CorporateAccountCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: CorporateTreasuryManager_CorporateAccountCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: CorporateTreasuryManager_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: CorporateTreasuryManager_CorporateAccountCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: CorporateTreasuryManager_CorporateAccountCreated_block
};

export type CorporateTreasuryManager_CorporateAccountCreated_loaderArgs = Internal_genericLoaderArgs<CorporateTreasuryManager_CorporateAccountCreated_event,loaderContext>;

export type CorporateTreasuryManager_CorporateAccountCreated_loader<loaderReturn> = Internal_genericLoader<CorporateTreasuryManager_CorporateAccountCreated_loaderArgs,loaderReturn>;

export type CorporateTreasuryManager_CorporateAccountCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<CorporateTreasuryManager_CorporateAccountCreated_event,handlerContext,loaderReturn>;

export type CorporateTreasuryManager_CorporateAccountCreated_handler<loaderReturn> = Internal_genericHandler<CorporateTreasuryManager_CorporateAccountCreated_handlerArgs<loaderReturn>>;

export type CorporateTreasuryManager_CorporateAccountCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<CorporateTreasuryManager_CorporateAccountCreated_event,contractRegistrations>>;

export type CorporateTreasuryManager_CorporateAccountCreated_eventFilter = { readonly account?: SingleOrMultiple_t<Address_t> };

export type CorporateTreasuryManager_CorporateAccountCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: CorporateTreasuryManager_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type CorporateTreasuryManager_CorporateAccountCreated_eventFiltersDefinition = 
    CorporateTreasuryManager_CorporateAccountCreated_eventFilter
  | CorporateTreasuryManager_CorporateAccountCreated_eventFilter[];

export type CorporateTreasuryManager_CorporateAccountCreated_eventFilters = 
    CorporateTreasuryManager_CorporateAccountCreated_eventFilter
  | CorporateTreasuryManager_CorporateAccountCreated_eventFilter[]
  | ((_1:CorporateTreasuryManager_CorporateAccountCreated_eventFiltersArgs) => CorporateTreasuryManager_CorporateAccountCreated_eventFiltersDefinition);

export type CorporateTreasuryManager_DelegationSpending_eventArgs = {
  readonly account: Address_t; 
  readonly amount: bigint; 
  readonly newSpent: bigint
};

export type CorporateTreasuryManager_DelegationSpending_block = Block_t;

export type CorporateTreasuryManager_DelegationSpending_transaction = Transaction_t;

export type CorporateTreasuryManager_DelegationSpending_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: CorporateTreasuryManager_DelegationSpending_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: CorporateTreasuryManager_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: CorporateTreasuryManager_DelegationSpending_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: CorporateTreasuryManager_DelegationSpending_block
};

export type CorporateTreasuryManager_DelegationSpending_loaderArgs = Internal_genericLoaderArgs<CorporateTreasuryManager_DelegationSpending_event,loaderContext>;

export type CorporateTreasuryManager_DelegationSpending_loader<loaderReturn> = Internal_genericLoader<CorporateTreasuryManager_DelegationSpending_loaderArgs,loaderReturn>;

export type CorporateTreasuryManager_DelegationSpending_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<CorporateTreasuryManager_DelegationSpending_event,handlerContext,loaderReturn>;

export type CorporateTreasuryManager_DelegationSpending_handler<loaderReturn> = Internal_genericHandler<CorporateTreasuryManager_DelegationSpending_handlerArgs<loaderReturn>>;

export type CorporateTreasuryManager_DelegationSpending_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<CorporateTreasuryManager_DelegationSpending_event,contractRegistrations>>;

export type CorporateTreasuryManager_DelegationSpending_eventFilter = { readonly account?: SingleOrMultiple_t<Address_t> };

export type CorporateTreasuryManager_DelegationSpending_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: CorporateTreasuryManager_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type CorporateTreasuryManager_DelegationSpending_eventFiltersDefinition = 
    CorporateTreasuryManager_DelegationSpending_eventFilter
  | CorporateTreasuryManager_DelegationSpending_eventFilter[];

export type CorporateTreasuryManager_DelegationSpending_eventFilters = 
    CorporateTreasuryManager_DelegationSpending_eventFilter
  | CorporateTreasuryManager_DelegationSpending_eventFilter[]
  | ((_1:CorporateTreasuryManager_DelegationSpending_eventFiltersArgs) => CorporateTreasuryManager_DelegationSpending_eventFiltersDefinition);

export type CorporateTreasuryManager_DelegationUpdated_eventArgs = {
  readonly account: Address_t; 
  readonly delegate: Address_t; 
  readonly limit: bigint; 
  readonly active: boolean
};

export type CorporateTreasuryManager_DelegationUpdated_block = Block_t;

export type CorporateTreasuryManager_DelegationUpdated_transaction = Transaction_t;

export type CorporateTreasuryManager_DelegationUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: CorporateTreasuryManager_DelegationUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: CorporateTreasuryManager_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: CorporateTreasuryManager_DelegationUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: CorporateTreasuryManager_DelegationUpdated_block
};

export type CorporateTreasuryManager_DelegationUpdated_loaderArgs = Internal_genericLoaderArgs<CorporateTreasuryManager_DelegationUpdated_event,loaderContext>;

export type CorporateTreasuryManager_DelegationUpdated_loader<loaderReturn> = Internal_genericLoader<CorporateTreasuryManager_DelegationUpdated_loaderArgs,loaderReturn>;

export type CorporateTreasuryManager_DelegationUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<CorporateTreasuryManager_DelegationUpdated_event,handlerContext,loaderReturn>;

export type CorporateTreasuryManager_DelegationUpdated_handler<loaderReturn> = Internal_genericHandler<CorporateTreasuryManager_DelegationUpdated_handlerArgs<loaderReturn>>;

export type CorporateTreasuryManager_DelegationUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<CorporateTreasuryManager_DelegationUpdated_event,contractRegistrations>>;

export type CorporateTreasuryManager_DelegationUpdated_eventFilter = { readonly account?: SingleOrMultiple_t<Address_t> };

export type CorporateTreasuryManager_DelegationUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: CorporateTreasuryManager_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type CorporateTreasuryManager_DelegationUpdated_eventFiltersDefinition = 
    CorporateTreasuryManager_DelegationUpdated_eventFilter
  | CorporateTreasuryManager_DelegationUpdated_eventFilter[];

export type CorporateTreasuryManager_DelegationUpdated_eventFilters = 
    CorporateTreasuryManager_DelegationUpdated_eventFilter
  | CorporateTreasuryManager_DelegationUpdated_eventFilter[]
  | ((_1:CorporateTreasuryManager_DelegationUpdated_eventFiltersArgs) => CorporateTreasuryManager_DelegationUpdated_eventFiltersDefinition);

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

export type chainId = number;

export type chain = 10143;

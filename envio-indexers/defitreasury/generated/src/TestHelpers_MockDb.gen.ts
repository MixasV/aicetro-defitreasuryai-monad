/* TypeScript file generated from TestHelpers_MockDb.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpers_MockDbJS = require('./TestHelpers_MockDb.res.js');

import type {AISmartAccountFactory_AccountCreated_t as Entities_AISmartAccountFactory_AccountCreated_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_DailyLimitUpdated_t as Entities_AITreasurySmartAccount_DailyLimitUpdated_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_DelegationConfigured_t as Entities_AITreasurySmartAccount_DelegationConfigured_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_EmergencyRevoke_t as Entities_AITreasurySmartAccount_EmergencyRevoke_t} from '../src/db/Entities.gen';

import type {AITreasurySmartAccount_HighRiskAlert_t as Entities_AITreasurySmartAccount_HighRiskAlert_t} from '../src/db/Entities.gen';

import type {DynamicContractRegistry_t as InternalTable_DynamicContractRegistry_t} from 'envio/src/db/InternalTable.gen';

import type {EmergencyController_EmergencyStatusChanged_t as Entities_EmergencyController_EmergencyStatusChanged_t} from '../src/db/Entities.gen';

import type {EntryPoint_UserOperationEvent_t as Entities_EntryPoint_UserOperationEvent_t} from '../src/db/Entities.gen';

import type {PoolTransaction_t as Entities_PoolTransaction_t} from '../src/db/Entities.gen';

import type {Pool_t as Entities_Pool_t} from '../src/db/Entities.gen';

import type {RawEvents_t as InternalTable_RawEvents_t} from 'envio/src/db/InternalTable.gen';

import type {TrustlessDeFiTreasury_Delegation_t as Entities_TrustlessDeFiTreasury_Delegation_t} from '../src/db/Entities.gen';

import type {TrustlessDeFiTreasury_SpendRecorded_t as Entities_TrustlessDeFiTreasury_SpendRecorded_t} from '../src/db/Entities.gen';

import type {UserPosition_t as Entities_UserPosition_t} from '../src/db/Entities.gen';

import type {eventLog as Types_eventLog} from './Types.gen';

import type {rawEventsKey as InMemoryStore_rawEventsKey} from './InMemoryStore.gen';

/** The mockDb type is simply an InMemoryStore internally. __dbInternal__ holds a reference
to an inMemoryStore and all the the accessor methods point to the reference of that inMemory
store */
export abstract class inMemoryStore { protected opaque!: any }; /* simulate opaque types */

export type t = {
  readonly __dbInternal__: inMemoryStore; 
  readonly entities: entities; 
  readonly rawEvents: storeOperations<InMemoryStore_rawEventsKey,InternalTable_RawEvents_t>; 
  readonly dynamicContractRegistry: entityStoreOperations<InternalTable_DynamicContractRegistry_t>; 
  readonly processEvents: (_1:Types_eventLog<unknown>[]) => Promise<t>
};

export type entities = {
  readonly AISmartAccountFactory_AccountCreated: entityStoreOperations<Entities_AISmartAccountFactory_AccountCreated_t>; 
  readonly AITreasurySmartAccount_DailyLimitUpdated: entityStoreOperations<Entities_AITreasurySmartAccount_DailyLimitUpdated_t>; 
  readonly AITreasurySmartAccount_DelegationConfigured: entityStoreOperations<Entities_AITreasurySmartAccount_DelegationConfigured_t>; 
  readonly AITreasurySmartAccount_EmergencyRevoke: entityStoreOperations<Entities_AITreasurySmartAccount_EmergencyRevoke_t>; 
  readonly AITreasurySmartAccount_HighRiskAlert: entityStoreOperations<Entities_AITreasurySmartAccount_HighRiskAlert_t>; 
  readonly EmergencyController_EmergencyStatusChanged: entityStoreOperations<Entities_EmergencyController_EmergencyStatusChanged_t>; 
  readonly EntryPoint_UserOperationEvent: entityStoreOperations<Entities_EntryPoint_UserOperationEvent_t>; 
  readonly Pool: entityStoreOperations<Entities_Pool_t>; 
  readonly PoolTransaction: entityStoreOperations<Entities_PoolTransaction_t>; 
  readonly TrustlessDeFiTreasury_Delegation: entityStoreOperations<Entities_TrustlessDeFiTreasury_Delegation_t>; 
  readonly TrustlessDeFiTreasury_SpendRecorded: entityStoreOperations<Entities_TrustlessDeFiTreasury_SpendRecorded_t>; 
  readonly UserPosition: entityStoreOperations<Entities_UserPosition_t>
};

export type entityStoreOperations<entity> = storeOperations<string,entity>;

export type storeOperations<entityKey,entity> = {
  readonly getAll: () => entity[]; 
  readonly get: (_1:entityKey) => (undefined | entity); 
  readonly set: (_1:entity) => t; 
  readonly delete: (_1:entityKey) => t
};

/** The constructor function for a mockDb. Call it and then set up the inital state by calling
any of the set functions it provides access to. A mockDb will be passed into a processEvent 
helper. Note, process event helpers will not mutate the mockDb but return a new mockDb with
new state so you can compare states before and after. */
export const createMockDb: () => t = TestHelpers_MockDbJS.createMockDb as any;

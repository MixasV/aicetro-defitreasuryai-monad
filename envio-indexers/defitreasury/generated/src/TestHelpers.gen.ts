/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {CorporateTreasuryManager_CorporateAccountCreated_event as Types_CorporateTreasuryManager_CorporateAccountCreated_event} from './Types.gen';

import type {CorporateTreasuryManager_DelegationSpending_event as Types_CorporateTreasuryManager_DelegationSpending_event} from './Types.gen';

import type {CorporateTreasuryManager_DelegationUpdated_event as Types_CorporateTreasuryManager_DelegationUpdated_event} from './Types.gen';

import type {EmergencyController_EmergencyStatusChanged_event as Types_EmergencyController_EmergencyStatusChanged_event} from './Types.gen';

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

export type CorporateTreasuryManager_CorporateAccountCreated_createMockArgs = {
  readonly account?: Address_t; 
  readonly owners?: Address_t[]; 
  readonly threshold?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type CorporateTreasuryManager_DelegationSpending_createMockArgs = {
  readonly account?: Address_t; 
  readonly amount?: bigint; 
  readonly newSpent?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type CorporateTreasuryManager_DelegationUpdated_createMockArgs = {
  readonly account?: Address_t; 
  readonly delegate?: Address_t; 
  readonly limit?: bigint; 
  readonly active?: boolean; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type EmergencyController_EmergencyStatusChanged_createMockArgs = { readonly paused?: boolean; readonly mockEventData?: EventFunctions_mockEventData };

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const CorporateTreasuryManager_CorporateAccountCreated_processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_CorporateAccountCreated_event> = TestHelpersJS.CorporateTreasuryManager.CorporateAccountCreated.processEvent as any;

export const CorporateTreasuryManager_CorporateAccountCreated_createMockEvent: (args:CorporateTreasuryManager_CorporateAccountCreated_createMockArgs) => Types_CorporateTreasuryManager_CorporateAccountCreated_event = TestHelpersJS.CorporateTreasuryManager.CorporateAccountCreated.createMockEvent as any;

export const CorporateTreasuryManager_DelegationSpending_processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_DelegationSpending_event> = TestHelpersJS.CorporateTreasuryManager.DelegationSpending.processEvent as any;

export const CorporateTreasuryManager_DelegationSpending_createMockEvent: (args:CorporateTreasuryManager_DelegationSpending_createMockArgs) => Types_CorporateTreasuryManager_DelegationSpending_event = TestHelpersJS.CorporateTreasuryManager.DelegationSpending.createMockEvent as any;

export const CorporateTreasuryManager_DelegationUpdated_processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_DelegationUpdated_event> = TestHelpersJS.CorporateTreasuryManager.DelegationUpdated.processEvent as any;

export const CorporateTreasuryManager_DelegationUpdated_createMockEvent: (args:CorporateTreasuryManager_DelegationUpdated_createMockArgs) => Types_CorporateTreasuryManager_DelegationUpdated_event = TestHelpersJS.CorporateTreasuryManager.DelegationUpdated.createMockEvent as any;

export const EmergencyController_EmergencyStatusChanged_processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event> = TestHelpersJS.EmergencyController.EmergencyStatusChanged.processEvent as any;

export const EmergencyController_EmergencyStatusChanged_createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event = TestHelpersJS.EmergencyController.EmergencyStatusChanged.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const EmergencyController: { EmergencyStatusChanged: { processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event>; createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event } } = TestHelpersJS.EmergencyController as any;

export const CorporateTreasuryManager: {
  CorporateAccountCreated: {
    processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_CorporateAccountCreated_event>; 
    createMockEvent: (args:CorporateTreasuryManager_CorporateAccountCreated_createMockArgs) => Types_CorporateTreasuryManager_CorporateAccountCreated_event
  }; 
  DelegationSpending: {
    processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_DelegationSpending_event>; 
    createMockEvent: (args:CorporateTreasuryManager_DelegationSpending_createMockArgs) => Types_CorporateTreasuryManager_DelegationSpending_event
  }; 
  DelegationUpdated: {
    processEvent: EventFunctions_eventProcessor<Types_CorporateTreasuryManager_DelegationUpdated_event>; 
    createMockEvent: (args:CorporateTreasuryManager_DelegationUpdated_createMockArgs) => Types_CorporateTreasuryManager_DelegationUpdated_event
  }
} = TestHelpersJS.CorporateTreasuryManager as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;

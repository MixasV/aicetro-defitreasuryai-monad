/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {EmergencyController_EmergencyStatusChanged_event as Types_EmergencyController_EmergencyStatusChanged_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationGranted_event as Types_TrustlessDeFiTreasury_DelegationGranted_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationPaused_event as Types_TrustlessDeFiTreasury_DelegationPaused_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationResumed_event as Types_TrustlessDeFiTreasury_DelegationResumed_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationRevoked_event as Types_TrustlessDeFiTreasury_DelegationRevoked_event} from './Types.gen';

import type {TrustlessDeFiTreasury_DelegationUpdated_event as Types_TrustlessDeFiTreasury_DelegationUpdated_event} from './Types.gen';

import type {TrustlessDeFiTreasury_SpendRecorded_event as Types_TrustlessDeFiTreasury_SpendRecorded_event} from './Types.gen';

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

export type EmergencyController_EmergencyStatusChanged_createMockArgs = { readonly paused?: boolean; readonly mockEventData?: EventFunctions_mockEventData };

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

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const EmergencyController_EmergencyStatusChanged_processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event> = TestHelpersJS.EmergencyController.EmergencyStatusChanged.processEvent as any;

export const EmergencyController_EmergencyStatusChanged_createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event = TestHelpersJS.EmergencyController.EmergencyStatusChanged.createMockEvent as any;

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

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

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

export const EmergencyController: { EmergencyStatusChanged: { processEvent: EventFunctions_eventProcessor<Types_EmergencyController_EmergencyStatusChanged_event>; createMockEvent: (args:EmergencyController_EmergencyStatusChanged_createMockArgs) => Types_EmergencyController_EmergencyStatusChanged_event } } = TestHelpersJS.EmergencyController as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;

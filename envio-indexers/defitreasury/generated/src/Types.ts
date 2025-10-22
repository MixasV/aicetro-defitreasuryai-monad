// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  readonly AISmartAccountFactory_AccountCreated: {
    /**
     * Load the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AISmartAccountFactory_AccountCreated_t | undefined>,
    /**
     * Load the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AISmartAccountFactory_AccountCreated_t>,
    readonly getWhere: Entities.AISmartAccountFactory_AccountCreated_indexedFieldOperations,
    /**
     * Returns the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AISmartAccountFactory_AccountCreated_t) => Promise<Entities.AISmartAccountFactory_AccountCreated_t>,
    /**
     * Set the entity AISmartAccountFactory_AccountCreated in the storage.
     */
    readonly set: (entity: Entities.AISmartAccountFactory_AccountCreated_t) => void,
    /**
     * Delete the entity AISmartAccountFactory_AccountCreated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_DailyLimitUpdated: {
    /**
     * Load the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t>,
    readonly getWhere: Entities.AITreasurySmartAccount_DailyLimitUpdated_indexedFieldOperations,
    /**
     * Returns the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_DailyLimitUpdated_t) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t>,
    /**
     * Set the entity AITreasurySmartAccount_DailyLimitUpdated in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_DailyLimitUpdated_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_DailyLimitUpdated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_DelegationConfigured: {
    /**
     * Load the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t>,
    readonly getWhere: Entities.AITreasurySmartAccount_DelegationConfigured_indexedFieldOperations,
    /**
     * Returns the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_DelegationConfigured_t) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t>,
    /**
     * Set the entity AITreasurySmartAccount_DelegationConfigured in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_DelegationConfigured_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_DelegationConfigured from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_EmergencyRevoke: {
    /**
     * Load the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t>,
    readonly getWhere: Entities.AITreasurySmartAccount_EmergencyRevoke_indexedFieldOperations,
    /**
     * Returns the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_EmergencyRevoke_t) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t>,
    /**
     * Set the entity AITreasurySmartAccount_EmergencyRevoke in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_EmergencyRevoke_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_EmergencyRevoke from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_HighRiskAlert: {
    /**
     * Load the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t>,
    readonly getWhere: Entities.AITreasurySmartAccount_HighRiskAlert_indexedFieldOperations,
    /**
     * Returns the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_HighRiskAlert_t) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t>,
    /**
     * Set the entity AITreasurySmartAccount_HighRiskAlert in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_HighRiskAlert_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_HighRiskAlert from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly EmergencyController_EmergencyStatusChanged: {
    /**
     * Load the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t | undefined>,
    /**
     * Load the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t>,
    readonly getWhere: Entities.EmergencyController_EmergencyStatusChanged_indexedFieldOperations,
    /**
     * Returns the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.EmergencyController_EmergencyStatusChanged_t) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t>,
    /**
     * Set the entity EmergencyController_EmergencyStatusChanged in the storage.
     */
    readonly set: (entity: Entities.EmergencyController_EmergencyStatusChanged_t) => void,
    /**
     * Delete the entity EmergencyController_EmergencyStatusChanged from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly EntryPoint_UserOperationEvent: {
    /**
     * Load the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.EntryPoint_UserOperationEvent_t | undefined>,
    /**
     * Load the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.EntryPoint_UserOperationEvent_t>,
    readonly getWhere: Entities.EntryPoint_UserOperationEvent_indexedFieldOperations,
    /**
     * Returns the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.EntryPoint_UserOperationEvent_t) => Promise<Entities.EntryPoint_UserOperationEvent_t>,
    /**
     * Set the entity EntryPoint_UserOperationEvent in the storage.
     */
    readonly set: (entity: Entities.EntryPoint_UserOperationEvent_t) => void,
    /**
     * Delete the entity EntryPoint_UserOperationEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Pool: {
    /**
     * Load the entity Pool from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Pool_t | undefined>,
    /**
     * Load the entity Pool from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Pool_t>,
    readonly getWhere: Entities.Pool_indexedFieldOperations,
    /**
     * Returns the entity Pool from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Pool_t) => Promise<Entities.Pool_t>,
    /**
     * Set the entity Pool in the storage.
     */
    readonly set: (entity: Entities.Pool_t) => void,
    /**
     * Delete the entity Pool from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PoolTransaction: {
    /**
     * Load the entity PoolTransaction from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PoolTransaction_t | undefined>,
    /**
     * Load the entity PoolTransaction from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PoolTransaction_t>,
    readonly getWhere: Entities.PoolTransaction_indexedFieldOperations,
    /**
     * Returns the entity PoolTransaction from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PoolTransaction_t) => Promise<Entities.PoolTransaction_t>,
    /**
     * Set the entity PoolTransaction in the storage.
     */
    readonly set: (entity: Entities.PoolTransaction_t) => void,
    /**
     * Delete the entity PoolTransaction from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TrustlessDeFiTreasury_Delegation: {
    /**
     * Load the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t | undefined>,
    /**
     * Load the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t>,
    readonly getWhere: Entities.TrustlessDeFiTreasury_Delegation_indexedFieldOperations,
    /**
     * Returns the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TrustlessDeFiTreasury_Delegation_t) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t>,
    /**
     * Set the entity TrustlessDeFiTreasury_Delegation in the storage.
     */
    readonly set: (entity: Entities.TrustlessDeFiTreasury_Delegation_t) => void,
    /**
     * Delete the entity TrustlessDeFiTreasury_Delegation from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TrustlessDeFiTreasury_SpendRecorded: {
    /**
     * Load the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t | undefined>,
    /**
     * Load the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t>,
    readonly getWhere: Entities.TrustlessDeFiTreasury_SpendRecorded_indexedFieldOperations,
    /**
     * Returns the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TrustlessDeFiTreasury_SpendRecorded_t) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t>,
    /**
     * Set the entity TrustlessDeFiTreasury_SpendRecorded in the storage.
     */
    readonly set: (entity: Entities.TrustlessDeFiTreasury_SpendRecorded_t) => void,
    /**
     * Delete the entity TrustlessDeFiTreasury_SpendRecorded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly UserPosition: {
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.UserPosition_t | undefined>,
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.UserPosition_t>,
    readonly getWhere: Entities.UserPosition_indexedFieldOperations,
    /**
     * Returns the entity UserPosition from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.UserPosition_t) => Promise<Entities.UserPosition_t>,
    /**
     * Set the entity UserPosition in the storage.
     */
    readonly set: (entity: Entities.UserPosition_t) => void,
    /**
     * Delete the entity UserPosition from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  readonly AISmartAccountFactory_AccountCreated: {
    /**
     * Load the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AISmartAccountFactory_AccountCreated_t | undefined>,
    /**
     * Load the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AISmartAccountFactory_AccountCreated_t>,
    /**
     * Returns the entity AISmartAccountFactory_AccountCreated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AISmartAccountFactory_AccountCreated_t) => Promise<Entities.AISmartAccountFactory_AccountCreated_t>,
    /**
     * Set the entity AISmartAccountFactory_AccountCreated in the storage.
     */
    readonly set: (entity: Entities.AISmartAccountFactory_AccountCreated_t) => void,
    /**
     * Delete the entity AISmartAccountFactory_AccountCreated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_DailyLimitUpdated: {
    /**
     * Load the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t>,
    /**
     * Returns the entity AITreasurySmartAccount_DailyLimitUpdated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_DailyLimitUpdated_t) => Promise<Entities.AITreasurySmartAccount_DailyLimitUpdated_t>,
    /**
     * Set the entity AITreasurySmartAccount_DailyLimitUpdated in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_DailyLimitUpdated_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_DailyLimitUpdated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_DelegationConfigured: {
    /**
     * Load the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t>,
    /**
     * Returns the entity AITreasurySmartAccount_DelegationConfigured from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_DelegationConfigured_t) => Promise<Entities.AITreasurySmartAccount_DelegationConfigured_t>,
    /**
     * Set the entity AITreasurySmartAccount_DelegationConfigured in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_DelegationConfigured_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_DelegationConfigured from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_EmergencyRevoke: {
    /**
     * Load the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t>,
    /**
     * Returns the entity AITreasurySmartAccount_EmergencyRevoke from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_EmergencyRevoke_t) => Promise<Entities.AITreasurySmartAccount_EmergencyRevoke_t>,
    /**
     * Set the entity AITreasurySmartAccount_EmergencyRevoke in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_EmergencyRevoke_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_EmergencyRevoke from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly AITreasurySmartAccount_HighRiskAlert: {
    /**
     * Load the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t | undefined>,
    /**
     * Load the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t>,
    /**
     * Returns the entity AITreasurySmartAccount_HighRiskAlert from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.AITreasurySmartAccount_HighRiskAlert_t) => Promise<Entities.AITreasurySmartAccount_HighRiskAlert_t>,
    /**
     * Set the entity AITreasurySmartAccount_HighRiskAlert in the storage.
     */
    readonly set: (entity: Entities.AITreasurySmartAccount_HighRiskAlert_t) => void,
    /**
     * Delete the entity AITreasurySmartAccount_HighRiskAlert from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly EmergencyController_EmergencyStatusChanged: {
    /**
     * Load the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t | undefined>,
    /**
     * Load the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t>,
    /**
     * Returns the entity EmergencyController_EmergencyStatusChanged from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.EmergencyController_EmergencyStatusChanged_t) => Promise<Entities.EmergencyController_EmergencyStatusChanged_t>,
    /**
     * Set the entity EmergencyController_EmergencyStatusChanged in the storage.
     */
    readonly set: (entity: Entities.EmergencyController_EmergencyStatusChanged_t) => void,
    /**
     * Delete the entity EmergencyController_EmergencyStatusChanged from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly EntryPoint_UserOperationEvent: {
    /**
     * Load the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.EntryPoint_UserOperationEvent_t | undefined>,
    /**
     * Load the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.EntryPoint_UserOperationEvent_t>,
    /**
     * Returns the entity EntryPoint_UserOperationEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.EntryPoint_UserOperationEvent_t) => Promise<Entities.EntryPoint_UserOperationEvent_t>,
    /**
     * Set the entity EntryPoint_UserOperationEvent in the storage.
     */
    readonly set: (entity: Entities.EntryPoint_UserOperationEvent_t) => void,
    /**
     * Delete the entity EntryPoint_UserOperationEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Pool: {
    /**
     * Load the entity Pool from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Pool_t | undefined>,
    /**
     * Load the entity Pool from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Pool_t>,
    /**
     * Returns the entity Pool from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Pool_t) => Promise<Entities.Pool_t>,
    /**
     * Set the entity Pool in the storage.
     */
    readonly set: (entity: Entities.Pool_t) => void,
    /**
     * Delete the entity Pool from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PoolTransaction: {
    /**
     * Load the entity PoolTransaction from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PoolTransaction_t | undefined>,
    /**
     * Load the entity PoolTransaction from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PoolTransaction_t>,
    /**
     * Returns the entity PoolTransaction from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PoolTransaction_t) => Promise<Entities.PoolTransaction_t>,
    /**
     * Set the entity PoolTransaction in the storage.
     */
    readonly set: (entity: Entities.PoolTransaction_t) => void,
    /**
     * Delete the entity PoolTransaction from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TrustlessDeFiTreasury_Delegation: {
    /**
     * Load the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t | undefined>,
    /**
     * Load the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t>,
    /**
     * Returns the entity TrustlessDeFiTreasury_Delegation from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TrustlessDeFiTreasury_Delegation_t) => Promise<Entities.TrustlessDeFiTreasury_Delegation_t>,
    /**
     * Set the entity TrustlessDeFiTreasury_Delegation in the storage.
     */
    readonly set: (entity: Entities.TrustlessDeFiTreasury_Delegation_t) => void,
    /**
     * Delete the entity TrustlessDeFiTreasury_Delegation from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TrustlessDeFiTreasury_SpendRecorded: {
    /**
     * Load the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t | undefined>,
    /**
     * Load the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t>,
    /**
     * Returns the entity TrustlessDeFiTreasury_SpendRecorded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TrustlessDeFiTreasury_SpendRecorded_t) => Promise<Entities.TrustlessDeFiTreasury_SpendRecorded_t>,
    /**
     * Set the entity TrustlessDeFiTreasury_SpendRecorded in the storage.
     */
    readonly set: (entity: Entities.TrustlessDeFiTreasury_SpendRecorded_t) => void,
    /**
     * Delete the entity TrustlessDeFiTreasury_SpendRecorded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly UserPosition: {
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.UserPosition_t | undefined>,
    /**
     * Load the entity UserPosition from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.UserPosition_t>,
    /**
     * Returns the entity UserPosition from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.UserPosition_t) => Promise<Entities.UserPosition_t>,
    /**
     * Set the entity UserPosition in the storage.
     */
    readonly set: (entity: Entities.UserPosition_t) => void,
    /**
     * Delete the entity UserPosition from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

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
  readonly CorporateTreasuryManager_CorporateAccountCreated: {
    /**
     * Load the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t>,
    readonly getWhere: Entities.CorporateTreasuryManager_CorporateAccountCreated_indexedFieldOperations,
    /**
     * Returns the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_CorporateAccountCreated_t) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t>,
    /**
     * Set the entity CorporateTreasuryManager_CorporateAccountCreated in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_CorporateAccountCreated_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_CorporateAccountCreated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly CorporateTreasuryManager_DelegationSpending: {
    /**
     * Load the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t>,
    readonly getWhere: Entities.CorporateTreasuryManager_DelegationSpending_indexedFieldOperations,
    /**
     * Returns the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_DelegationSpending_t) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t>,
    /**
     * Set the entity CorporateTreasuryManager_DelegationSpending in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_DelegationSpending_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_DelegationSpending from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly CorporateTreasuryManager_DelegationUpdated: {
    /**
     * Load the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t>,
    readonly getWhere: Entities.CorporateTreasuryManager_DelegationUpdated_indexedFieldOperations,
    /**
     * Returns the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_DelegationUpdated_t) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t>,
    /**
     * Set the entity CorporateTreasuryManager_DelegationUpdated in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_DelegationUpdated_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_DelegationUpdated from the storage.
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
  readonly CorporateTreasuryManager_CorporateAccountCreated: {
    /**
     * Load the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t>,
    /**
     * Returns the entity CorporateTreasuryManager_CorporateAccountCreated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_CorporateAccountCreated_t) => Promise<Entities.CorporateTreasuryManager_CorporateAccountCreated_t>,
    /**
     * Set the entity CorporateTreasuryManager_CorporateAccountCreated in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_CorporateAccountCreated_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_CorporateAccountCreated from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly CorporateTreasuryManager_DelegationSpending: {
    /**
     * Load the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t>,
    /**
     * Returns the entity CorporateTreasuryManager_DelegationSpending from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_DelegationSpending_t) => Promise<Entities.CorporateTreasuryManager_DelegationSpending_t>,
    /**
     * Set the entity CorporateTreasuryManager_DelegationSpending in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_DelegationSpending_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_DelegationSpending from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly CorporateTreasuryManager_DelegationUpdated: {
    /**
     * Load the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t | undefined>,
    /**
     * Load the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t>,
    /**
     * Returns the entity CorporateTreasuryManager_DelegationUpdated from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.CorporateTreasuryManager_DelegationUpdated_t) => Promise<Entities.CorporateTreasuryManager_DelegationUpdated_t>,
    /**
     * Set the entity CorporateTreasuryManager_DelegationUpdated in the storage.
     */
    readonly set: (entity: Entities.CorporateTreasuryManager_DelegationUpdated_t) => void,
    /**
     * Delete the entity CorporateTreasuryManager_DelegationUpdated from the storage.
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
};

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
};

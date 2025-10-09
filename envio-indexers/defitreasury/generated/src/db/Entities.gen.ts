/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type CorporateTreasuryManager_CorporateAccountCreated_t = {
  readonly account: string; 
  readonly id: id; 
  readonly owners: string[]; 
  readonly threshold: bigint
};

export type CorporateTreasuryManager_CorporateAccountCreated_indexedFieldOperations = {};

export type CorporateTreasuryManager_DelegationSpending_t = {
  readonly account: string; 
  readonly amount: bigint; 
  readonly id: id; 
  readonly newSpent: bigint
};

export type CorporateTreasuryManager_DelegationSpending_indexedFieldOperations = {};

export type CorporateTreasuryManager_DelegationUpdated_t = {
  readonly account: string; 
  readonly active: boolean; 
  readonly delegate: string; 
  readonly id: id; 
  readonly limit: bigint
};

export type CorporateTreasuryManager_DelegationUpdated_indexedFieldOperations = {};

export type EmergencyController_EmergencyStatusChanged_t = { readonly id: id; readonly paused: boolean };

export type EmergencyController_EmergencyStatusChanged_indexedFieldOperations = {};

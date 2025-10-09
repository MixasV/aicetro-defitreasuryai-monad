module ContractType = {
  @genType
  type t = 
    | @as("CorporateTreasuryManager") CorporateTreasuryManager
    | @as("EmergencyController") EmergencyController

  let name = "CONTRACT_TYPE"
  let variants = [
    CorporateTreasuryManager,
    EmergencyController,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("CorporateTreasuryManager_CorporateAccountCreated") CorporateTreasuryManager_CorporateAccountCreated
    | @as("CorporateTreasuryManager_DelegationSpending") CorporateTreasuryManager_DelegationSpending
    | @as("CorporateTreasuryManager_DelegationUpdated") CorporateTreasuryManager_DelegationUpdated
    | @as("EmergencyController_EmergencyStatusChanged") EmergencyController_EmergencyStatusChanged
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    CorporateTreasuryManager_CorporateAccountCreated,
    CorporateTreasuryManager_DelegationSpending,
    CorporateTreasuryManager_DelegationUpdated,
    EmergencyController_EmergencyStatusChanged,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])

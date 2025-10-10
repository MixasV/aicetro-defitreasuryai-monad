module ContractType = {
  @genType
  type t = 
    | @as("EmergencyController") EmergencyController
    | @as("TrustlessDeFiTreasury") TrustlessDeFiTreasury

  let name = "CONTRACT_TYPE"
  let variants = [
    EmergencyController,
    TrustlessDeFiTreasury,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("EmergencyController_EmergencyStatusChanged") EmergencyController_EmergencyStatusChanged
    | @as("TrustlessDeFiTreasury_Delegation") TrustlessDeFiTreasury_Delegation
    | @as("TrustlessDeFiTreasury_SpendRecorded") TrustlessDeFiTreasury_SpendRecorded
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    EmergencyController_EmergencyStatusChanged,
    TrustlessDeFiTreasury_Delegation,
    TrustlessDeFiTreasury_SpendRecorded,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])

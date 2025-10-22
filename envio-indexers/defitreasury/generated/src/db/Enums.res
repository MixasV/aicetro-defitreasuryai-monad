module ContractType = {
  @genType
  type t = 
    | @as("AISmartAccountFactory") AISmartAccountFactory
    | @as("AITreasurySmartAccount") AITreasurySmartAccount
    | @as("EmergencyController") EmergencyController
    | @as("EntryPoint") EntryPoint
    | @as("NablaUSDCPool") NablaUSDCPool
    | @as("NablaUSDTPool") NablaUSDTPool
    | @as("NablaWBTCPool") NablaWBTCPool
    | @as("TrustlessDeFiTreasury") TrustlessDeFiTreasury
    | @as("UniswapV2Factory") UniswapV2Factory
    | @as("UniswapV2Pair_USDC_USDT") UniswapV2Pair_USDC_USDT
    | @as("UniswapV2Pair_USDC_WMON") UniswapV2Pair_USDC_WMON

  let name = "CONTRACT_TYPE"
  let variants = [
    AISmartAccountFactory,
    AITreasurySmartAccount,
    EmergencyController,
    EntryPoint,
    NablaUSDCPool,
    NablaUSDTPool,
    NablaWBTCPool,
    TrustlessDeFiTreasury,
    UniswapV2Factory,
    UniswapV2Pair_USDC_USDT,
    UniswapV2Pair_USDC_WMON,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("AISmartAccountFactory_AccountCreated") AISmartAccountFactory_AccountCreated
    | @as("AITreasurySmartAccount_DailyLimitUpdated") AITreasurySmartAccount_DailyLimitUpdated
    | @as("AITreasurySmartAccount_DelegationConfigured") AITreasurySmartAccount_DelegationConfigured
    | @as("AITreasurySmartAccount_EmergencyRevoke") AITreasurySmartAccount_EmergencyRevoke
    | @as("AITreasurySmartAccount_HighRiskAlert") AITreasurySmartAccount_HighRiskAlert
    | @as("EmergencyController_EmergencyStatusChanged") EmergencyController_EmergencyStatusChanged
    | @as("EntryPoint_UserOperationEvent") EntryPoint_UserOperationEvent
    | @as("Pool") Pool
    | @as("PoolTransaction") PoolTransaction
    | @as("TrustlessDeFiTreasury_Delegation") TrustlessDeFiTreasury_Delegation
    | @as("TrustlessDeFiTreasury_SpendRecorded") TrustlessDeFiTreasury_SpendRecorded
    | @as("UserPosition") UserPosition
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    AISmartAccountFactory_AccountCreated,
    AITreasurySmartAccount_DailyLimitUpdated,
    AITreasurySmartAccount_DelegationConfigured,
    AITreasurySmartAccount_EmergencyRevoke,
    AITreasurySmartAccount_HighRiskAlert,
    EmergencyController_EmergencyStatusChanged,
    EntryPoint_UserOperationEvent,
    Pool,
    PoolTransaction,
    TrustlessDeFiTreasury_Delegation,
    TrustlessDeFiTreasury_SpendRecorded,
    UserPosition,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])

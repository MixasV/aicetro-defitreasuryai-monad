
type hyperSyncConfig = {endpointUrl: string}
type hyperFuelConfig = {endpointUrl: string}

@genType.opaque
type rpcConfig = {
  syncConfig: InternalConfig.sourceSync,
}

@genType
type syncSource = HyperSync(hyperSyncConfig) | HyperFuel(hyperFuelConfig) | Rpc(rpcConfig)

@genType.opaque
type aliasAbi = Ethers.abi

type eventName = string

type contract = {
  name: string,
  abi: aliasAbi,
  addresses: array<string>,
  events: array<eventName>,
}

type configYaml = {
  syncSource,
  startBlock: int,
  confirmedBlockThreshold: int,
  contracts: dict<contract>,
  lowercaseAddresses: bool,
}

let publicConfig = ChainMap.fromArrayUnsafe([
  {
    let contracts = Js.Dict.fromArray([
      (
        "CorporateTreasuryManager",
        {
          name: "CorporateTreasuryManager",
          abi: Types.CorporateTreasuryManager.abi,
          addresses: [
            "0x98691ae190682dddBde3cd4c493B2249D2086E5B",
          ],
          events: [
            Types.CorporateTreasuryManager.CorporateAccountCreated.name,
            Types.CorporateTreasuryManager.DelegationSpending.name,
            Types.CorporateTreasuryManager.DelegationUpdated.name,
          ],
        }
      ),
      (
        "EmergencyController",
        {
          name: "EmergencyController",
          abi: Types.EmergencyController.abi,
          addresses: [
            "0x4BE4FE572bAce94aaFF05e4a0c03ff79212C20e5",
          ],
          events: [
            Types.EmergencyController.EmergencyStatusChanged.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=10143)
    (
      chain,
      {
        confirmedBlockThreshold: 200,
        syncSource: HyperSync({endpointUrl: "https://10143.hypersync.xyz"}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
])

@genType
let getGeneratedByChainId: int => configYaml = chainId => {
  let chain = ChainMap.Chain.makeUnsafe(~chainId)
  if !(publicConfig->ChainMap.has(chain)) {
    Js.Exn.raiseError(
      "No chain with id " ++ chain->ChainMap.Chain.toString ++ " found in config.yaml",
    )
  }
  publicConfig->ChainMap.get(chain)
}

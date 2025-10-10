
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
        "TrustlessDeFiTreasury",
        {
          name: "TrustlessDeFiTreasury",
          abi: Types.TrustlessDeFiTreasury.abi,
          addresses: [
            "0x5a531079eCe02e2bBF83853027d135d9f80fEdDA",
          ],
          events: [
            Types.TrustlessDeFiTreasury.DelegationGranted.name,
            Types.TrustlessDeFiTreasury.DelegationUpdated.name,
            Types.TrustlessDeFiTreasury.DelegationRevoked.name,
            Types.TrustlessDeFiTreasury.DelegationPaused.name,
            Types.TrustlessDeFiTreasury.DelegationResumed.name,
            Types.TrustlessDeFiTreasury.SpendRecorded.name,
          ],
        }
      ),
      (
        "EmergencyController",
        {
          name: "EmergencyController",
          abi: Types.EmergencyController.abi,
          addresses: [
            "0x720ea3508f015768df891E2692437D1C60725F02",
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

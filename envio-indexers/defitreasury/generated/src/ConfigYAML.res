
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
      (
        "EntryPoint",
        {
          name: "EntryPoint",
          abi: Types.EntryPoint.abi,
          addresses: [
            "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
          ],
          events: [
            Types.EntryPoint.UserOperationEvent.name,
          ],
        }
      ),
      (
        "AISmartAccountFactory",
        {
          name: "AISmartAccountFactory",
          abi: Types.AISmartAccountFactory.abi,
          addresses: [
            "0xf2200e301d66a3E77C370A813bea612d064EB64D",
          ],
          events: [
            Types.AISmartAccountFactory.AccountCreated.name,
          ],
        }
      ),
      (
        "AITreasurySmartAccount",
        {
          name: "AITreasurySmartAccount",
          abi: Types.AITreasurySmartAccount.abi,
          addresses: [
            "0xeCAa3fd31db6530239D35aB69618f28EBB4770f3",
          ],
          events: [
            Types.AITreasurySmartAccount.DailyLimitUpdated.name,
            Types.AITreasurySmartAccount.EmergencyRevoke.name,
            Types.AITreasurySmartAccount.HighRiskAlert.name,
            Types.AITreasurySmartAccount.DelegationConfigured.name,
          ],
        }
      ),
      (
        "NablaUSDCPool",
        {
          name: "NablaUSDCPool",
          abi: Types.NablaUSDCPool.abi,
          addresses: [
            "0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426",
          ],
          events: [
            Types.NablaUSDCPool.Deposit.name,
            Types.NablaUSDCPool.Withdraw.name,
            Types.NablaUSDCPool.Swap.name,
          ],
        }
      ),
      (
        "NablaUSDTPool",
        {
          name: "NablaUSDTPool",
          abi: Types.NablaUSDTPool.abi,
          addresses: [
            "0x356Fa6Db41717eccE81e7732A42eB4E99AE0D7D9",
          ],
          events: [
            Types.NablaUSDTPool.Deposit.name,
            Types.NablaUSDTPool.Withdraw.name,
            Types.NablaUSDTPool.Swap.name,
          ],
        }
      ),
      (
        "NablaWBTCPool",
        {
          name: "NablaWBTCPool",
          abi: Types.NablaWBTCPool.abi,
          addresses: [
            "0x5b90901818F0d92825F8b19409323C82ABe911FC",
          ],
          events: [
            Types.NablaWBTCPool.Deposit.name,
            Types.NablaWBTCPool.Withdraw.name,
            Types.NablaWBTCPool.Swap.name,
          ],
        }
      ),
      (
        "UniswapV2Factory",
        {
          name: "UniswapV2Factory",
          abi: Types.UniswapV2Factory.abi,
          addresses: [
            "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0",
          ],
          events: [
            Types.UniswapV2Factory.PairCreated.name,
          ],
        }
      ),
      (
        "UniswapV2Pair_USDC_USDT",
        {
          name: "UniswapV2Pair_USDC_USDT",
          abi: Types.UniswapV2Pair_USDC_USDT.abi,
          addresses: [
            "0x3D44D591C8FC89daE3bc5f312c67CA0b44497b86",
          ],
          events: [
            Types.UniswapV2Pair_USDC_USDT.Mint.name,
            Types.UniswapV2Pair_USDC_USDT.Burn.name,
            Types.UniswapV2Pair_USDC_USDT.Swap.name,
            Types.UniswapV2Pair_USDC_USDT.Sync.name,
          ],
        }
      ),
      (
        "UniswapV2Pair_USDC_WMON",
        {
          name: "UniswapV2Pair_USDC_WMON",
          abi: Types.UniswapV2Pair_USDC_WMON.abi,
          addresses: [
            "0x5323821dE342c56b80c99fbc7cD725f2da8eB87B",
          ],
          events: [
            Types.UniswapV2Pair_USDC_WMON.Mint.name,
            Types.UniswapV2Pair_USDC_WMON.Burn.name,
            Types.UniswapV2Pair_USDC_WMON.Swap.name,
            Types.UniswapV2Pair_USDC_WMON.Sync.name,
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

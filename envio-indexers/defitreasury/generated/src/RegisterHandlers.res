@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            InternalConfig.name: "TrustlessDeFiTreasury",
            abi: Types.TrustlessDeFiTreasury.abi,
            addresses: [
              "0x5a531079eCe02e2bBF83853027d135d9f80fEdDA"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.TrustlessDeFiTreasury.DelegationGranted.register() :> Internal.eventConfig),
              (Types.TrustlessDeFiTreasury.DelegationUpdated.register() :> Internal.eventConfig),
              (Types.TrustlessDeFiTreasury.DelegationRevoked.register() :> Internal.eventConfig),
              (Types.TrustlessDeFiTreasury.DelegationPaused.register() :> Internal.eventConfig),
              (Types.TrustlessDeFiTreasury.DelegationResumed.register() :> Internal.eventConfig),
              (Types.TrustlessDeFiTreasury.SpendRecorded.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "EmergencyController",
            abi: Types.EmergencyController.abi,
            addresses: [
              "0x720ea3508f015768df891E2692437D1C60725F02"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.EmergencyController.EmergencyStatusChanged.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "EntryPoint",
            abi: Types.EntryPoint.abi,
            addresses: [
              "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.EntryPoint.UserOperationEvent.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "AISmartAccountFactory",
            abi: Types.AISmartAccountFactory.abi,
            addresses: [
              "0xf2200e301d66a3E77C370A813bea612d064EB64D"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.AISmartAccountFactory.AccountCreated.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "AITreasurySmartAccount",
            abi: Types.AITreasurySmartAccount.abi,
            addresses: [
              "0xeCAa3fd31db6530239D35aB69618f28EBB4770f3"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.AITreasurySmartAccount.DailyLimitUpdated.register() :> Internal.eventConfig),
              (Types.AITreasurySmartAccount.EmergencyRevoke.register() :> Internal.eventConfig),
              (Types.AITreasurySmartAccount.HighRiskAlert.register() :> Internal.eventConfig),
              (Types.AITreasurySmartAccount.DelegationConfigured.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "NablaUSDCPool",
            abi: Types.NablaUSDCPool.abi,
            addresses: [
              "0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.NablaUSDCPool.Deposit.register() :> Internal.eventConfig),
              (Types.NablaUSDCPool.Withdraw.register() :> Internal.eventConfig),
              (Types.NablaUSDCPool.Swap.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "NablaUSDTPool",
            abi: Types.NablaUSDTPool.abi,
            addresses: [
              "0x356Fa6Db41717eccE81e7732A42eB4E99AE0D7D9"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.NablaUSDTPool.Deposit.register() :> Internal.eventConfig),
              (Types.NablaUSDTPool.Withdraw.register() :> Internal.eventConfig),
              (Types.NablaUSDTPool.Swap.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "NablaWBTCPool",
            abi: Types.NablaWBTCPool.abi,
            addresses: [
              "0x5b90901818F0d92825F8b19409323C82ABe911FC"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.NablaWBTCPool.Deposit.register() :> Internal.eventConfig),
              (Types.NablaWBTCPool.Withdraw.register() :> Internal.eventConfig),
              (Types.NablaWBTCPool.Swap.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "UniswapV2Factory",
            abi: Types.UniswapV2Factory.abi,
            addresses: [
              "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.UniswapV2Factory.PairCreated.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "UniswapV2Pair_USDC_USDT",
            abi: Types.UniswapV2Pair_USDC_USDT.abi,
            addresses: [
              "0x3D44D591C8FC89daE3bc5f312c67CA0b44497b86"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.UniswapV2Pair_USDC_USDT.Mint.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_USDT.Burn.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_USDT.Swap.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_USDT.Sync.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "UniswapV2Pair_USDC_WMON",
            abi: Types.UniswapV2Pair_USDC_WMON.abi,
            addresses: [
              "0x5323821dE342c56b80c99fbc7cD725f2da8eB87B"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.UniswapV2Pair_USDC_WMON.Mint.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_WMON.Burn.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_WMON.Swap.register() :> Internal.eventConfig),
              (Types.UniswapV2Pair_USDC_WMON.Sync.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=10143)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 0,
          id: 10143,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "TrustlessDeFiTreasury",events: [Types.TrustlessDeFiTreasury.DelegationGranted.register(), Types.TrustlessDeFiTreasury.DelegationUpdated.register(), Types.TrustlessDeFiTreasury.DelegationRevoked.register(), Types.TrustlessDeFiTreasury.DelegationPaused.register(), Types.TrustlessDeFiTreasury.DelegationResumed.register(), Types.TrustlessDeFiTreasury.SpendRecorded.register()],abi: Types.TrustlessDeFiTreasury.abi}, {name: "EmergencyController",events: [Types.EmergencyController.EmergencyStatusChanged.register()],abi: Types.EmergencyController.abi}, {name: "EntryPoint",events: [Types.EntryPoint.UserOperationEvent.register()],abi: Types.EntryPoint.abi}, {name: "AISmartAccountFactory",events: [Types.AISmartAccountFactory.AccountCreated.register()],abi: Types.AISmartAccountFactory.abi}, {name: "AITreasurySmartAccount",events: [Types.AITreasurySmartAccount.DailyLimitUpdated.register(), Types.AITreasurySmartAccount.EmergencyRevoke.register(), Types.AITreasurySmartAccount.HighRiskAlert.register(), Types.AITreasurySmartAccount.DelegationConfigured.register()],abi: Types.AITreasurySmartAccount.abi}, {name: "NablaUSDCPool",events: [Types.NablaUSDCPool.Deposit.register(), Types.NablaUSDCPool.Withdraw.register(), Types.NablaUSDCPool.Swap.register()],abi: Types.NablaUSDCPool.abi}, {name: "NablaUSDTPool",events: [Types.NablaUSDTPool.Deposit.register(), Types.NablaUSDTPool.Withdraw.register(), Types.NablaUSDTPool.Swap.register()],abi: Types.NablaUSDTPool.abi}, {name: "NablaWBTCPool",events: [Types.NablaWBTCPool.Deposit.register(), Types.NablaWBTCPool.Withdraw.register(), Types.NablaWBTCPool.Swap.register()],abi: Types.NablaWBTCPool.abi}, {name: "UniswapV2Factory",events: [Types.UniswapV2Factory.PairCreated.register()],abi: Types.UniswapV2Factory.abi}, {name: "UniswapV2Pair_USDC_USDT",events: [Types.UniswapV2Pair_USDC_USDT.Mint.register(), Types.UniswapV2Pair_USDC_USDT.Burn.register(), Types.UniswapV2Pair_USDC_USDT.Swap.register(), Types.UniswapV2Pair_USDC_USDT.Sync.register()],abi: Types.UniswapV2Pair_USDC_USDT.abi}, {name: "UniswapV2Pair_USDC_WMON",events: [Types.UniswapV2Pair_USDC_WMON.Mint.register(), Types.UniswapV2Pair_USDC_WMON.Burn.register(), Types.UniswapV2Pair_USDC_WMON.Swap.register(), Types.UniswapV2Pair_USDC_WMON.Sync.register()],abi: Types.UniswapV2Pair_USDC_WMON.abi}], ~hyperSync=Some("https://10143.hypersync.xyz"), ~allEventSignatures=[Types.TrustlessDeFiTreasury.eventSignatures, Types.EmergencyController.eventSignatures, Types.EntryPoint.eventSignatures, Types.AISmartAccountFactory.eventSignatures, Types.AITreasurySmartAccount.eventSignatures, Types.NablaUSDCPool.eventSignatures, Types.NablaUSDTPool.eventSignatures, Types.NablaWBTCPool.eventSignatures, Types.UniswapV2Factory.eventSignatures, Types.UniswapV2Pair_USDC_USDT.eventSignatures, Types.UniswapV2Pair_USDC_WMON.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://testnet-rpc.monad.xyz", sourceFor: Fallback, syncConfig: {}}], ~lowercaseAddresses=false)
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=false,
      ~chains,
      ~enableRawEvents=false,
      ~batchSize=?Env.batchSize,
      ~preloadHandlers=false,
      ~lowercaseAddresses=false,
      ~shouldUseHypersyncClientDecoder=true,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  let configWithoutRegistrations = makeGeneratedConfig()
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="AISmartAccountFactory",
    ~handlerPathRelativeToRoot="src/mappings/smartAccountFactory.ts",
    ~handlerPathRelativeToConfig="src/mappings/smartAccountFactory.ts",
  )
  registerContractHandlers(
    ~contractName="AITreasurySmartAccount",
    ~handlerPathRelativeToRoot="src/mappings/smartAccount.ts",
    ~handlerPathRelativeToConfig="src/mappings/smartAccount.ts",
  )
  registerContractHandlers(
    ~contractName="EmergencyController",
    ~handlerPathRelativeToRoot="src/mappings/emergencyController.ts",
    ~handlerPathRelativeToConfig="src/mappings/emergencyController.ts",
  )
  registerContractHandlers(
    ~contractName="EntryPoint",
    ~handlerPathRelativeToRoot="src/mappings/entryPoint.ts",
    ~handlerPathRelativeToConfig="src/mappings/entryPoint.ts",
  )
  registerContractHandlers(
    ~contractName="NablaUSDCPool",
    ~handlerPathRelativeToRoot="src/mappings/nablaPool.ts",
    ~handlerPathRelativeToConfig="src/mappings/nablaPool.ts",
  )
  registerContractHandlers(
    ~contractName="NablaUSDTPool",
    ~handlerPathRelativeToRoot="src/mappings/nablaPool.ts",
    ~handlerPathRelativeToConfig="src/mappings/nablaPool.ts",
  )
  registerContractHandlers(
    ~contractName="NablaWBTCPool",
    ~handlerPathRelativeToRoot="src/mappings/nablaPool.ts",
    ~handlerPathRelativeToConfig="src/mappings/nablaPool.ts",
  )
  registerContractHandlers(
    ~contractName="TrustlessDeFiTreasury",
    ~handlerPathRelativeToRoot="src/mappings/trustlessDeFiTreasury.ts",
    ~handlerPathRelativeToConfig="src/mappings/trustlessDeFiTreasury.ts",
  )
  registerContractHandlers(
    ~contractName="UniswapV2Factory",
    ~handlerPathRelativeToRoot="src/mappings/uniswapFactory.ts",
    ~handlerPathRelativeToConfig="src/mappings/uniswapFactory.ts",
  )
  registerContractHandlers(
    ~contractName="UniswapV2Pair_USDC_USDT",
    ~handlerPathRelativeToRoot="src/mappings/uniswapPair.ts",
    ~handlerPathRelativeToConfig="src/mappings/uniswapPair.ts",
  )
  registerContractHandlers(
    ~contractName="UniswapV2Pair_USDC_WMON",
    ~handlerPathRelativeToRoot="src/mappings/uniswapPair.ts",
    ~handlerPathRelativeToConfig="src/mappings/uniswapPair.ts",
  )

  let generatedConfig = {
    // Need to recreate initial config one more time,
    // since configWithoutRegistrations called register for event
    // before they were ready
    ...makeGeneratedConfig(),
    registrations: Some(EventRegister.finishRegistration()),
  }
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

let getConfigWithoutRegistrations = makeGeneratedConfig

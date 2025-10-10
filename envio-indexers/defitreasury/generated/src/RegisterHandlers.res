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
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=10143)
        {
          InternalConfig.confirmedBlockThreshold: 200,
          startBlock: 0,
          id: 10143,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "TrustlessDeFiTreasury",events: [Types.TrustlessDeFiTreasury.DelegationGranted.register(), Types.TrustlessDeFiTreasury.DelegationUpdated.register(), Types.TrustlessDeFiTreasury.DelegationRevoked.register(), Types.TrustlessDeFiTreasury.DelegationPaused.register(), Types.TrustlessDeFiTreasury.DelegationResumed.register(), Types.TrustlessDeFiTreasury.SpendRecorded.register()],abi: Types.TrustlessDeFiTreasury.abi}, {name: "EmergencyController",events: [Types.EmergencyController.EmergencyStatusChanged.register()],abi: Types.EmergencyController.abi}], ~hyperSync=Some("https://10143.hypersync.xyz"), ~allEventSignatures=[Types.TrustlessDeFiTreasury.eventSignatures, Types.EmergencyController.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://testnet-rpc.monad.xyz", sourceFor: Fallback, syncConfig: {}}], ~lowercaseAddresses=false)
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
    ~contractName="EmergencyController",
    ~handlerPathRelativeToRoot="src/mappings/emergencyController.ts",
    ~handlerPathRelativeToConfig="src/mappings/emergencyController.ts",
  )
  registerContractHandlers(
    ~contractName="TrustlessDeFiTreasury",
    ~handlerPathRelativeToRoot="src/mappings/trustlessDeFiTreasury.ts",
    ~handlerPathRelativeToConfig="src/mappings/trustlessDeFiTreasury.ts",
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

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
            InternalConfig.name: "CorporateTreasuryManager",
            abi: Types.CorporateTreasuryManager.abi,
            addresses: [
              "0x98691ae190682dddBde3cd4c493B2249D2086E5B"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.CorporateTreasuryManager.CorporateAccountCreated.register() :> Internal.eventConfig),
              (Types.CorporateTreasuryManager.DelegationSpending.register() :> Internal.eventConfig),
              (Types.CorporateTreasuryManager.DelegationUpdated.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
          {
            InternalConfig.name: "EmergencyController",
            abi: Types.EmergencyController.abi,
            addresses: [
              "0x4BE4FE572bAce94aaFF05e4a0c03ff79212C20e5"->Address.Evm.fromStringOrThrow
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
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "CorporateTreasuryManager",events: [Types.CorporateTreasuryManager.CorporateAccountCreated.register(), Types.CorporateTreasuryManager.DelegationSpending.register(), Types.CorporateTreasuryManager.DelegationUpdated.register()],abi: Types.CorporateTreasuryManager.abi}, {name: "EmergencyController",events: [Types.EmergencyController.EmergencyStatusChanged.register()],abi: Types.EmergencyController.abi}], ~hyperSync=Some("https://10143.hypersync.xyz"), ~allEventSignatures=[Types.CorporateTreasuryManager.eventSignatures, Types.EmergencyController.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://testnet-rpc.monad.xyz", sourceFor: Fallback, syncConfig: {}}], ~lowercaseAddresses=false)
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
    ~contractName="CorporateTreasuryManager",
    ~handlerPathRelativeToRoot="src/mappings/corporateTreasuryManager.ts",
    ~handlerPathRelativeToConfig="src/mappings/corporateTreasuryManager.ts",
  )
  registerContractHandlers(
    ~contractName="EmergencyController",
    ~handlerPathRelativeToRoot="src/mappings/emergencyController.ts",
    ~handlerPathRelativeToConfig="src/mappings/emergencyController.ts",
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

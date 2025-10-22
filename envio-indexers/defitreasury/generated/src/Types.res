//*************
//***ENTITIES**
//*************
@genType.as("Id")
type id = string

@genType
type contractRegistrations = {
  log: Envio.logger,
  // TODO: only add contracts we've registered for the event in the config
  addAISmartAccountFactory: (Address.t) => unit,
  addAITreasurySmartAccount: (Address.t) => unit,
  addEmergencyController: (Address.t) => unit,
  addEntryPoint: (Address.t) => unit,
  addNablaUSDCPool: (Address.t) => unit,
  addNablaUSDTPool: (Address.t) => unit,
  addNablaWBTCPool: (Address.t) => unit,
  addTrustlessDeFiTreasury: (Address.t) => unit,
  addUniswapV2Factory: (Address.t) => unit,
  addUniswapV2Pair_USDC_USDT: (Address.t) => unit,
  addUniswapV2Pair_USDC_WMON: (Address.t) => unit,
}

@genType
type entityLoaderContext<'entity, 'indexedFieldOperations> = {
  get: id => promise<option<'entity>>,
  getOrThrow: (id, ~message: string=?) => promise<'entity>,
  getWhere: 'indexedFieldOperations,
  getOrCreate: ('entity) => promise<'entity>,
  set: 'entity => unit,
  deleteUnsafe: id => unit,
}

@genType.import(("./Types.ts", "LoaderContext"))
type loaderContext = {
  log: Envio.logger,
  effect: 'input 'output. (Envio.effect<'input, 'output>, 'input) => promise<'output>,
  isPreload: bool,
  @as("AISmartAccountFactory_AccountCreated") aISmartAccountFactory_AccountCreated: entityLoaderContext<Entities.AISmartAccountFactory_AccountCreated.t, Entities.AISmartAccountFactory_AccountCreated.indexedFieldOperations>,
  @as("AITreasurySmartAccount_DailyLimitUpdated") aITreasurySmartAccount_DailyLimitUpdated: entityLoaderContext<Entities.AITreasurySmartAccount_DailyLimitUpdated.t, Entities.AITreasurySmartAccount_DailyLimitUpdated.indexedFieldOperations>,
  @as("AITreasurySmartAccount_DelegationConfigured") aITreasurySmartAccount_DelegationConfigured: entityLoaderContext<Entities.AITreasurySmartAccount_DelegationConfigured.t, Entities.AITreasurySmartAccount_DelegationConfigured.indexedFieldOperations>,
  @as("AITreasurySmartAccount_EmergencyRevoke") aITreasurySmartAccount_EmergencyRevoke: entityLoaderContext<Entities.AITreasurySmartAccount_EmergencyRevoke.t, Entities.AITreasurySmartAccount_EmergencyRevoke.indexedFieldOperations>,
  @as("AITreasurySmartAccount_HighRiskAlert") aITreasurySmartAccount_HighRiskAlert: entityLoaderContext<Entities.AITreasurySmartAccount_HighRiskAlert.t, Entities.AITreasurySmartAccount_HighRiskAlert.indexedFieldOperations>,
  @as("EmergencyController_EmergencyStatusChanged") emergencyController_EmergencyStatusChanged: entityLoaderContext<Entities.EmergencyController_EmergencyStatusChanged.t, Entities.EmergencyController_EmergencyStatusChanged.indexedFieldOperations>,
  @as("EntryPoint_UserOperationEvent") entryPoint_UserOperationEvent: entityLoaderContext<Entities.EntryPoint_UserOperationEvent.t, Entities.EntryPoint_UserOperationEvent.indexedFieldOperations>,
  @as("Pool") pool: entityLoaderContext<Entities.Pool.t, Entities.Pool.indexedFieldOperations>,
  @as("PoolTransaction") poolTransaction: entityLoaderContext<Entities.PoolTransaction.t, Entities.PoolTransaction.indexedFieldOperations>,
  @as("TrustlessDeFiTreasury_Delegation") trustlessDeFiTreasury_Delegation: entityLoaderContext<Entities.TrustlessDeFiTreasury_Delegation.t, Entities.TrustlessDeFiTreasury_Delegation.indexedFieldOperations>,
  @as("TrustlessDeFiTreasury_SpendRecorded") trustlessDeFiTreasury_SpendRecorded: entityLoaderContext<Entities.TrustlessDeFiTreasury_SpendRecorded.t, Entities.TrustlessDeFiTreasury_SpendRecorded.indexedFieldOperations>,
  @as("UserPosition") userPosition: entityLoaderContext<Entities.UserPosition.t, Entities.UserPosition.indexedFieldOperations>,
}

@genType
type entityHandlerContext<'entity> = Internal.entityHandlerContext<'entity>

@genType.import(("./Types.ts", "HandlerContext"))
type handlerContext = {
  log: Envio.logger,
  effect: 'input 'output. (Envio.effect<'input, 'output>, 'input) => promise<'output>,
  @as("AISmartAccountFactory_AccountCreated") aISmartAccountFactory_AccountCreated: entityHandlerContext<Entities.AISmartAccountFactory_AccountCreated.t>,
  @as("AITreasurySmartAccount_DailyLimitUpdated") aITreasurySmartAccount_DailyLimitUpdated: entityHandlerContext<Entities.AITreasurySmartAccount_DailyLimitUpdated.t>,
  @as("AITreasurySmartAccount_DelegationConfigured") aITreasurySmartAccount_DelegationConfigured: entityHandlerContext<Entities.AITreasurySmartAccount_DelegationConfigured.t>,
  @as("AITreasurySmartAccount_EmergencyRevoke") aITreasurySmartAccount_EmergencyRevoke: entityHandlerContext<Entities.AITreasurySmartAccount_EmergencyRevoke.t>,
  @as("AITreasurySmartAccount_HighRiskAlert") aITreasurySmartAccount_HighRiskAlert: entityHandlerContext<Entities.AITreasurySmartAccount_HighRiskAlert.t>,
  @as("EmergencyController_EmergencyStatusChanged") emergencyController_EmergencyStatusChanged: entityHandlerContext<Entities.EmergencyController_EmergencyStatusChanged.t>,
  @as("EntryPoint_UserOperationEvent") entryPoint_UserOperationEvent: entityHandlerContext<Entities.EntryPoint_UserOperationEvent.t>,
  @as("Pool") pool: entityHandlerContext<Entities.Pool.t>,
  @as("PoolTransaction") poolTransaction: entityHandlerContext<Entities.PoolTransaction.t>,
  @as("TrustlessDeFiTreasury_Delegation") trustlessDeFiTreasury_Delegation: entityHandlerContext<Entities.TrustlessDeFiTreasury_Delegation.t>,
  @as("TrustlessDeFiTreasury_SpendRecorded") trustlessDeFiTreasury_SpendRecorded: entityHandlerContext<Entities.TrustlessDeFiTreasury_SpendRecorded.t>,
  @as("UserPosition") userPosition: entityHandlerContext<Entities.UserPosition.t>,
}

//Re-exporting types for backwards compatability
@genType.as("AISmartAccountFactory_AccountCreated")
type aISmartAccountFactory_AccountCreated = Entities.AISmartAccountFactory_AccountCreated.t
@genType.as("AITreasurySmartAccount_DailyLimitUpdated")
type aITreasurySmartAccount_DailyLimitUpdated = Entities.AITreasurySmartAccount_DailyLimitUpdated.t
@genType.as("AITreasurySmartAccount_DelegationConfigured")
type aITreasurySmartAccount_DelegationConfigured = Entities.AITreasurySmartAccount_DelegationConfigured.t
@genType.as("AITreasurySmartAccount_EmergencyRevoke")
type aITreasurySmartAccount_EmergencyRevoke = Entities.AITreasurySmartAccount_EmergencyRevoke.t
@genType.as("AITreasurySmartAccount_HighRiskAlert")
type aITreasurySmartAccount_HighRiskAlert = Entities.AITreasurySmartAccount_HighRiskAlert.t
@genType.as("EmergencyController_EmergencyStatusChanged")
type emergencyController_EmergencyStatusChanged = Entities.EmergencyController_EmergencyStatusChanged.t
@genType.as("EntryPoint_UserOperationEvent")
type entryPoint_UserOperationEvent = Entities.EntryPoint_UserOperationEvent.t
@genType.as("Pool")
type pool = Entities.Pool.t
@genType.as("PoolTransaction")
type poolTransaction = Entities.PoolTransaction.t
@genType.as("TrustlessDeFiTreasury_Delegation")
type trustlessDeFiTreasury_Delegation = Entities.TrustlessDeFiTreasury_Delegation.t
@genType.as("TrustlessDeFiTreasury_SpendRecorded")
type trustlessDeFiTreasury_SpendRecorded = Entities.TrustlessDeFiTreasury_SpendRecorded.t
@genType.as("UserPosition")
type userPosition = Entities.UserPosition.t

type eventIdentifier = {
  chainId: int,
  blockTimestamp: int,
  blockNumber: int,
  logIndex: int,
}

type entityUpdateAction<'entityType> =
  | Set('entityType)
  | Delete

type entityUpdate<'entityType> = {
  eventIdentifier: eventIdentifier,
  entityId: id,
  entityUpdateAction: entityUpdateAction<'entityType>,
}

let mkEntityUpdate = (~eventIdentifier, ~entityId, entityUpdateAction) => {
  entityId,
  eventIdentifier,
  entityUpdateAction,
}

type entityValueAtStartOfBatch<'entityType> =
  | NotSet // The entity isn't in the DB yet
  | AlreadySet('entityType)

type updatedValue<'entityType> = {
  latest: entityUpdate<'entityType>,
  history: array<entityUpdate<'entityType>>,
  // In the event of a rollback, some entity updates may have been
  // been affected by a rollback diff. If there was no rollback diff
  // this will always be false.
  // If there was a rollback diff, this will be false in the case of a
  // new entity update (where entity affected is not present in the diff) b
  // but true if the update is related to an entity that is
  // currently present in the diff
  containsRollbackDiffChange: bool,
}

@genType
type inMemoryStoreRowEntity<'entityType> =
  | Updated(updatedValue<'entityType>)
  | InitialReadFromDb(entityValueAtStartOfBatch<'entityType>) // This means there is no change from the db.

//*************
//**CONTRACTS**
//*************

module Transaction = {
  @genType
  type t = {}

  let schema = S.object((_): t => {})
}

module Block = {
  @genType
  type t = {number: int, timestamp: int, hash: string}

  let schema = S.object((s): t => {number: s.field("number", S.int), timestamp: s.field("timestamp", S.int), hash: s.field("hash", S.string)})

  @get
  external getNumber: Internal.eventBlock => int = "number"

  @get
  external getTimestamp: Internal.eventBlock => int = "timestamp"
 
  @get
  external getId: Internal.eventBlock => string = "hash"

  let cleanUpRawEventFieldsInPlace: Js.Json.t => () = %raw(`fields => {
    delete fields.hash
    delete fields.number
    delete fields.timestamp
  }`)
}

module AggregatedBlock = {
  @genType
  type t = {hash: string, number: int, timestamp: int}
}
module AggregatedTransaction = {
  @genType
  type t = {}
}

@genType.as("EventLog")
type eventLog<'params> = Internal.genericEvent<'params, Block.t, Transaction.t>

module SingleOrMultiple: {
  @genType.import(("./bindings/OpaqueTypes", "SingleOrMultiple"))
  type t<'a>
  let normalizeOrThrow: (t<'a>, ~nestedArrayDepth: int=?) => array<'a>
  let single: 'a => t<'a>
  let multiple: array<'a> => t<'a>
} = {
  type t<'a> = Js.Json.t

  external single: 'a => t<'a> = "%identity"
  external multiple: array<'a> => t<'a> = "%identity"
  external castMultiple: t<'a> => array<'a> = "%identity"
  external castSingle: t<'a> => 'a = "%identity"

  exception AmbiguousEmptyNestedArray

  let rec isMultiple = (t: t<'a>, ~nestedArrayDepth): bool =>
    switch t->Js.Json.decodeArray {
    | None => false
    | Some(_arr) if nestedArrayDepth == 0 => true
    | Some([]) if nestedArrayDepth > 0 =>
      AmbiguousEmptyNestedArray->ErrorHandling.mkLogAndRaise(
        ~msg="The given empty array could be interperated as a flat array (value) or nested array. Since it's ambiguous,
        please pass in a nested empty array if the intention is to provide an empty array as a value",
      )
    | Some(arr) => arr->Js.Array2.unsafe_get(0)->isMultiple(~nestedArrayDepth=nestedArrayDepth - 1)
    }

  let normalizeOrThrow = (t: t<'a>, ~nestedArrayDepth=0): array<'a> => {
    if t->isMultiple(~nestedArrayDepth) {
      t->castMultiple
    } else {
      [t->castSingle]
    }
  }
}

module HandlerTypes = {
  @genType
  type args<'eventArgs, 'context> = {
    event: eventLog<'eventArgs>,
    context: 'context,
  }

  @genType
  type contractRegisterArgs<'eventArgs> = Internal.genericContractRegisterArgs<eventLog<'eventArgs>, contractRegistrations>
  @genType
  type contractRegister<'eventArgs> = Internal.genericContractRegister<contractRegisterArgs<'eventArgs>>

  @genType
  type loaderArgs<'eventArgs> = Internal.genericLoaderArgs<eventLog<'eventArgs>, loaderContext>
  @genType
  type loader<'eventArgs, 'loaderReturn> = Internal.genericLoader<loaderArgs<'eventArgs>, 'loaderReturn>
  
  @genType
  type handlerArgs<'eventArgs, 'loaderReturn> = Internal.genericHandlerArgs<eventLog<'eventArgs>, handlerContext, 'loaderReturn>

  @genType
  type handler<'eventArgs, 'loaderReturn> = Internal.genericHandler<handlerArgs<'eventArgs, 'loaderReturn>>

  @genType
  type loaderHandler<'eventArgs, 'loaderReturn, 'eventFilters> = Internal.genericHandlerWithLoader<
    loader<'eventArgs, 'loaderReturn>,
    handler<'eventArgs, 'loaderReturn>,
    'eventFilters
  >

  @genType
  type eventConfig<'eventFilters> = Internal.eventOptions<'eventFilters>
}

module type Event = {
  type event

  let handlerRegister: EventRegister.t

  type eventFilters
}

@genType.import(("./bindings/OpaqueTypes.ts", "HandlerWithOptions"))
type fnWithEventConfig<'fn, 'eventConfig> = ('fn, ~eventConfig: 'eventConfig=?) => unit

@genType
type handlerWithOptions<'eventArgs, 'loaderReturn, 'eventFilters> = fnWithEventConfig<
  HandlerTypes.handler<'eventArgs, 'loaderReturn>,
  HandlerTypes.eventConfig<'eventFilters>,
>

@genType
type contractRegisterWithOptions<'eventArgs, 'eventFilters> = fnWithEventConfig<
  HandlerTypes.contractRegister<'eventArgs>,
  HandlerTypes.eventConfig<'eventFilters>,
>

module MakeRegister = (Event: Event) => {
  let contractRegister: fnWithEventConfig<
    Internal.genericContractRegister<
      Internal.genericContractRegisterArgs<Event.event, contractRegistrations>,
    >,
    HandlerTypes.eventConfig<Event.eventFilters>,
  > = (contractRegister, ~eventConfig=?) =>
    Event.handlerRegister->EventRegister.setContractRegister(
      contractRegister,
      ~eventOptions=eventConfig,
    )

  let handler: fnWithEventConfig<
    Internal.genericHandler<Internal.genericHandlerArgs<Event.event, handlerContext, unit>>,
    HandlerTypes.eventConfig<Event.eventFilters>,
  > = (handler, ~eventConfig=?) => {
    Event.handlerRegister->EventRegister.setHandler(args => {
      if args.context.isPreload {
        Promise.resolve()
      } else {
        handler(
          args->(
            Utils.magic: Internal.genericHandlerArgs<
              Event.event,
              Internal.handlerContext,
              'loaderReturn,
            > => Internal.genericHandlerArgs<Event.event, handlerContext, unit>
          ),
        )
      }
    }, ~eventOptions=eventConfig)
  }

  let handlerWithLoader = (
    eventConfig: Internal.genericHandlerWithLoader<
      Internal.genericLoader<Internal.genericLoaderArgs<Event.event, loaderContext>, 'loaderReturn>,
      Internal.genericHandler<
        Internal.genericHandlerArgs<Event.event, handlerContext, 'loaderReturn>,
      >,
      Event.eventFilters,
    >,
  ) => {
    Event.handlerRegister->EventRegister.setHandler(
      args => {
        let promise = eventConfig.loader(
          args->(
            Utils.magic: Internal.genericHandlerArgs<
              Event.event,
              Internal.handlerContext,
              'loaderReturn,
            > => Internal.genericLoaderArgs<Event.event, loaderContext>
          ),
        )
        if args.context.isPreload {
          promise->Promise.ignoreValue
        } else {
          promise->Promise.then(loaderReturn => {
            (args->Obj.magic)["loaderReturn"] = loaderReturn
            eventConfig.handler(
              args->(
                Utils.magic: Internal.genericHandlerArgs<
                  Event.event,
                  Internal.handlerContext,
                  'loaderReturn,
                > => Internal.genericHandlerArgs<Event.event, handlerContext, 'loaderReturn>
              ),
            )
          })
        }
      },
      ~eventOptions=switch eventConfig {
      | {wildcard: ?None, eventFilters: ?None} => None
      | _ =>
        Some({
          wildcard: ?eventConfig.wildcard,
          eventFilters: ?eventConfig.eventFilters,
          preRegisterDynamicContracts: ?eventConfig.preRegisterDynamicContracts,
        })
      },
    )
  }
}

module AISmartAccountFactory = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"AccountCreated","inputs":[{"name":"account","type":"address","indexed":true},{"name":"owner","type":"address","indexed":true},{"name":"salt","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["AccountCreated(address indexed account, address indexed owner, uint256 salt)"]
@genType type chainId = [#10143]
let contractName = "AISmartAccountFactory"

module AccountCreated = {

let id = "0x33310a89c32d8cc00057ad6ef6274d2f8fe22389a992cf89983e09fc84f6cfff_3"
let sighash = "0x33310a89c32d8cc00057ad6ef6274d2f8fe22389a992cf89983e09fc84f6cfff"
let name = "AccountCreated"
let contractName = contractName

@genType
type eventArgs = {account: Address.t, owner: Address.t, salt: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {account: s.field("account", Address.schema), owner: s.field("owner", Address.schema), salt: s.field("salt", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("account") account?: SingleOrMultiple.t<Address.t>, @as("owner") owner?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["account","owner",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("account")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("owner")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {account: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, owner: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, salt: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module AITreasurySmartAccount = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"DailyLimitUpdated","inputs":[{"name":"spentToday","type":"uint256","indexed":false},{"name":"remainingLimit","type":"uint256","indexed":false},{"name":"resetTime","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"DelegationConfigured","inputs":[{"name":"aiAgent","type":"address","indexed":true},{"name":"dailyLimitUsd","type":"uint256","indexed":false},{"name":"validUntil","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"EmergencyRevoke","inputs":[{"name":"revokedBy","type":"address","indexed":true},{"name":"reason","type":"string","indexed":false},{"name":"timestamp","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"HighRiskAlert","inputs":[{"name":"protocol","type":"address","indexed":true},{"name":"estimatedLossUsd","type":"uint256","indexed":false},{"name":"alertType","type":"string","indexed":false},{"name":"timestamp","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["DailyLimitUpdated(uint256 spentToday, uint256 remainingLimit, uint256 resetTime)", "DelegationConfigured(address indexed aiAgent, uint256 dailyLimitUsd, uint256 validUntil)", "EmergencyRevoke(address indexed revokedBy, string reason, uint256 timestamp)", "HighRiskAlert(address indexed protocol, uint256 estimatedLossUsd, string alertType, uint256 timestamp)"]
@genType type chainId = [#10143]
let contractName = "AITreasurySmartAccount"

module DailyLimitUpdated = {

let id = "0x7334e583fad80c5ef0be90393ede8adf1ade756b3b59875fbaac036ed1a876a6_1"
let sighash = "0x7334e583fad80c5ef0be90393ede8adf1ade756b3b59875fbaac036ed1a876a6"
let name = "DailyLimitUpdated"
let contractName = contractName

@genType
type eventArgs = {spentToday: bigint, remainingLimit: bigint, resetTime: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {spentToday: s.field("spentToday", BigInt.schema), remainingLimit: s.field("remainingLimit", BigInt.schema), resetTime: s.field("resetTime", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {}

@genType type eventFilters = Internal.noEventFilters

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=[])
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {spentToday: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, remainingLimit: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, resetTime: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module EmergencyRevoke = {

let id = "0x9e6ed828a9acda16ab38c7f55ccbe781e9b745384833bc63bffc2489ad82d522_2"
let sighash = "0x9e6ed828a9acda16ab38c7f55ccbe781e9b745384833bc63bffc2489ad82d522"
let name = "EmergencyRevoke"
let contractName = contractName

@genType
type eventArgs = {revokedBy: Address.t, reason: string, timestamp: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {revokedBy: s.field("revokedBy", Address.schema), reason: s.field("reason", S.string), timestamp: s.field("timestamp", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("revokedBy") revokedBy?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["revokedBy",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("revokedBy")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {revokedBy: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, reason: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, timestamp: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module HighRiskAlert = {

let id = "0xe7655669166606767a8f36a37dafcce7e2fd660bc2673b935ce89125f499b71f_2"
let sighash = "0xe7655669166606767a8f36a37dafcce7e2fd660bc2673b935ce89125f499b71f"
let name = "HighRiskAlert"
let contractName = contractName

@genType
type eventArgs = {protocol: Address.t, estimatedLossUsd: bigint, alertType: string, timestamp: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {protocol: s.field("protocol", Address.schema), estimatedLossUsd: s.field("estimatedLossUsd", BigInt.schema), alertType: s.field("alertType", S.string), timestamp: s.field("timestamp", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("protocol") protocol?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["protocol",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("protocol")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {protocol: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, estimatedLossUsd: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, alertType: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, timestamp: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module DelegationConfigured = {

let id = "0x748bf350abb9a0df801f89c4e78cd9f1589c9aa2c24400014d156b7ff21ad574_2"
let sighash = "0x748bf350abb9a0df801f89c4e78cd9f1589c9aa2c24400014d156b7ff21ad574"
let name = "DelegationConfigured"
let contractName = contractName

@genType
type eventArgs = {aiAgent: Address.t, dailyLimitUsd: bigint, validUntil: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {aiAgent: s.field("aiAgent", Address.schema), dailyLimitUsd: s.field("dailyLimitUsd", BigInt.schema), validUntil: s.field("validUntil", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("aiAgent") aiAgent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["aiAgent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("aiAgent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {aiAgent: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, dailyLimitUsd: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, validUntil: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module EmergencyController = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"EmergencyStatusChanged","inputs":[{"name":"paused","type":"bool","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["EmergencyStatusChanged(bool paused)"]
@genType type chainId = [#10143]
let contractName = "EmergencyController"

module EmergencyStatusChanged = {

let id = "0x7a59f3d9b570b5d7464526b9724b380a8b5f006931c518f8a143e84e966d2c32_1"
let sighash = "0x7a59f3d9b570b5d7464526b9724b380a8b5f006931c518f8a143e84e966d2c32"
let name = "EmergencyStatusChanged"
let contractName = contractName

@genType
type eventArgs = {paused: bool}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {paused: s.field("paused", S.bool)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {}

@genType type eventFilters = Internal.noEventFilters

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=[])
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {paused: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module EntryPoint = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"UserOperationEvent","inputs":[{"name":"userOpHash","type":"bytes32","indexed":true},{"name":"sender","type":"address","indexed":true},{"name":"paymaster","type":"address","indexed":true},{"name":"nonce","type":"uint256","indexed":false},{"name":"success","type":"bool","indexed":false},{"name":"actualGasCost","type":"uint256","indexed":false},{"name":"actualGasUsed","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)"]
@genType type chainId = [#10143]
let contractName = "EntryPoint"

module UserOperationEvent = {

let id = "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f_4"
let sighash = "0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f"
let name = "UserOperationEvent"
let contractName = contractName

@genType
type eventArgs = {userOpHash: string, sender: Address.t, paymaster: Address.t, nonce: bigint, success: bool, actualGasCost: bigint, actualGasUsed: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {userOpHash: s.field("userOpHash", S.string), sender: s.field("sender", Address.schema), paymaster: s.field("paymaster", Address.schema), nonce: s.field("nonce", BigInt.schema), success: s.field("success", S.bool), actualGasCost: s.field("actualGasCost", BigInt.schema), actualGasUsed: s.field("actualGasUsed", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("userOpHash") userOpHash?: SingleOrMultiple.t<string>, @as("sender") sender?: SingleOrMultiple.t<Address.t>, @as("paymaster") paymaster?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["userOpHash","sender","paymaster",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("userOpHash")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.castToHexUnsafe)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic3=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("paymaster")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {userOpHash: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, sender: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, paymaster: decodedEvent.indexed->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, nonce: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, success: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, actualGasCost: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, actualGasUsed: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module NablaUSDCPool = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"Deposit","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Swap","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"tokenIn","type":"address","indexed":false},{"name":"tokenOut","type":"address","indexed":false},{"name":"amountIn","type":"uint256","indexed":false},{"name":"amountOut","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["Deposit(address indexed user, uint256 assets, uint256 shares)", "Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)", "Withdraw(address indexed user, uint256 assets, uint256 shares)"]
@genType type chainId = [#10143]
let contractName = "NablaUSDCPool"

module Deposit = {

let id = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15_2"
let sighash = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15"
let name = "Deposit"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Withdraw = {

let id = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568_2"
let sighash = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568"
let name = "Withdraw"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Swap = {

let id = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062_2"
let sighash = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062"
let name = "Swap"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, tokenIn: Address.t, tokenOut: Address.t, amountIn: bigint, amountOut: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), tokenIn: s.field("tokenIn", Address.schema), tokenOut: s.field("tokenOut", Address.schema), amountIn: s.field("amountIn", BigInt.schema), amountOut: s.field("amountOut", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenIn: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenOut: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountIn: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountOut: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module NablaUSDTPool = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"Deposit","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Swap","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"tokenIn","type":"address","indexed":false},{"name":"tokenOut","type":"address","indexed":false},{"name":"amountIn","type":"uint256","indexed":false},{"name":"amountOut","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["Deposit(address indexed user, uint256 assets, uint256 shares)", "Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)", "Withdraw(address indexed user, uint256 assets, uint256 shares)"]
@genType type chainId = [#10143]
let contractName = "NablaUSDTPool"

module Deposit = {

let id = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15_2"
let sighash = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15"
let name = "Deposit"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Withdraw = {

let id = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568_2"
let sighash = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568"
let name = "Withdraw"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Swap = {

let id = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062_2"
let sighash = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062"
let name = "Swap"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, tokenIn: Address.t, tokenOut: Address.t, amountIn: bigint, amountOut: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), tokenIn: s.field("tokenIn", Address.schema), tokenOut: s.field("tokenOut", Address.schema), amountIn: s.field("amountIn", BigInt.schema), amountOut: s.field("amountOut", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenIn: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenOut: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountIn: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountOut: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module NablaWBTCPool = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"Deposit","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Swap","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"tokenIn","type":"address","indexed":false},{"name":"tokenOut","type":"address","indexed":false},{"name":"amountIn","type":"uint256","indexed":false},{"name":"amountOut","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Withdraw","inputs":[{"name":"user","type":"address","indexed":true},{"name":"assets","type":"uint256","indexed":false},{"name":"shares","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["Deposit(address indexed user, uint256 assets, uint256 shares)", "Swap(address indexed sender, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)", "Withdraw(address indexed user, uint256 assets, uint256 shares)"]
@genType type chainId = [#10143]
let contractName = "NablaWBTCPool"

module Deposit = {

let id = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15_2"
let sighash = "0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15"
let name = "Deposit"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Withdraw = {

let id = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568_2"
let sighash = "0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568"
let name = "Withdraw"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, assets: bigint, shares: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), assets: s.field("assets", BigInt.schema), shares: s.field("shares", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, assets: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, shares: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Swap = {

let id = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062_2"
let sighash = "0xcd3829a3813dc3cdd188fd3d01dcf3268c16be2fdd2dd21d0665418816e46062"
let name = "Swap"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, tokenIn: Address.t, tokenOut: Address.t, amountIn: bigint, amountOut: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), tokenIn: s.field("tokenIn", Address.schema), tokenOut: s.field("tokenOut", Address.schema), amountIn: s.field("amountIn", BigInt.schema), amountOut: s.field("amountOut", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenIn: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, tokenOut: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountIn: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amountOut: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module TrustlessDeFiTreasury = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"DelegationGranted","inputs":[{"name":"user","type":"address","indexed":true},{"name":"aiAgent","type":"address","indexed":true},{"name":"dailyLimitUSD","type":"uint256","indexed":false},{"name":"validUntil","type":"uint256","indexed":false},{"name":"protocolWhitelist","type":"address[]","indexed":false}],"anonymous":false},{"type":"event","name":"DelegationPaused","inputs":[{"name":"user","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"DelegationResumed","inputs":[{"name":"user","type":"address","indexed":true},{"name":"validUntil","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"DelegationRevoked","inputs":[{"name":"user","type":"address","indexed":true},{"name":"aiAgent","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"DelegationUpdated","inputs":[{"name":"user","type":"address","indexed":true},{"name":"aiAgent","type":"address","indexed":true},{"name":"dailyLimitUSD","type":"uint256","indexed":false},{"name":"validUntil","type":"uint256","indexed":false},{"name":"protocolWhitelist","type":"address[]","indexed":false}],"anonymous":false},{"type":"event","name":"SpendRecorded","inputs":[{"name":"user","type":"address","indexed":true},{"name":"protocol","type":"address","indexed":true},{"name":"valueUsd","type":"uint256","indexed":false},{"name":"spentToday","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["DelegationGranted(address indexed user, address indexed aiAgent, uint256 dailyLimitUSD, uint256 validUntil, address[] protocolWhitelist)", "DelegationPaused(address indexed user)", "DelegationResumed(address indexed user, uint256 validUntil)", "DelegationRevoked(address indexed user, address indexed aiAgent)", "DelegationUpdated(address indexed user, address indexed aiAgent, uint256 dailyLimitUSD, uint256 validUntil, address[] protocolWhitelist)", "SpendRecorded(address indexed user, address indexed protocol, uint256 valueUsd, uint256 spentToday)"]
@genType type chainId = [#10143]
let contractName = "TrustlessDeFiTreasury"

module DelegationGranted = {

let id = "0x80bc771809ec6bda5fc800a33afec24b26f5513cfb06f9b82486876aa6b516cb_3"
let sighash = "0x80bc771809ec6bda5fc800a33afec24b26f5513cfb06f9b82486876aa6b516cb"
let name = "DelegationGranted"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, aiAgent: Address.t, dailyLimitUSD: bigint, validUntil: bigint, protocolWhitelist: array<Address.t>}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), aiAgent: s.field("aiAgent", Address.schema), dailyLimitUSD: s.field("dailyLimitUSD", BigInt.schema), validUntil: s.field("validUntil", BigInt.schema), protocolWhitelist: s.field("protocolWhitelist", S.array(Address.schema))})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>, @as("aiAgent") aiAgent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user","aiAgent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("aiAgent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, aiAgent: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, dailyLimitUSD: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, validUntil: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, protocolWhitelist: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module DelegationUpdated = {

let id = "0x68f8a9b5b101a987403264ee7bde1e055a249f6ea8e84d0c173d578bf5c8c317_3"
let sighash = "0x68f8a9b5b101a987403264ee7bde1e055a249f6ea8e84d0c173d578bf5c8c317"
let name = "DelegationUpdated"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, aiAgent: Address.t, dailyLimitUSD: bigint, validUntil: bigint, protocolWhitelist: array<Address.t>}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), aiAgent: s.field("aiAgent", Address.schema), dailyLimitUSD: s.field("dailyLimitUSD", BigInt.schema), validUntil: s.field("validUntil", BigInt.schema), protocolWhitelist: s.field("protocolWhitelist", S.array(Address.schema))})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>, @as("aiAgent") aiAgent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user","aiAgent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("aiAgent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, aiAgent: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, dailyLimitUSD: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, validUntil: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, protocolWhitelist: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module DelegationRevoked = {

let id = "0x6f0412fa95f7f48ec7dc7631b382833d8eae9cf4082e5e859b94d091a4a846d4_3"
let sighash = "0x6f0412fa95f7f48ec7dc7631b382833d8eae9cf4082e5e859b94d091a4a846d4"
let name = "DelegationRevoked"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, aiAgent: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), aiAgent: s.field("aiAgent", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>, @as("aiAgent") aiAgent?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user","aiAgent",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("aiAgent")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, aiAgent: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module DelegationPaused = {

let id = "0xc29b21a6310e5abd9e04b2d3d73202350288f4be38c963c04dd82862b1255e92_2"
let sighash = "0xc29b21a6310e5abd9e04b2d3d73202350288f4be38c963c04dd82862b1255e92"
let name = "DelegationPaused"
let contractName = contractName

@genType
type eventArgs = {user: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module DelegationResumed = {

let id = "0x72cd471aeea5a0e7cb8ffd756bc2a4e0a7bd7994a602d9528478e877b2abda9f_2"
let sighash = "0x72cd471aeea5a0e7cb8ffd756bc2a4e0a7bd7994a602d9528478e877b2abda9f"
let name = "DelegationResumed"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, validUntil: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), validUntil: s.field("validUntil", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, validUntil: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module SpendRecorded = {

let id = "0xac8c13ed4853e784d11f5e97ff8fca20bbddf6aa991d0ba2d7d9f400baea8779_3"
let sighash = "0xac8c13ed4853e784d11f5e97ff8fca20bbddf6aa991d0ba2d7d9f400baea8779"
let name = "SpendRecorded"
let contractName = contractName

@genType
type eventArgs = {user: Address.t, protocol: Address.t, valueUsd: bigint, spentToday: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {user: s.field("user", Address.schema), protocol: s.field("protocol", Address.schema), valueUsd: s.field("valueUsd", BigInt.schema), spentToday: s.field("spentToday", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("user") user?: SingleOrMultiple.t<Address.t>, @as("protocol") protocol?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["user","protocol",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("user")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("protocol")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {user: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, protocol: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, valueUsd: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, spentToday: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module UniswapV2Factory = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"PairCreated","inputs":[{"name":"token0","type":"address","indexed":true},{"name":"token1","type":"address","indexed":true},{"name":"pair","type":"address","indexed":false},{"name":"_3","type":"uint256","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["PairCreated(address indexed token0, address indexed token1, address pair, uint256 _3)"]
@genType type chainId = [#10143]
let contractName = "UniswapV2Factory"

module PairCreated = {

let id = "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9_3"
let sighash = "0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9"
let name = "PairCreated"
let contractName = contractName

@genType
type eventArgs = {token0: Address.t, token1: Address.t, pair: Address.t, _3: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {token0: s.field("token0", Address.schema), token1: s.field("token1", Address.schema), pair: s.field("pair", Address.schema), _3: s.field("_3", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("token0") token0?: SingleOrMultiple.t<Address.t>, @as("token1") token1?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["token0","token1",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("token0")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("token1")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {token0: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, token1: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, pair: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, _3: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module UniswapV2Pair_USDC_USDT = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"Burn","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0","type":"uint256","indexed":false},{"name":"amount1","type":"uint256","indexed":false},{"name":"to","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Mint","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0","type":"uint256","indexed":false},{"name":"amount1","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Swap","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0In","type":"uint256","indexed":false},{"name":"amount1In","type":"uint256","indexed":false},{"name":"amount0Out","type":"uint256","indexed":false},{"name":"amount1Out","type":"uint256","indexed":false},{"name":"to","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Sync","inputs":[{"name":"reserve0","type":"uint112","indexed":false},{"name":"reserve1","type":"uint112","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)", "Mint(address indexed sender, uint256 amount0, uint256 amount1)", "Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)", "Sync(uint112 reserve0, uint112 reserve1)"]
@genType type chainId = [#10143]
let contractName = "UniswapV2Pair_USDC_USDT"

module Mint = {

let id = "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f_2"
let sighash = "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f"
let name = "Mint"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0: bigint, amount1: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0: s.field("amount0", BigInt.schema), amount1: s.field("amount1", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Burn = {

let id = "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496_3"
let sighash = "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496"
let name = "Burn"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0: bigint, amount1: bigint, to: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0: s.field("amount0", BigInt.schema), amount1: s.field("amount1", BigInt.schema), to: s.field("to", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>, @as("to") to?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender","to",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("to")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, to: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Swap = {

let id = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822_3"
let sighash = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
let name = "Swap"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0In: bigint, amount1In: bigint, amount0Out: bigint, amount1Out: bigint, to: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0In: s.field("amount0In", BigInt.schema), amount1In: s.field("amount1In", BigInt.schema), amount0Out: s.field("amount0Out", BigInt.schema), amount1Out: s.field("amount1Out", BigInt.schema), to: s.field("to", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>, @as("to") to?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender","to",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("to")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, to: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0In: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1In: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0Out: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1Out: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Sync = {

let id = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1_1"
let sighash = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1"
let name = "Sync"
let contractName = contractName

@genType
type eventArgs = {reserve0: bigint, reserve1: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {reserve0: s.field("reserve0", BigInt.schema), reserve1: s.field("reserve1", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {}

@genType type eventFilters = Internal.noEventFilters

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=[])
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {reserve0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, reserve1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

module UniswapV2Pair_USDC_WMON = {
let abi = Ethers.makeAbi((%raw(`[{"type":"event","name":"Burn","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0","type":"uint256","indexed":false},{"name":"amount1","type":"uint256","indexed":false},{"name":"to","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Mint","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0","type":"uint256","indexed":false},{"name":"amount1","type":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Swap","inputs":[{"name":"sender","type":"address","indexed":true},{"name":"amount0In","type":"uint256","indexed":false},{"name":"amount1In","type":"uint256","indexed":false},{"name":"amount0Out","type":"uint256","indexed":false},{"name":"amount1Out","type":"uint256","indexed":false},{"name":"to","type":"address","indexed":true}],"anonymous":false},{"type":"event","name":"Sync","inputs":[{"name":"reserve0","type":"uint112","indexed":false},{"name":"reserve1","type":"uint112","indexed":false}],"anonymous":false}]`): Js.Json.t))
let eventSignatures = ["Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)", "Mint(address indexed sender, uint256 amount0, uint256 amount1)", "Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)", "Sync(uint112 reserve0, uint112 reserve1)"]
@genType type chainId = [#10143]
let contractName = "UniswapV2Pair_USDC_WMON"

module Mint = {

let id = "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f_2"
let sighash = "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f"
let name = "Mint"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0: bigint, amount1: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0: s.field("amount0", BigInt.schema), amount1: s.field("amount1", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Burn = {

let id = "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496_3"
let sighash = "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496"
let name = "Burn"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0: bigint, amount1: bigint, to: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0: s.field("amount0", BigInt.schema), amount1: s.field("amount1", BigInt.schema), to: s.field("to", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>, @as("to") to?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender","to",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("to")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, to: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Swap = {

let id = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822_3"
let sighash = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
let name = "Swap"
let contractName = contractName

@genType
type eventArgs = {sender: Address.t, amount0In: bigint, amount1In: bigint, amount0Out: bigint, amount1Out: bigint, to: Address.t}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {sender: s.field("sender", Address.schema), amount0In: s.field("amount0In", BigInt.schema), amount1In: s.field("amount1In", BigInt.schema), amount0Out: s.field("amount0Out", BigInt.schema), amount1Out: s.field("amount1Out", BigInt.schema), to: s.field("to", Address.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {@as("sender") sender?: SingleOrMultiple.t<Address.t>, @as("to") to?: SingleOrMultiple.t<Address.t>}

@genType type eventFiltersArgs = {/** The unique identifier of the blockchain network where this event occurred. */ chainId: chainId, /** Addresses of the contracts indexing the event. */ addresses: array<Address.t>}

@genType @unboxed type eventFiltersDefinition = Single(eventFilter) | Multiple(array<eventFilter>)

@genType @unboxed type eventFilters = | ...eventFiltersDefinition | Dynamic(eventFiltersArgs => eventFiltersDefinition)

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=["sender","to",], ~topic1=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("sender")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)), ~topic2=(_eventFilter) => _eventFilter->Utils.Dict.dangerouslyGetNonOption("to")->Belt.Option.mapWithDefault([], topicFilters => topicFilters->Obj.magic->SingleOrMultiple.normalizeOrThrow->Belt.Array.map(TopicFilter.fromAddress)))
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {sender: decodedEvent.indexed->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, to: decodedEvent.indexed->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0In: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1In: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount0Out: decodedEvent.body->Js.Array2.unsafe_get(2)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, amount1Out: decodedEvent.body->Js.Array2.unsafe_get(3)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}

module Sync = {

let id = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1_1"
let sighash = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1"
let name = "Sync"
let contractName = contractName

@genType
type eventArgs = {reserve0: bigint, reserve1: bigint}
@genType
type block = Block.t
@genType
type transaction = Transaction.t

@genType
type event = {
  /** The parameters or arguments associated with this event. */
  params: eventArgs,
  /** The unique identifier of the blockchain network where this event occurred. */
  chainId: chainId,
  /** The address of the contract that emitted this event. */
  srcAddress: Address.t,
  /** The index of this event's log within the block. */
  logIndex: int,
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  transaction: transaction,
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  block: block,
}

@genType
type loaderArgs = Internal.genericLoaderArgs<event, loaderContext>
@genType
type loader<'loaderReturn> = Internal.genericLoader<loaderArgs, 'loaderReturn>
@genType
type handlerArgs<'loaderReturn> = Internal.genericHandlerArgs<event, handlerContext, 'loaderReturn>
@genType
type handler<'loaderReturn> = Internal.genericHandler<handlerArgs<'loaderReturn>>
@genType
type contractRegister = Internal.genericContractRegister<Internal.genericContractRegisterArgs<event, contractRegistrations>>

let paramsRawEventSchema = S.object((s): eventArgs => {reserve0: s.field("reserve0", BigInt.schema), reserve1: s.field("reserve1", BigInt.schema)})
let blockSchema = Block.schema
let transactionSchema = Transaction.schema

let handlerRegister: EventRegister.t = EventRegister.make(
  ~contractName,
  ~eventName=name,
)

@genType
type eventFilter = {}

@genType type eventFilters = Internal.noEventFilters

let register = (): Internal.evmEventConfig => {
  let {getEventFiltersOrThrow, filterByAddresses} = LogSelection.parseEventFiltersOrThrow(~eventFilters=handlerRegister->EventRegister.getEventFilters, ~sighash, ~params=[])
  {
    getEventFiltersOrThrow,
    filterByAddresses,
    dependsOnAddresses: !(handlerRegister->EventRegister.isWildcard) || filterByAddresses,
    blockSchema: blockSchema->(Utils.magic: S.t<block> => S.t<Internal.eventBlock>),
    transactionSchema: transactionSchema->(Utils.magic: S.t<transaction> => S.t<Internal.eventTransaction>),
    convertHyperSyncEventArgs: (decodedEvent: HyperSyncClient.Decoder.decodedEvent) => {reserve0: decodedEvent.body->Js.Array2.unsafe_get(0)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, reserve1: decodedEvent.body->Js.Array2.unsafe_get(1)->HyperSyncClient.Decoder.toUnderlying->Utils.magic, }->(Utils.magic: eventArgs => Internal.eventParams),
    id,
  name,
  contractName,
  isWildcard: (handlerRegister->EventRegister.isWildcard),
  handler: handlerRegister->EventRegister.getHandler,
  contractRegister: handlerRegister->EventRegister.getContractRegister,
  paramsRawEventSchema: paramsRawEventSchema->(Utils.magic: S.t<eventArgs> => S.t<Internal.eventParams>),
  }
}
}
}

@genType
type chainId = int

@genType
type chain = [#10143]

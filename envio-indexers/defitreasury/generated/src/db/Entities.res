open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let name: string
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

exception UnexpectedIdNotDefinedOnEntity
let getEntityIdUnsafe = (entity: 'entity): id =>
  switch Utils.magic(entity)["id"] {
  | Some(id) => id
  | None =>
    UnexpectedIdNotDefinedOnEntity->ErrorHandling.mkLogAndRaise(
      ~msg="Property 'id' does not exist on expected entity object",
    )
  }

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>
}

module AISmartAccountFactory_AccountCreated = {
  let name = (AISmartAccountFactory_AccountCreated :> string)
  @genType
  type t = {
    account: string,
    blockNumber: bigint,
    id: id,
    owner: string,
    salt: bigint,
    timestamp: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    account: s.field("account", S.string),
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    owner: s.field("owner", S.string),
    salt: s.field("salt", BigInt.schema),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "account", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "owner", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "salt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module AITreasurySmartAccount_DailyLimitUpdated = {
  let name = (AITreasurySmartAccount_DailyLimitUpdated :> string)
  @genType
  type t = {
    blockNumber: bigint,
    id: id,
    remainingLimit: bigint,
    resetTime: bigint,
    smartAccount: string,
    spentToday: bigint,
    timestamp: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    remainingLimit: s.field("remainingLimit", BigInt.schema),
    resetTime: s.field("resetTime", BigInt.schema),
    smartAccount: s.field("smartAccount", S.string),
    spentToday: s.field("spentToday", BigInt.schema),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "remainingLimit", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "resetTime", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "smartAccount", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "spentToday", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module AITreasurySmartAccount_DelegationConfigured = {
  let name = (AITreasurySmartAccount_DelegationConfigured :> string)
  @genType
  type t = {
    aiAgent: string,
    blockNumber: bigint,
    dailyLimitUsd: bigint,
    id: id,
    smartAccount: string,
    timestamp: bigint,
    txHash: string,
    validUntil: bigint,
  }

  let schema = S.object((s): t => {
    aiAgent: s.field("aiAgent", S.string),
    blockNumber: s.field("blockNumber", BigInt.schema),
    dailyLimitUsd: s.field("dailyLimitUsd", BigInt.schema),
    id: s.field("id", S.string),
    smartAccount: s.field("smartAccount", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
    validUntil: s.field("validUntil", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "aiAgent", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "dailyLimitUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "smartAccount", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "validUntil", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module AITreasurySmartAccount_EmergencyRevoke = {
  let name = (AITreasurySmartAccount_EmergencyRevoke :> string)
  @genType
  type t = {
    blockNumber: bigint,
    id: id,
    reason: string,
    revokeTimestamp: bigint,
    revokedBy: string,
    smartAccount: string,
    timestamp: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    reason: s.field("reason", S.string),
    revokeTimestamp: s.field("revokeTimestamp", BigInt.schema),
    revokedBy: s.field("revokedBy", S.string),
    smartAccount: s.field("smartAccount", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "reason", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "revokeTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "revokedBy", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "smartAccount", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module AITreasurySmartAccount_HighRiskAlert = {
  let name = (AITreasurySmartAccount_HighRiskAlert :> string)
  @genType
  type t = {
    alertTimestamp: bigint,
    alertType: string,
    blockNumber: bigint,
    estimatedLossUsd: bigint,
    id: id,
    protocol: string,
    smartAccount: string,
    timestamp: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    alertTimestamp: s.field("alertTimestamp", BigInt.schema),
    alertType: s.field("alertType", S.string),
    blockNumber: s.field("blockNumber", BigInt.schema),
    estimatedLossUsd: s.field("estimatedLossUsd", BigInt.schema),
    id: s.field("id", S.string),
    protocol: s.field("protocol", S.string),
    smartAccount: s.field("smartAccount", S.string),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "alertTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "alertType", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "estimatedLossUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "protocol", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "smartAccount", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module EmergencyController_EmergencyStatusChanged = {
  let name = (EmergencyController_EmergencyStatusChanged :> string)
  @genType
  type t = {
    blockNumber: bigint,
    id: id,
    paused: bool,
    timestamp: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    paused: s.field("paused", S.bool),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "paused", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module EntryPoint_UserOperationEvent = {
  let name = (EntryPoint_UserOperationEvent :> string)
  @genType
  type t = {
    actualGasCost: bigint,
    actualGasUsed: bigint,
    blockNumber: bigint,
    id: id,
    nonce: bigint,
    paymaster: string,
    sender: string,
    smartAccount: string,
    source: string,
    success: bool,
    timestamp: bigint,
    txHash: string,
    userOpHash: string,
  }

  let schema = S.object((s): t => {
    actualGasCost: s.field("actualGasCost", BigInt.schema),
    actualGasUsed: s.field("actualGasUsed", BigInt.schema),
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    nonce: s.field("nonce", BigInt.schema),
    paymaster: s.field("paymaster", S.string),
    sender: s.field("sender", S.string),
    smartAccount: s.field("smartAccount", S.string),
    source: s.field("source", S.string),
    success: s.field("success", S.bool),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
    userOpHash: s.field("userOpHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "actualGasCost", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "actualGasUsed", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "nonce", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "paymaster", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "sender", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "smartAccount", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "source", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "success", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "userOpHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module Pool = {
  let name = (Pool :> string)
  @genType
  type t = {
    asset: option<string>,
    assetAddress: option<string>,
    createdAt: bigint,
    id: id,
    lastActivityAt: bigint,
    lastReserveUpdate: option<bigint>,
    poolAddress: string,
    poolType: string,
    protocol: string,
    reserve0: option<bigint>,
    reserve1: option<bigint>,
    token0: option<string>,
    token0Address: option<string>,
    token1: option<string>,
    token1Address: option<string>,
    totalDeposits: bigint,
    totalSwapVolume: bigint,
    totalWithdrawals: bigint,
    transactionCount: int,
    uniqueUsers: int,
  }

  let schema = S.object((s): t => {
    asset: s.field("asset", S.null(S.string)),
    assetAddress: s.field("assetAddress", S.null(S.string)),
    createdAt: s.field("createdAt", BigInt.schema),
    id: s.field("id", S.string),
    lastActivityAt: s.field("lastActivityAt", BigInt.schema),
    lastReserveUpdate: s.field("lastReserveUpdate", S.null(BigInt.schema)),
    poolAddress: s.field("poolAddress", S.string),
    poolType: s.field("poolType", S.string),
    protocol: s.field("protocol", S.string),
    reserve0: s.field("reserve0", S.null(BigInt.schema)),
    reserve1: s.field("reserve1", S.null(BigInt.schema)),
    token0: s.field("token0", S.null(S.string)),
    token0Address: s.field("token0Address", S.null(S.string)),
    token1: s.field("token1", S.null(S.string)),
    token1Address: s.field("token1Address", S.null(S.string)),
    totalDeposits: s.field("totalDeposits", BigInt.schema),
    totalSwapVolume: s.field("totalSwapVolume", BigInt.schema),
    totalWithdrawals: s.field("totalWithdrawals", BigInt.schema),
    transactionCount: s.field("transactionCount", S.int),
    uniqueUsers: s.field("uniqueUsers", S.int),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "asset", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "assetAddress", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "lastActivityAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "lastReserveUpdate", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "poolAddress", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "poolType", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "protocol", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "reserve0", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "reserve1", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "token0", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "token0Address", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "token1", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "token1Address", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "totalDeposits", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalSwapVolume", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalWithdrawals", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionCount", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "uniqueUsers", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module PoolTransaction = {
  let name = (PoolTransaction :> string)
  @genType
  type t = {
    amount0: option<bigint>,
    amount1: option<bigint>,
    blockNumber: bigint,
    gasUsed: option<bigint>,
    id: id,
    pool_id: id,
    shares: option<bigint>,
    timestamp: bigint,
    tokenIn: option<string>,
    tokenOut: option<string>,
    transactionType: string,
    txHash: string,
    user: string,
  }

  let schema = S.object((s): t => {
    amount0: s.field("amount0", S.null(BigInt.schema)),
    amount1: s.field("amount1", S.null(BigInt.schema)),
    blockNumber: s.field("blockNumber", BigInt.schema),
    gasUsed: s.field("gasUsed", S.null(BigInt.schema)),
    id: s.field("id", S.string),
    pool_id: s.field("pool_id", S.string),
    shares: s.field("shares", S.null(BigInt.schema)),
    timestamp: s.field("timestamp", BigInt.schema),
    tokenIn: s.field("tokenIn", S.null(S.string)),
    tokenOut: s.field("tokenOut", S.null(S.string)),
    transactionType: s.field("transactionType", S.string),
    txHash: s.field("txHash", S.string),
    user: s.field("user", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount0", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "amount1", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "gasUsed", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "pool", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      ~linkedEntity="Pool",
      ),
      mkField(
      "shares", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "tokenIn", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "tokenOut", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "transactionType", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module TrustlessDeFiTreasury_Delegation = {
  let name = (TrustlessDeFiTreasury_Delegation :> string)
  @genType
  type t = {
    active: bool,
    aiAgent: string,
    allowedProtocols: array<string>,
    blockNumber: bigint,
    dailyLimitUsd: bigint,
    id: id,
    spentTodayUsd: bigint,
    timestamp: bigint,
    txHash: string,
    user: string,
    validUntil: bigint,
  }

  let schema = S.object((s): t => {
    active: s.field("active", S.bool),
    aiAgent: s.field("aiAgent", S.string),
    allowedProtocols: s.field("allowedProtocols", S.array(S.string)),
    blockNumber: s.field("blockNumber", BigInt.schema),
    dailyLimitUsd: s.field("dailyLimitUsd", BigInt.schema),
    id: s.field("id", S.string),
    spentTodayUsd: s.field("spentTodayUsd", BigInt.schema),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
    user: s.field("user", S.string),
    validUntil: s.field("validUntil", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "active", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "aiAgent", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "allowedProtocols", 
      Text,
      ~fieldSchema=S.array(S.string),
      
      
      ~isArray,
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "dailyLimitUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "spentTodayUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "validUntil", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module TrustlessDeFiTreasury_SpendRecorded = {
  let name = (TrustlessDeFiTreasury_SpendRecorded :> string)
  @genType
  type t = {
    blockNumber: bigint,
    id: id,
    protocol: string,
    spentTodayUsd: bigint,
    timestamp: bigint,
    txHash: string,
    user: string,
    valueUsd: bigint,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    id: s.field("id", S.string),
    protocol: s.field("protocol", S.string),
    spentTodayUsd: s.field("spentTodayUsd", BigInt.schema),
    timestamp: s.field("timestamp", BigInt.schema),
    txHash: s.field("txHash", S.string),
    user: s.field("user", S.string),
    valueUsd: s.field("valueUsd", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "protocol", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "spentTodayUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "timestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "valueUsd", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module UserPosition = {
  let name = (UserPosition :> string)
  @genType
  type t = {
    depositCount: int,
    firstDepositAt: bigint,
    id: id,
    lastActivityAt: bigint,
    pool_id: id,
    shares: bigint,
    totalDeposited: bigint,
    totalWithdrawn: bigint,
    user: string,
    withdrawCount: int,
  }

  let schema = S.object((s): t => {
    depositCount: s.field("depositCount", S.int),
    firstDepositAt: s.field("firstDepositAt", BigInt.schema),
    id: s.field("id", S.string),
    lastActivityAt: s.field("lastActivityAt", BigInt.schema),
    pool_id: s.field("pool_id", S.string),
    shares: s.field("shares", BigInt.schema),
    totalDeposited: s.field("totalDeposited", BigInt.schema),
    totalWithdrawn: s.field("totalWithdrawn", BigInt.schema),
    user: s.field("user", S.string),
    withdrawCount: s.field("withdrawCount", S.int),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "depositCount", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "firstDepositAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "lastActivityAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "pool", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      ~linkedEntity="Pool",
      ),
      mkField(
      "shares", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalDeposited", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalWithdrawn", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "user", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "withdrawCount", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(AISmartAccountFactory_AccountCreated),
  module(AITreasurySmartAccount_DailyLimitUpdated),
  module(AITreasurySmartAccount_DelegationConfigured),
  module(AITreasurySmartAccount_EmergencyRevoke),
  module(AITreasurySmartAccount_HighRiskAlert),
  module(EmergencyController_EmergencyStatusChanged),
  module(EntryPoint_UserOperationEvent),
  module(Pool),
  module(PoolTransaction),
  module(TrustlessDeFiTreasury_Delegation),
  module(TrustlessDeFiTreasury_SpendRecorded),
  module(UserPosition),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(InternalTable.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray

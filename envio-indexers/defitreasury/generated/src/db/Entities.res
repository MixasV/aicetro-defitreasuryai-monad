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

module CorporateTreasuryManager_CorporateAccountCreated = {
  let name = (CorporateTreasuryManager_CorporateAccountCreated :> string)
  @genType
  type t = {
    account: string,
    id: id,
    owners: array<string>,
    threshold: bigint,
  }

  let schema = S.object((s): t => {
    account: s.field("account", S.string),
    id: s.field("id", S.string),
    owners: s.field("owners", S.array(S.string)),
    threshold: s.field("threshold", BigInt.schema),
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
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "owners", 
      Text,
      ~fieldSchema=S.array(S.string),
      
      
      ~isArray,
      
      
      ),
      mkField(
      "threshold", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module CorporateTreasuryManager_DelegationSpending = {
  let name = (CorporateTreasuryManager_DelegationSpending :> string)
  @genType
  type t = {
    account: string,
    amount: bigint,
    id: id,
    newSpent: bigint,
  }

  let schema = S.object((s): t => {
    account: s.field("account", S.string),
    amount: s.field("amount", BigInt.schema),
    id: s.field("id", S.string),
    newSpent: s.field("newSpent", BigInt.schema),
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
      "amount", 
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
      "newSpent", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module CorporateTreasuryManager_DelegationUpdated = {
  let name = (CorporateTreasuryManager_DelegationUpdated :> string)
  @genType
  type t = {
    account: string,
    active: bool,
    delegate: string,
    id: id,
    limit: bigint,
  }

  let schema = S.object((s): t => {
    account: s.field("account", S.string),
    active: s.field("active", S.bool),
    delegate: s.field("delegate", S.string),
    id: s.field("id", S.string),
    limit: s.field("limit", BigInt.schema),
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
      "active", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "delegate", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "limit", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
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
    id: id,
    paused: bool,
  }

  let schema = S.object((s): t => {
    id: s.field("id", S.string),
    paused: s.field("paused", S.bool),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
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
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(CorporateTreasuryManager_CorporateAccountCreated),
  module(CorporateTreasuryManager_DelegationSpending),
  module(CorporateTreasuryManager_DelegationUpdated),
  module(EmergencyController_EmergencyStatusChanged),
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

/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
    }

    let toTransaction = (_mock: t) => {
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let config = RegisterHandlers.getConfig()
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch config.defaultChain {
        | Some(chainConfig) => chainConfig.id
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module AISmartAccountFactory = {
  module AccountCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AISmartAccountFactory.AccountCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AISmartAccountFactory.AccountCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("account")
      account?: Address.t,
      @as("owner")
      owner?: Address.t,
      @as("salt")
      salt?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?account,
        ?owner,
        ?salt,
        ?mockEventData,
      } = args

      let params = 
      {
       account: account->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       owner: owner->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       salt: salt->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AISmartAccountFactory.AccountCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AISmartAccountFactory.AccountCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AISmartAccountFactory.AccountCreated.event)
    }
  }

}


module AITreasurySmartAccount = {
  module DailyLimitUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AITreasurySmartAccount.DailyLimitUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AITreasurySmartAccount.DailyLimitUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("spentToday")
      spentToday?: bigint,
      @as("remainingLimit")
      remainingLimit?: bigint,
      @as("resetTime")
      resetTime?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?spentToday,
        ?remainingLimit,
        ?resetTime,
        ?mockEventData,
      } = args

      let params = 
      {
       spentToday: spentToday->Belt.Option.getWithDefault(0n),
       remainingLimit: remainingLimit->Belt.Option.getWithDefault(0n),
       resetTime: resetTime->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AITreasurySmartAccount.DailyLimitUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AITreasurySmartAccount.DailyLimitUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AITreasurySmartAccount.DailyLimitUpdated.event)
    }
  }

  module EmergencyRevoke = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AITreasurySmartAccount.EmergencyRevoke.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AITreasurySmartAccount.EmergencyRevoke.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("revokedBy")
      revokedBy?: Address.t,
      @as("reason")
      reason?: string,
      @as("timestamp")
      timestamp?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?revokedBy,
        ?reason,
        ?timestamp,
        ?mockEventData,
      } = args

      let params = 
      {
       revokedBy: revokedBy->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       reason: reason->Belt.Option.getWithDefault("foo"),
       timestamp: timestamp->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AITreasurySmartAccount.EmergencyRevoke.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AITreasurySmartAccount.EmergencyRevoke.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AITreasurySmartAccount.EmergencyRevoke.event)
    }
  }

  module HighRiskAlert = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AITreasurySmartAccount.HighRiskAlert.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AITreasurySmartAccount.HighRiskAlert.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("protocol")
      protocol?: Address.t,
      @as("estimatedLossUsd")
      estimatedLossUsd?: bigint,
      @as("alertType")
      alertType?: string,
      @as("timestamp")
      timestamp?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?protocol,
        ?estimatedLossUsd,
        ?alertType,
        ?timestamp,
        ?mockEventData,
      } = args

      let params = 
      {
       protocol: protocol->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       estimatedLossUsd: estimatedLossUsd->Belt.Option.getWithDefault(0n),
       alertType: alertType->Belt.Option.getWithDefault("foo"),
       timestamp: timestamp->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AITreasurySmartAccount.HighRiskAlert.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AITreasurySmartAccount.HighRiskAlert.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AITreasurySmartAccount.HighRiskAlert.event)
    }
  }

  module DelegationConfigured = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AITreasurySmartAccount.DelegationConfigured.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AITreasurySmartAccount.DelegationConfigured.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("aiAgent")
      aiAgent?: Address.t,
      @as("dailyLimitUsd")
      dailyLimitUsd?: bigint,
      @as("validUntil")
      validUntil?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?aiAgent,
        ?dailyLimitUsd,
        ?validUntil,
        ?mockEventData,
      } = args

      let params = 
      {
       aiAgent: aiAgent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       dailyLimitUsd: dailyLimitUsd->Belt.Option.getWithDefault(0n),
       validUntil: validUntil->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AITreasurySmartAccount.DelegationConfigured.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AITreasurySmartAccount.DelegationConfigured.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AITreasurySmartAccount.DelegationConfigured.event)
    }
  }

}


module EmergencyController = {
  module EmergencyStatusChanged = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.EmergencyController.EmergencyStatusChanged.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.EmergencyController.EmergencyStatusChanged.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("paused")
      paused?: bool,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?paused,
        ?mockEventData,
      } = args

      let params = 
      {
       paused: paused->Belt.Option.getWithDefault(false),
      }
->(Utils.magic: Types.EmergencyController.EmergencyStatusChanged.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.EmergencyController.EmergencyStatusChanged.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.EmergencyController.EmergencyStatusChanged.event)
    }
  }

}


module EntryPoint = {
  module UserOperationEvent = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.EntryPoint.UserOperationEvent.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.EntryPoint.UserOperationEvent.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("userOpHash")
      userOpHash?: string,
      @as("sender")
      sender?: Address.t,
      @as("paymaster")
      paymaster?: Address.t,
      @as("nonce")
      nonce?: bigint,
      @as("success")
      success?: bool,
      @as("actualGasCost")
      actualGasCost?: bigint,
      @as("actualGasUsed")
      actualGasUsed?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?userOpHash,
        ?sender,
        ?paymaster,
        ?nonce,
        ?success,
        ?actualGasCost,
        ?actualGasUsed,
        ?mockEventData,
      } = args

      let params = 
      {
       userOpHash: userOpHash->Belt.Option.getWithDefault("foo"),
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       paymaster: paymaster->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       nonce: nonce->Belt.Option.getWithDefault(0n),
       success: success->Belt.Option.getWithDefault(false),
       actualGasCost: actualGasCost->Belt.Option.getWithDefault(0n),
       actualGasUsed: actualGasUsed->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.EntryPoint.UserOperationEvent.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.EntryPoint.UserOperationEvent.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.EntryPoint.UserOperationEvent.event)
    }
  }

}


module NablaUSDCPool = {
  module Deposit = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDCPool.Deposit.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDCPool.Deposit.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDCPool.Deposit.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDCPool.Deposit.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDCPool.Deposit.event)
    }
  }

  module Withdraw = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDCPool.Withdraw.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDCPool.Withdraw.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDCPool.Withdraw.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDCPool.Withdraw.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDCPool.Withdraw.event)
    }
  }

  module Swap = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDCPool.Swap.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDCPool.Swap.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("tokenIn")
      tokenIn?: Address.t,
      @as("tokenOut")
      tokenOut?: Address.t,
      @as("amountIn")
      amountIn?: bigint,
      @as("amountOut")
      amountOut?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?tokenIn,
        ?tokenOut,
        ?amountIn,
        ?amountOut,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenIn: tokenIn->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenOut: tokenOut->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amountIn: amountIn->Belt.Option.getWithDefault(0n),
       amountOut: amountOut->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDCPool.Swap.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDCPool.Swap.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDCPool.Swap.event)
    }
  }

}


module NablaUSDTPool = {
  module Deposit = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDTPool.Deposit.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDTPool.Deposit.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDTPool.Deposit.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDTPool.Deposit.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDTPool.Deposit.event)
    }
  }

  module Withdraw = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDTPool.Withdraw.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDTPool.Withdraw.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDTPool.Withdraw.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDTPool.Withdraw.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDTPool.Withdraw.event)
    }
  }

  module Swap = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaUSDTPool.Swap.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaUSDTPool.Swap.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("tokenIn")
      tokenIn?: Address.t,
      @as("tokenOut")
      tokenOut?: Address.t,
      @as("amountIn")
      amountIn?: bigint,
      @as("amountOut")
      amountOut?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?tokenIn,
        ?tokenOut,
        ?amountIn,
        ?amountOut,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenIn: tokenIn->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenOut: tokenOut->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amountIn: amountIn->Belt.Option.getWithDefault(0n),
       amountOut: amountOut->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaUSDTPool.Swap.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaUSDTPool.Swap.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaUSDTPool.Swap.event)
    }
  }

}


module NablaWBTCPool = {
  module Deposit = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaWBTCPool.Deposit.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaWBTCPool.Deposit.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaWBTCPool.Deposit.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaWBTCPool.Deposit.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaWBTCPool.Deposit.event)
    }
  }

  module Withdraw = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaWBTCPool.Withdraw.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaWBTCPool.Withdraw.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("assets")
      assets?: bigint,
      @as("shares")
      shares?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?assets,
        ?shares,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       assets: assets->Belt.Option.getWithDefault(0n),
       shares: shares->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaWBTCPool.Withdraw.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaWBTCPool.Withdraw.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaWBTCPool.Withdraw.event)
    }
  }

  module Swap = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.NablaWBTCPool.Swap.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.NablaWBTCPool.Swap.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("tokenIn")
      tokenIn?: Address.t,
      @as("tokenOut")
      tokenOut?: Address.t,
      @as("amountIn")
      amountIn?: bigint,
      @as("amountOut")
      amountOut?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?tokenIn,
        ?tokenOut,
        ?amountIn,
        ?amountOut,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenIn: tokenIn->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       tokenOut: tokenOut->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amountIn: amountIn->Belt.Option.getWithDefault(0n),
       amountOut: amountOut->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.NablaWBTCPool.Swap.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.NablaWBTCPool.Swap.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.NablaWBTCPool.Swap.event)
    }
  }

}


module TrustlessDeFiTreasury = {
  module DelegationGranted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.DelegationGranted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.DelegationGranted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("aiAgent")
      aiAgent?: Address.t,
      @as("dailyLimitUSD")
      dailyLimitUSD?: bigint,
      @as("validUntil")
      validUntil?: bigint,
      @as("protocolWhitelist")
      protocolWhitelist?: array<Address.t>,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?aiAgent,
        ?dailyLimitUSD,
        ?validUntil,
        ?protocolWhitelist,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       aiAgent: aiAgent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       dailyLimitUSD: dailyLimitUSD->Belt.Option.getWithDefault(0n),
       validUntil: validUntil->Belt.Option.getWithDefault(0n),
       protocolWhitelist: protocolWhitelist->Belt.Option.getWithDefault([]),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.DelegationGranted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.DelegationGranted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.DelegationGranted.event)
    }
  }

  module DelegationUpdated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.DelegationUpdated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.DelegationUpdated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("aiAgent")
      aiAgent?: Address.t,
      @as("dailyLimitUSD")
      dailyLimitUSD?: bigint,
      @as("validUntil")
      validUntil?: bigint,
      @as("protocolWhitelist")
      protocolWhitelist?: array<Address.t>,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?aiAgent,
        ?dailyLimitUSD,
        ?validUntil,
        ?protocolWhitelist,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       aiAgent: aiAgent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       dailyLimitUSD: dailyLimitUSD->Belt.Option.getWithDefault(0n),
       validUntil: validUntil->Belt.Option.getWithDefault(0n),
       protocolWhitelist: protocolWhitelist->Belt.Option.getWithDefault([]),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.DelegationUpdated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.DelegationUpdated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.DelegationUpdated.event)
    }
  }

  module DelegationRevoked = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.DelegationRevoked.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.DelegationRevoked.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("aiAgent")
      aiAgent?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?aiAgent,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       aiAgent: aiAgent->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.DelegationRevoked.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.DelegationRevoked.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.DelegationRevoked.event)
    }
  }

  module DelegationPaused = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.DelegationPaused.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.DelegationPaused.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.DelegationPaused.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.DelegationPaused.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.DelegationPaused.event)
    }
  }

  module DelegationResumed = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.DelegationResumed.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.DelegationResumed.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("validUntil")
      validUntil?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?validUntil,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       validUntil: validUntil->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.DelegationResumed.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.DelegationResumed.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.DelegationResumed.event)
    }
  }

  module SpendRecorded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TrustlessDeFiTreasury.SpendRecorded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TrustlessDeFiTreasury.SpendRecorded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("user")
      user?: Address.t,
      @as("protocol")
      protocol?: Address.t,
      @as("valueUsd")
      valueUsd?: bigint,
      @as("spentToday")
      spentToday?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?user,
        ?protocol,
        ?valueUsd,
        ?spentToday,
        ?mockEventData,
      } = args

      let params = 
      {
       user: user->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       protocol: protocol->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       valueUsd: valueUsd->Belt.Option.getWithDefault(0n),
       spentToday: spentToday->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.TrustlessDeFiTreasury.SpendRecorded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TrustlessDeFiTreasury.SpendRecorded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TrustlessDeFiTreasury.SpendRecorded.event)
    }
  }

}


module UniswapV2Factory = {
  module PairCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Factory.PairCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Factory.PairCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("token0")
      token0?: Address.t,
      @as("token1")
      token1?: Address.t,
      @as("pair")
      pair?: Address.t,
      @as("_3")
      _3?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?token0,
        ?token1,
        ?pair,
        ?_3,
        ?mockEventData,
      } = args

      let params = 
      {
       token0: token0->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       token1: token1->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       pair: pair->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       _3: _3->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.UniswapV2Factory.PairCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Factory.PairCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Factory.PairCreated.event)
    }
  }

}


module UniswapV2Pair_USDC_USDT = {
  module Mint = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_USDT.Mint.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_USDT.Mint.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0")
      amount0?: bigint,
      @as("amount1")
      amount1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0,
        ?amount1,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0: amount0->Belt.Option.getWithDefault(0n),
       amount1: amount1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_USDT.Mint.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_USDT.Mint.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_USDT.Mint.event)
    }
  }

  module Burn = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_USDT.Burn.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_USDT.Burn.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0")
      amount0?: bigint,
      @as("amount1")
      amount1?: bigint,
      @as("to")
      to?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0,
        ?amount1,
        ?to,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0: amount0->Belt.Option.getWithDefault(0n),
       amount1: amount1->Belt.Option.getWithDefault(0n),
       to: to->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_USDT.Burn.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_USDT.Burn.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_USDT.Burn.event)
    }
  }

  module Swap = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_USDT.Swap.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_USDT.Swap.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0In")
      amount0In?: bigint,
      @as("amount1In")
      amount1In?: bigint,
      @as("amount0Out")
      amount0Out?: bigint,
      @as("amount1Out")
      amount1Out?: bigint,
      @as("to")
      to?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0In,
        ?amount1In,
        ?amount0Out,
        ?amount1Out,
        ?to,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0In: amount0In->Belt.Option.getWithDefault(0n),
       amount1In: amount1In->Belt.Option.getWithDefault(0n),
       amount0Out: amount0Out->Belt.Option.getWithDefault(0n),
       amount1Out: amount1Out->Belt.Option.getWithDefault(0n),
       to: to->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_USDT.Swap.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_USDT.Swap.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_USDT.Swap.event)
    }
  }

  module Sync = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_USDT.Sync.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_USDT.Sync.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("reserve0")
      reserve0?: bigint,
      @as("reserve1")
      reserve1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?reserve0,
        ?reserve1,
        ?mockEventData,
      } = args

      let params = 
      {
       reserve0: reserve0->Belt.Option.getWithDefault(0n),
       reserve1: reserve1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_USDT.Sync.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_USDT.Sync.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_USDT.Sync.event)
    }
  }

}


module UniswapV2Pair_USDC_WMON = {
  module Mint = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_WMON.Mint.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_WMON.Mint.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0")
      amount0?: bigint,
      @as("amount1")
      amount1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0,
        ?amount1,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0: amount0->Belt.Option.getWithDefault(0n),
       amount1: amount1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_WMON.Mint.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_WMON.Mint.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_WMON.Mint.event)
    }
  }

  module Burn = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_WMON.Burn.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_WMON.Burn.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0")
      amount0?: bigint,
      @as("amount1")
      amount1?: bigint,
      @as("to")
      to?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0,
        ?amount1,
        ?to,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0: amount0->Belt.Option.getWithDefault(0n),
       amount1: amount1->Belt.Option.getWithDefault(0n),
       to: to->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_WMON.Burn.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_WMON.Burn.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_WMON.Burn.event)
    }
  }

  module Swap = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_WMON.Swap.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_WMON.Swap.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("sender")
      sender?: Address.t,
      @as("amount0In")
      amount0In?: bigint,
      @as("amount1In")
      amount1In?: bigint,
      @as("amount0Out")
      amount0Out?: bigint,
      @as("amount1Out")
      amount1Out?: bigint,
      @as("to")
      to?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?sender,
        ?amount0In,
        ?amount1In,
        ?amount0Out,
        ?amount1Out,
        ?to,
        ?mockEventData,
      } = args

      let params = 
      {
       sender: sender->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount0In: amount0In->Belt.Option.getWithDefault(0n),
       amount1In: amount1In->Belt.Option.getWithDefault(0n),
       amount0Out: amount0Out->Belt.Option.getWithDefault(0n),
       amount1Out: amount1Out->Belt.Option.getWithDefault(0n),
       to: to->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_WMON.Swap.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_WMON.Swap.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_WMON.Swap.event)
    }
  }

  module Sync = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.UniswapV2Pair_USDC_WMON.Sync.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.UniswapV2Pair_USDC_WMON.Sync.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("reserve0")
      reserve0?: bigint,
      @as("reserve1")
      reserve1?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?reserve0,
        ?reserve1,
        ?mockEventData,
      } = args

      let params = 
      {
       reserve0: reserve0->Belt.Option.getWithDefault(0n),
       reserve1: reserve1->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.UniswapV2Pair_USDC_WMON.Sync.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.UniswapV2Pair_USDC_WMON.Sync.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.UniswapV2Pair_USDC_WMON.Sync.event)
    }
  }

}


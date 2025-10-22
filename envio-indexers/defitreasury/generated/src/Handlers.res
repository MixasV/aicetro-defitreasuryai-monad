  @genType
module AISmartAccountFactory = {
  module AccountCreated = Types.MakeRegister(Types.AISmartAccountFactory.AccountCreated)
}

  @genType
module AITreasurySmartAccount = {
  module DailyLimitUpdated = Types.MakeRegister(Types.AITreasurySmartAccount.DailyLimitUpdated)
  module EmergencyRevoke = Types.MakeRegister(Types.AITreasurySmartAccount.EmergencyRevoke)
  module HighRiskAlert = Types.MakeRegister(Types.AITreasurySmartAccount.HighRiskAlert)
  module DelegationConfigured = Types.MakeRegister(Types.AITreasurySmartAccount.DelegationConfigured)
}

  @genType
module EmergencyController = {
  module EmergencyStatusChanged = Types.MakeRegister(Types.EmergencyController.EmergencyStatusChanged)
}

  @genType
module EntryPoint = {
  module UserOperationEvent = Types.MakeRegister(Types.EntryPoint.UserOperationEvent)
}

  @genType
module NablaUSDCPool = {
  module Deposit = Types.MakeRegister(Types.NablaUSDCPool.Deposit)
  module Withdraw = Types.MakeRegister(Types.NablaUSDCPool.Withdraw)
  module Swap = Types.MakeRegister(Types.NablaUSDCPool.Swap)
}

  @genType
module NablaUSDTPool = {
  module Deposit = Types.MakeRegister(Types.NablaUSDTPool.Deposit)
  module Withdraw = Types.MakeRegister(Types.NablaUSDTPool.Withdraw)
  module Swap = Types.MakeRegister(Types.NablaUSDTPool.Swap)
}

  @genType
module NablaWBTCPool = {
  module Deposit = Types.MakeRegister(Types.NablaWBTCPool.Deposit)
  module Withdraw = Types.MakeRegister(Types.NablaWBTCPool.Withdraw)
  module Swap = Types.MakeRegister(Types.NablaWBTCPool.Swap)
}

  @genType
module TrustlessDeFiTreasury = {
  module DelegationGranted = Types.MakeRegister(Types.TrustlessDeFiTreasury.DelegationGranted)
  module DelegationUpdated = Types.MakeRegister(Types.TrustlessDeFiTreasury.DelegationUpdated)
  module DelegationRevoked = Types.MakeRegister(Types.TrustlessDeFiTreasury.DelegationRevoked)
  module DelegationPaused = Types.MakeRegister(Types.TrustlessDeFiTreasury.DelegationPaused)
  module DelegationResumed = Types.MakeRegister(Types.TrustlessDeFiTreasury.DelegationResumed)
  module SpendRecorded = Types.MakeRegister(Types.TrustlessDeFiTreasury.SpendRecorded)
}

  @genType
module UniswapV2Factory = {
  module PairCreated = Types.MakeRegister(Types.UniswapV2Factory.PairCreated)
}

  @genType
module UniswapV2Pair_USDC_USDT = {
  module Mint = Types.MakeRegister(Types.UniswapV2Pair_USDC_USDT.Mint)
  module Burn = Types.MakeRegister(Types.UniswapV2Pair_USDC_USDT.Burn)
  module Swap = Types.MakeRegister(Types.UniswapV2Pair_USDC_USDT.Swap)
  module Sync = Types.MakeRegister(Types.UniswapV2Pair_USDC_USDT.Sync)
}

  @genType
module UniswapV2Pair_USDC_WMON = {
  module Mint = Types.MakeRegister(Types.UniswapV2Pair_USDC_WMON.Mint)
  module Burn = Types.MakeRegister(Types.UniswapV2Pair_USDC_WMON.Burn)
  module Swap = Types.MakeRegister(Types.UniswapV2Pair_USDC_WMON.Swap)
  module Sync = Types.MakeRegister(Types.UniswapV2Pair_USDC_WMON.Sync)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic

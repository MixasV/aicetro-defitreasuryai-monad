  @genType
module EmergencyController = {
  module EmergencyStatusChanged = Types.MakeRegister(Types.EmergencyController.EmergencyStatusChanged)
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

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic

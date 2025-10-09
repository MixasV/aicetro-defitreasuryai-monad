  @genType
module CorporateTreasuryManager = {
  module CorporateAccountCreated = Types.MakeRegister(Types.CorporateTreasuryManager.CorporateAccountCreated)
  module DelegationSpending = Types.MakeRegister(Types.CorporateTreasuryManager.DelegationSpending)
  module DelegationUpdated = Types.MakeRegister(Types.CorporateTreasuryManager.DelegationUpdated)
}

  @genType
module EmergencyController = {
  module EmergencyStatusChanged = Types.MakeRegister(Types.EmergencyController.EmergencyStatusChanged)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic

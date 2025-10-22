import {
  EntryPoint,
} from "../../generated";

EntryPoint.UserOperationEvent.handler(async ({ event, context }) => {
  // Determine source: AI or Manual
  const sender = event.params.sender.toLowerCase();
  const smartAccount = sender; // The sender IS the smart account
  
  // Default to manual (AI detection requires @index in schema for queries)
  const source = 'manual';

  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    userOpHash: event.params.userOpHash,
    sender: sender,
    paymaster: event.params.paymaster.toLowerCase(),
    nonce: event.params.nonce,
    success: event.params.success,
    actualGasCost: event.params.actualGasCost,
    actualGasUsed: event.params.actualGasUsed,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    source: source,
    smartAccount: smartAccount,
  };

  context.EntryPoint_UserOperationEvent.set(entity);

  context.log.info(`[UserOperation] ${sender} (${source}) → ${event.params.success ? 'SUCCESS' : 'FAILED'} (gas: ${event.params.actualGasUsed})`);
});

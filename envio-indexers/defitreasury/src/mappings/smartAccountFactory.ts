import {
  AISmartAccountFactory,
} from "../../generated";

AISmartAccountFactory.AccountCreated.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    account: event.params.account.toLowerCase(),
    owner: event.params.owner.toLowerCase(),
    salt: event.params.salt,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
  };

  context.AISmartAccountFactory_AccountCreated.set(entity);

  context.log.info(`[SmartAccount] Created: ${event.params.account} for owner: ${event.params.owner}`);
});

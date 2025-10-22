import {
  UniswapV2Pair_USDC_USDT,
  UniswapV2Pair_USDC_WMON,
} from "../../generated";

// Helper function to get or create pool for Uniswap pair
async function getOrCreateUniswapPool(
  context: any,
  pairAddress: string,
  token0: string,
  token0Address: string,
  token1: string,
  token1Address: string,
  timestamp: bigint
): Promise<any> {
  const poolId = `uniswap:${pairAddress.toLowerCase()}`;
  let pool = await context.Pool.get(poolId);

  if (!pool) {
    pool = {
      id: poolId,
      protocol: "Uniswap V2",
      poolAddress: pairAddress.toLowerCase(),
      poolType: "lp-pair",
      asset: undefined,
      assetAddress: undefined,
      token0,
      token0Address: token0Address.toLowerCase(),
      token1,
      token1Address: token1Address.toLowerCase(),
      totalDeposits: 0n,
      totalWithdrawals: 0n,
      totalSwapVolume: 0n,
      transactionCount: 0,
      uniqueUsers: 0,
      reserve0: 0n,
      reserve1: 0n,
      lastReserveUpdate: timestamp,
      createdAt: timestamp,
      lastActivityAt: timestamp,
    };
    await context.Pool.set(pool);
  }

  return pool;
}

// Helper function to get or create user position
async function getOrCreateUserPosition(
  context: any,
  user: string,
  poolId: string,
  timestamp: bigint
): Promise<any> {
  const positionId = `${user.toLowerCase()}:${poolId}`;
  let position = await context.UserPosition.get(positionId);

  if (!position) {
    position = {
      id: positionId,
      user: user.toLowerCase(),
      pool_id: poolId,
      shares: 0n,
      totalDeposited: 0n,
      totalWithdrawn: 0n,
      firstDepositAt: timestamp,
      lastActivityAt: timestamp,
      depositCount: 0,
      withdrawCount: 0,
    };
    await context.UserPosition.set(position);
  }

  return position;
}

// Metadata for known pairs
const PAIR_METADATA: Record<
  string,
  {
    token0: string;
    token0Address: string;
    token1: string;
    token1Address: string;
  }
> = {
  "0x3d44d591c8fc89dae3bc5f312c67ca0b44497b86": {
    token0: "USDC",
    token0Address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    token1: "USDT",
    token1Address: "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
  },
  "0x5323821de342c56b80c99fbc7cd725f2da8eb87b": {
    token0: "USDC",
    token0Address: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    token1: "WMON",
    token1Address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  },
};

// ========== USDC-USDT Pair Handlers ==========

UniswapV2Pair_USDC_USDT.Mint.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const liquidityAdded = event.params.amount0 + event.params.amount1;

  pool.totalDeposits = pool.totalDeposits + liquidityAdded;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "mint",
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    shares: undefined,
    tokenIn: undefined,
    tokenOut: undefined,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);

  const position = await getOrCreateUserPosition(
    context,
    event.params.sender.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.totalDeposited = position.totalDeposited + liquidityAdded;
  position.depositCount = position.depositCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);

  if (position.depositCount === 1) {
    pool.uniqueUsers = pool.uniqueUsers + 1;
    await context.Pool.set(pool);
  }
});

UniswapV2Pair_USDC_USDT.Burn.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const liquidityRemoved = event.params.amount0 + event.params.amount1;

  pool.totalWithdrawals = pool.totalWithdrawals + liquidityRemoved;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "burn",
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    shares: undefined,
    tokenIn: undefined,
    tokenOut: undefined,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);

  const position = await getOrCreateUserPosition(
    context,
    event.params.sender.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.totalWithdrawn = position.totalWithdrawn + liquidityRemoved;
  position.withdrawCount = position.withdrawCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);
});

UniswapV2Pair_USDC_USDT.Swap.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const swapVolume = event.params.amount0In + event.params.amount1In;

  pool.totalSwapVolume = pool.totalSwapVolume + swapVolume;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "swap",
    amount0: event.params.amount0In > 0n ? event.params.amount0In : event.params.amount0Out,
    amount1: event.params.amount1In > 0n ? event.params.amount1In : event.params.amount1Out,
    shares: undefined,
    tokenIn: event.params.amount0In > 0n ? metadata.token0Address : metadata.token1Address,
    tokenOut: event.params.amount0Out > 0n ? metadata.token0Address : metadata.token1Address,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);
});

UniswapV2Pair_USDC_USDT.Sync.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  pool.reserve0 = BigInt(event.params.reserve0);
  pool.reserve1 = BigInt(event.params.reserve1);
  pool.lastReserveUpdate = BigInt(event.block.timestamp);
  await context.Pool.set(pool);
});

// ========== USDC-WMON Pair Handlers ==========

UniswapV2Pair_USDC_WMON.Mint.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const liquidityAdded = event.params.amount0 + event.params.amount1;

  pool.totalDeposits = pool.totalDeposits + liquidityAdded;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "mint",
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    shares: undefined,
    tokenIn: undefined,
    tokenOut: undefined,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);

  const position = await getOrCreateUserPosition(
    context,
    event.params.sender.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.totalDeposited = position.totalDeposited + liquidityAdded;
  position.depositCount = position.depositCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);

  if (position.depositCount === 1) {
    pool.uniqueUsers = pool.uniqueUsers + 1;
    await context.Pool.set(pool);
  }
});

UniswapV2Pair_USDC_WMON.Burn.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const liquidityRemoved = event.params.amount0 + event.params.amount1;

  pool.totalWithdrawals = pool.totalWithdrawals + liquidityRemoved;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "burn",
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    shares: undefined,
    tokenIn: undefined,
    tokenOut: undefined,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);

  const position = await getOrCreateUserPosition(
    context,
    event.params.sender.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.totalWithdrawn = position.totalWithdrawn + liquidityRemoved;
  position.withdrawCount = position.withdrawCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);
});

UniswapV2Pair_USDC_WMON.Swap.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  const swapVolume = event.params.amount0In + event.params.amount1In;

  pool.totalSwapVolume = pool.totalSwapVolume + swapVolume;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "swap",
    amount0: event.params.amount0In > 0n ? event.params.amount0In : event.params.amount0Out,
    amount1: event.params.amount1In > 0n ? event.params.amount1In : event.params.amount1Out,
    shares: undefined,
    tokenIn: event.params.amount0In > 0n ? metadata.token0Address : metadata.token1Address,
    tokenOut: event.params.amount0Out > 0n ? metadata.token0Address : metadata.token1Address,
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);
});

UniswapV2Pair_USDC_WMON.Sync.handler(async ({ event, context }) => {
  const pairAddress = event.srcAddress.toLowerCase();
  const metadata = PAIR_METADATA[pairAddress];
  if (!metadata) return;

  const pool = await getOrCreateUniswapPool(
    context,
    pairAddress,
    metadata.token0,
    metadata.token0Address,
    metadata.token1,
    metadata.token1Address,
    BigInt(event.block.timestamp)
  );

  pool.reserve0 = BigInt(event.params.reserve0);
  pool.reserve1 = BigInt(event.params.reserve1);
  pool.lastReserveUpdate = BigInt(event.block.timestamp);
  await context.Pool.set(pool);
});

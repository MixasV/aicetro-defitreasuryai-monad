import {
  NablaUSDCPool,
  NablaUSDTPool,
  NablaWBTCPool,
} from "../../generated";

// Map pool address to metadata
const POOL_METADATA: Record<string, { asset: string; assetAddress: string }> = {
  "0x01b0932f609cae2ac96daf6f2319c7dd7ceb4426": {
    asset: "USDC",
    assetAddress: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
  },
  "0x356fa6db41717ecce81e7732a42eb4e99ae0d7d9": {
    asset: "USDT",
    assetAddress: "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
  },
  "0x5b90901818f0d92825f8b19409323c82abe911fc": {
    asset: "WBTC",
    assetAddress: "",
  },
};

// Helper function to get or create pool
async function getOrCreatePool(
  context: any,
  poolAddress: string,
  protocol: string,
  asset: string,
  assetAddress: string | undefined,
  timestamp: bigint
): Promise<any> {
  const poolId = `${protocol.toLowerCase()}:${asset.toLowerCase()}`;
  let pool = await context.Pool.get(poolId);

  if (!pool) {
    pool = {
      id: poolId,
      protocol,
      poolAddress: poolAddress.toLowerCase(),
      poolType: "single-asset",
      asset,
      assetAddress: assetAddress?.toLowerCase() || undefined,
      token0: undefined,
      token0Address: undefined,
      token1: undefined,
      token1Address: undefined,
      totalDeposits: 0n,
      totalWithdrawals: 0n,
      totalSwapVolume: 0n,
      transactionCount: 0,
      uniqueUsers: 0,
      reserve0: undefined,
      reserve1: undefined,
      lastReserveUpdate: undefined,
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

// ========== USDC Pool Handlers ==========

NablaUSDCPool.Deposit.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalDeposits = pool.totalDeposits + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "deposit",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares + event.params.shares;
  position.totalDeposited = position.totalDeposited + event.params.assets;
  position.depositCount = position.depositCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);

  if (position.depositCount === 1) {
    pool.uniqueUsers = pool.uniqueUsers + 1;
    await context.Pool.set(pool);
  }
});

NablaUSDCPool.Withdraw.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalWithdrawals = pool.totalWithdrawals + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "withdraw",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares - event.params.shares;
  position.totalWithdrawn = position.totalWithdrawn + event.params.assets;
  position.withdrawCount = position.withdrawCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);
});

NablaUSDCPool.Swap.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalSwapVolume = pool.totalSwapVolume + event.params.amountIn;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "swap",
    amount0: event.params.amountIn,
    amount1: event.params.amountOut,
    shares: undefined,
    tokenIn: event.params.tokenIn.toLowerCase(),
    tokenOut: event.params.tokenOut.toLowerCase(),
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);
});

// ========== USDT Pool Handlers ==========

NablaUSDTPool.Deposit.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalDeposits = pool.totalDeposits + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "deposit",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares + event.params.shares;
  position.totalDeposited = position.totalDeposited + event.params.assets;
  position.depositCount = position.depositCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);

  if (position.depositCount === 1) {
    pool.uniqueUsers = pool.uniqueUsers + 1;
    await context.Pool.set(pool);
  }
});

NablaUSDTPool.Withdraw.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalWithdrawals = pool.totalWithdrawals + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "withdraw",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares - event.params.shares;
  position.totalWithdrawn = position.totalWithdrawn + event.params.assets;
  position.withdrawCount = position.withdrawCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);
});

NablaUSDTPool.Swap.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalSwapVolume = pool.totalSwapVolume + event.params.amountIn;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "swap",
    amount0: event.params.amountIn,
    amount1: event.params.amountOut,
    shares: undefined,
    tokenIn: event.params.tokenIn.toLowerCase(),
    tokenOut: event.params.tokenOut.toLowerCase(),
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);
});

// ========== WBTC Pool Handlers ==========

NablaWBTCPool.Deposit.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalDeposits = pool.totalDeposits + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "deposit",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares + event.params.shares;
  position.totalDeposited = position.totalDeposited + event.params.assets;
  position.depositCount = position.depositCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);

  if (position.depositCount === 1) {
    pool.uniqueUsers = pool.uniqueUsers + 1;
    await context.Pool.set(pool);
  }
});

NablaWBTCPool.Withdraw.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalWithdrawals = pool.totalWithdrawals + event.params.assets;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.user.toLowerCase(),
    transactionType: "withdraw",
    amount0: event.params.assets,
    amount1: undefined,
    shares: event.params.shares,
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
    event.params.user.toLowerCase(),
    pool.id,
    BigInt(event.block.timestamp)
  );

  position.shares = position.shares - event.params.shares;
  position.totalWithdrawn = position.totalWithdrawn + event.params.assets;
  position.withdrawCount = position.withdrawCount + 1;
  position.lastActivityAt = BigInt(event.block.timestamp);
  await context.UserPosition.set(position);
});

NablaWBTCPool.Swap.handler(async ({ event, context }) => {
  const poolAddress = event.srcAddress.toLowerCase();
  const metadata = POOL_METADATA[poolAddress];
  if (!metadata) return;

  const pool = await getOrCreatePool(
    context,
    poolAddress,
    "Nabla",
    metadata.asset,
    metadata.assetAddress,
    BigInt(event.block.timestamp)
  );

  pool.totalSwapVolume = pool.totalSwapVolume + event.params.amountIn;
  pool.transactionCount = pool.transactionCount + 1;
  pool.lastActivityAt = BigInt(event.block.timestamp);
  await context.Pool.set(pool);

  const txId = `${`tx_${event.chainId}_${event.block.number}_${event.logIndex}`}:${event.logIndex}`;
  const transaction = {
    id: txId,
    pool_id: pool.id,
    user: event.params.sender.toLowerCase(),
    transactionType: "swap",
    amount0: event.params.amountIn,
    amount1: event.params.amountOut,
    shares: undefined,
    tokenIn: event.params.tokenIn.toLowerCase(),
    tokenOut: event.params.tokenOut.toLowerCase(),
    txHash: `tx_${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    gasUsed: undefined,
  };
  await context.PoolTransaction.set(transaction);
});

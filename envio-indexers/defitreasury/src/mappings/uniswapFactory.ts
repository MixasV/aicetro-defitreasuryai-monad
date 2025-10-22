import { UniswapV2Factory } from "../../generated";

// PairCreated handler - auto-discover new pairs
UniswapV2Factory.PairCreated.handler(async ({ event, context }) => {
  const pairAddress = event.params.pair.toLowerCase();
  const token0 = event.params.token0.toLowerCase();
  const token1 = event.params.token1.toLowerCase();

  // Create pool ID
  const poolId = `uniswap:${pairAddress}`;

  // Check if pool already exists
  let pool = await context.Pool.get(poolId);

  if (!pool) {
    // Create new pool entity
    pool = {
      id: poolId,
      protocol: "Uniswap V2",
      poolAddress: pairAddress,
      poolType: "lp-pair",
      asset: undefined,
      assetAddress: undefined,
      token0: undefined, // We don't have token symbols yet
      token0Address: token0,
      token1: undefined,
      token1Address: token1,
      totalDeposits: 0n,
      totalWithdrawals: 0n,
      totalSwapVolume: 0n,
      transactionCount: 0,
      uniqueUsers: 0,
      reserve0: 0n,
      reserve1: 0n,
      lastReserveUpdate: BigInt(event.block.timestamp),
      createdAt: BigInt(event.block.timestamp),
      lastActivityAt: BigInt(event.block.timestamp),
    };

    await context.Pool.set(pool);

    console.log(
      `[UniswapFactory] New pair created: ${pairAddress} (${token0}/${token1})`
    );
  }
});

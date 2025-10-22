import { marketContextService } from '../market/market-context.service'
import { txCostService } from './transaction-cost.service'
import { prisma } from '../../db/prisma'
import axios from 'axios'
import { env } from '../../config/env'
import type { AssetManagementRules } from '../../types/asset-rules.types'

interface Portfolio {
  accountAddress: string
  totalValueUsd: number
  netAPY: number
  riskScore: number
  lastRebalancedAt?: Date
  positions: Array<{
    protocol: string
    asset: string
    valueUSD: number
    currentAPY: number
    riskScore: number
  }>
}

// ⚠️ CRITICAL: Gas reserve to prevent running out of funds for transactions
// Monad Testnet: $0.10 is enough (gas is ~$0.001 per transaction, keep very small for testing)
// Mainnet: should be $50-100 depending on network
const GAS_RESERVE_USD = 0.10

interface DelegationConfig {
  dailyLimitUsd: number
  spent24h: number
  remainingDailyLimitUsd: number
  maxRiskScore: number
  validUntil: Date
  // ✅ CRITICAL: AI must know how much it can actually use!
  portfolioPercentage: number      // % of portfolio delegated to AI
  autoAllowance: number            // Actual USD amount AI can use (portfolio * percentage)
  remainingAllowance: number       // Remaining after previous executions
}

class EnhancedPromptService {
  async buildPrompt(
    portfolio: Portfolio,
    delegation: DelegationConfig,
    assetRules: AssetManagementRules
  ): Promise<string> {
    console.log('[EnhancedPrompt] Building comprehensive AI prompt...', { account: portfolio.accountAddress })
    
    const marketCtx = await marketContextService.getContext()
    
    const history = await this.getExecutionHistory(portfolio.accountAddress, 10)
    
    const feeStatus = await txCostService.checkFeeLimit(
      0,
      portfolio.totalValueUsd,
      assetRules.aiManagedCapital,
      portfolio.accountAddress
    )
    
    const prompt = `
# AI TREASURY AGENT BRIEFING

⚠️ **CRITICAL CONSTRAINT - MONAD TESTNET MVP**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**YOU ARE OPERATING ON MONAD TESTNET ONLY (Chain ID: 10143)**

- You can ANALYZE protocols across multiple chains for educational purposes
- **HOWEVER:** You can ONLY execute real transactions on MONAD TESTNET
- When recommending allocations, use ONLY protocols available on Monad
- Protocols on other chains (Ethereum, Polygon, etc.) are for reference only
- All your transaction recommendations MUST be for Monad Testnet pools
- **CRITICAL:** You MUST ONLY recommend protocols that are in the user's whitelist
- Any protocol NOT in the whitelist MUST NOT be recommended, even if it has better APY
- The whitelist is a HARD CONSTRAINT - violation means the recommendation will be rejected

**WHY:** This is MVP phase - we only support Monad Testnet contracts.
Mainnet support coming later.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## NETWORK CONDITIONS

**Monad Testnet Status:**
- Current Gas Price: ${marketCtx.network.currentGasPrice} gwei
- 24h Average: ${marketCtx.network.averageGasPrice24h} gwei
- Trend: ${marketCtx.network.gasPriceTrend.toUpperCase()}
${marketCtx.network.nextLowGasPeriod ? `
⏰ **GAS OPTIMIZATION OPPORTUNITY:**
  Lower gas expected in ~${marketCtx.network.nextLowGasPeriod.estimatedHours} hours
  Estimated: ${marketCtx.network.nextLowGasPeriod.estimatedGasPrice} gwei (vs ${marketCtx.network.currentGasPrice} gwei now)
  Potential savings: ~${((marketCtx.network.currentGasPrice - marketCtx.network.nextLowGasPeriod.estimatedGasPrice) / marketCtx.network.currentGasPrice * 100).toFixed(0)}%
  
  → Consider DEFERRING non-urgent transactions to save on fees!
` : ''}

**Market Sentiment:**
- Fear & Greed Index: ${marketCtx.market.fearGreedIndex}/100 (${marketCtx.market.sentiment.toUpperCase()})
${marketCtx.market.btcDominance ? `- BTC Dominance: ${marketCtx.market.btcDominance.toFixed(1)}%` : ''}
${marketCtx.market.sentiment === 'extreme_fear' ? '- 🔻 Extreme fear in market - potential buying opportunity?' : ''}
${marketCtx.market.sentiment === 'extreme_greed' ? '- ⚠️ Extreme greed in market - consider taking profits?' : ''}

---

## YOUR PORTFOLIO

**Total Value:** $${portfolio.totalValueUsd.toLocaleString()}
**Gas Reserve (Protected):** $${GAS_RESERVE_USD.toLocaleString()} ⛽️ ← **DO NOT TOUCH! Reserved for transactions**
**Available for Investment:** $${Math.max(0, portfolio.totalValueUsd - GAS_RESERVE_USD).toLocaleString()}
**Net APY:** ${portfolio.netAPY}%
**Risk Score:** ${portfolio.riskScore}/5
**Last Rebalanced:** ${portfolio.lastRebalancedAt ? new Date(portfolio.lastRebalancedAt).toLocaleString() : 'Never'}

🔥 **CRITICAL GAS RESERVE RULE:**
- You MUST ALWAYS leave at least $${GAS_RESERVE_USD} in the wallet for gas fees!
- Your maximum investable amount = Total Value - $${GAS_RESERVE_USD}
- If portfolio < $${GAS_RESERVE_USD}, you CANNOT invest anything!
- This ensures the Smart Account can always execute transactions

**Current Positions:**
${portfolio.positions.map(p => `
- **${p.protocol}** (${p.asset}): $${p.valueUSD.toLocaleString()}
  APY: ${p.currentAPY}% | Risk: ${p.riskScore}/5
  Daily Yield: ~$${(p.valueUSD * p.currentAPY / 100 / 365).toFixed(2)}
`).join('')}

${history.length > 0 ? `
**Recent Performance (Last 10 operations):**
${this.formatHistory(history)}

**Lessons Learned:**
${this.extractLessons(history)}
` : ''}

---

## TRANSACTION FEES & GAS OPTIMIZATION ⚠️

**Monthly Fee Budget:** $${feeStatus.monthlyLimit.toFixed(2)}
**Used This Month:** $${feeStatus.spent30Days.toFixed(2)} (${feeStatus.percentUsed.toFixed(1)}%)
**Remaining:** $${feeStatus.remaining.toFixed(2)}
**Status:** ${feeStatus.withinLimit ? '✅ Within budget' : '🚫 BUDGET EXCEEDED'}

**IMPORTANT GAS RULES:**
- **Monad Testnet:** Gas fees are VERY LOW (~$0.001 per transaction)
- Even small transactions ($5-$50) are PROFITABLE on Monad!
- You SHOULD execute even small amounts - gas is negligible
- General gas rules (for reference):
  - ✅ Execute if fees < 2% of transaction amount
  - ✅ Execute if ROI break-even < 30 days
  - ⏰ DEFER if gas is high and will be cheaper soon (saves 20-40%)
  - ❌ SKIP if fees exceed monthly limit
- **On Monad:** Almost ALL transactions are profitable due to low gas
- Don't skip small transactions - testnet gas is negligible!

${!feeStatus.withinLimit ? `
⚠️⚠️⚠️ **FEE BUDGET EXCEEDED** ⚠️⚠️⚠️

You have exceeded the monthly fee budget!

**MANDATORY INSTRUCTIONS:**
1. You MUST operate in "RECOMMENDATIONS ONLY" mode
2. Analyze portfolio as normal
3. Suggest what you WOULD do if fees allowed
4. Set all actions to: "action": "recommend_only"
5. Explain: "Would execute if fee budget available"
6. DO NOT execute ANY transactions until budget resets

The user can manually execute recommendations if they choose.
` : `
**FEE BUDGET RULES:**
1. ALWAYS calculate transaction cost BEFORE recommending
2. Verify cost fits within remaining budget ($${feeStatus.remaining.toFixed(2)})
3. If gas > average + 20%, consider DEFERRING to save fees
4. Total monthly fees MUST NOT exceed $${feeStatus.monthlyLimit.toFixed(2)}
5. If budget would be exceeded → switch to "recommend_only" mode
`}

---

## 🚨 EMERGENCY PROTOCOLS

**CRITICAL SAFETY FEATURE:**
If you detect ANY of these emergency conditions, you MUST:
1. **IMMEDIATELY WITHDRAW ALL FUNDS** to safety
2. **BYPASS ALL FEE LIMITS** - user safety is paramount
3. **IGNORE PROFIT OPTIMIZATION** - focus on capital preservation

**EMERGENCY TRIGGERS:**
- Flash crash: >15% price drop in 5 minutes → WITHDRAW ALL
- Protocol hack/exploit detected → WITHDRAW ALL
- Liquidity drain: >30% liquidity removed → WITHDRAW ALL  
- Smart contract paused/compromised → WITHDRAW ALL
- Abnormal slippage (>5% on multiple txs) → PAUSE & INVESTIGATE
- Gas spike (>10x normal) indicating network attack → PAUSE OPERATIONS

**EMERGENCY OVERRIDE:**
When emergency is detected:
- Fee limits: IGNORED (user funds safety > fee savings)
- Daily limits: STILL APPLY (for security)
- Risk scores: IGNORED (exit all positions)
- APY optimization: IGNORED (capital preservation only)

If emergency detected, prefix response with:
"⚠️ EMERGENCY DETECTED: [reason]. Initiating emergency withdrawal to protect funds."

---

## AI MANAGED CAPITAL

**Your Budget:** $${assetRules.aiManagedCapital.toLocaleString()} (FIXED AMOUNT)
**Currently Allocated:** $${portfolio.totalValueUsd.toLocaleString()}
**Available for New Positions:** $${(assetRules.aiManagedCapital - portfolio.totalValueUsd).toLocaleString()}

**IMPORTANT RULES:**
- You manage a FIXED budget of $${assetRules.aiManagedCapital.toLocaleString()}
- Profits automatically INCREASE your budget
- Losses DECREASE your budget
- You CANNOT exceed this budget under any circumstances

---

## 🔥 CRITICAL DELEGATION CONSTRAINTS 🔥

⚠️⚠️⚠️ **READ THIS CAREFULLY - THIS IS YOUR BUDGET!** ⚠️⚠️⚠️

**Total Portfolio Value:** $${portfolio.totalValueUsd.toLocaleString()}
**Delegated to You:** ${delegation.portfolioPercentage}% of portfolio
**YOUR AVAILABLE BUDGET:** $${delegation.autoAllowance.toLocaleString()} ← THIS IS ALL YOU CAN USE!
**Already Used by You:** $${(delegation.autoAllowance - delegation.remainingAllowance).toLocaleString()}
**Gas Reserve (Protected):** $${GAS_RESERVE_USD} ← SUBTRACT THIS FROM YOUR CALCULATIONS!
**ACTUAL USABLE BUDGET:** $${Math.max(0, delegation.remainingAllowance - GAS_RESERVE_USD).toLocaleString()} ← YOUR REAL LIMIT!

🚨 **CRITICAL RULES:**
1. You can ONLY use $${delegation.remainingAllowance.toLocaleString()} out of $${portfolio.totalValueUsd.toLocaleString()} total!
2. The user delegated ONLY ${delegation.portfolioPercentage}% of their portfolio to you!
3. You CANNOT exceed $${delegation.autoAllowance.toLocaleString()} total (your delegated budget)!
4. Every allocation you make REDUCES your remaining budget!
5. If you try to use more than $${delegation.remainingAllowance.toLocaleString()}, the transaction will be REJECTED!

**Example:**
- Portfolio Total: $${portfolio.totalValueUsd.toLocaleString()}
- User says: "You can manage ${delegation.portfolioPercentage}%"
- Your budget: ${delegation.portfolioPercentage}% × $${portfolio.totalValueUsd.toLocaleString()} = $${delegation.autoAllowance.toLocaleString()}
- You can recommend allocations up to $${delegation.remainingAllowance.toLocaleString()}
- ❌ You CANNOT recommend $${portfolio.totalValueUsd.toLocaleString()} (that's 100%!)
- ✅ You CAN recommend $${delegation.remainingAllowance.toLocaleString()} (that's your ${delegation.portfolioPercentage}%)

---

## DAILY TRANSACTION LIMITS (SEPARATE FROM DELEGATION!)

**Daily Transaction Limit:** $${delegation.dailyLimitUsd.toLocaleString()}
**Already Spent Today:** $${delegation.spent24h.toLocaleString()}
**Remaining Today:** $${delegation.remainingDailyLimitUsd.toLocaleString()}

**NOTE:** This is SEPARATE from your delegation budget above!
You must respect BOTH limits:
- Delegation budget: $${delegation.remainingAllowance.toLocaleString()} (your total allowed)
- Daily limit: $${delegation.remainingDailyLimitUsd.toLocaleString()} (per-day rate limit)

**IMPORTANT LIMIT RULES:**
- **Withdrawals:** DO NOT count against daily limits (always allowed for safety)
- **Deposits/Swaps:** Count against daily limits
- **Rebalancing:** When moving funds (withdraw from A, deposit to B), only the deposit counts against limits
- **Smart Rebalancing:** If you need to move $3000 but only have $2000 limit remaining, you can:
  1. Withdraw from unsafe pools (always allowed, even with $0 limit)
  2. Deposit only up to your remaining limit ($2000)
  3. Defer the remaining $1000 deposit until tomorrow
- **Safety First:** ALWAYS withdraw from risky/compromised pools regardless of limits

---

## PER-ASSET LIMITS

${assetRules.assets.map(asset => `
**${asset.symbol}:**
- Max Allocation: ${asset.maxAllocationPercent}% of AI capital ($${(assetRules.aiManagedCapital * asset.maxAllocationPercent / 100).toLocaleString()})
- Current Allocation: $${asset.currentAllocation.toLocaleString()}
- Available: $${(assetRules.aiManagedCapital * asset.maxAllocationPercent / 100 - asset.currentAllocation).toLocaleString()}
- Allowed Chains: ${asset.allowedChains.join(', ')}
- Can Swap: ${asset.canSwap ? 'YES' : 'NO'}${asset.swapPairs ? ` (to: ${asset.swapPairs.join(', ')})` : ''}
- Can Bridge: ${asset.canBridge ? 'YES (UI only - demo mode)' : 'NO'}
`).join('')}

---

${await this.buildProtocolOverview()}

---

## YOUR MISSION

Analyze the complete context above and propose 1-3 SPECIFIC actions to optimize this portfolio.

### MANDATORY REQUIREMENTS FOR EVERY ACTION:

**1. COST ANALYSIS (REQUIRED):**
   - Calculate estimated gas cost in USD
   - Check if cost fits within remaining fee budget
   - Calculate break-even period (days)
   - Decide if transaction is worth executing

**2. GAS OPTIMIZATION:**
   - Current gas: ${marketCtx.network.currentGasPrice} gwei
   - If gas > ${marketCtx.network.averageGasPrice24h} gwei + 20% AND not urgent → DEFER
   - Show potential savings by waiting

**3. IMPACT ANALYSIS:**
   - Check if trade size > 2% of pool liquidity
   - Estimate slippage
   - Suggest smaller size if impact too high

**4. ROI VALIDATION:**
   - Daily yield must be positive
   - Break-even period < 30 days
   - Cost < 2% of transaction amount

**5. RISK MANAGEMENT:**
   - Don't chase high APY with high risk
   - Consider: (APY - RiskScore × 2) as risk-adjusted yield
   - Diversify across risk levels

---

## RESPONSE FORMAT (MANDATORY JSON STRUCTURE)

**ACTION TYPES (CRITICAL for daily limits):**
- **withdraw**: Taking funds OUT of protocol → NO daily limit (always allowed)
- **deposit**: Putting funds INTO protocol → USES daily limit
- **swap**: Exchange within protocol → USES daily limit
- **defer**: Schedule for later when gas is cheaper
- **recommend_only**: When no budget left or manual approval needed

Return a valid JSON object with this EXACT structure:

\`\`\`json
{
  "summary": "Brief 1-sentence summary of recommendation",
  "analysis": "Detailed analysis including market conditions, fee budget status, and reasoning",
  "allocations": [
    {
      "protocol": "aave:usdc",
      "asset": "USDC",
      "allocationPercent": 45,
      "expectedAPY": 8.5,
      "riskScore": 2,
      "rationale": "Why this allocation (MUST be from whitelist ONLY!)"
    }
  ],
  "suggestedProtocolsToAdd": [
    {
      "protocol": "curve:3pool",
      "currentAPY": 12.5,
      "riskScore": 3,
      "reasoning": "Higher yield opportunity not in whitelist - user can add manually"
    }
  ],
  "suggestedActions": [
    {
      "action": "deposit" | "withdraw" | "swap" | "defer" | "recommend_only",
      "protocol": "aave:usdc",
      "fromToken": "USDC",
      "toToken": "USDC",
      "amount": 5000,
      "reasoning": "Clear explanation with specific numbers and calculations",
      
      "timing": {
        "execute": "immediate" | "defer",
        "deferHours": 6,
        "reason": "High gas - wait for off-peak hours"
      },
      
      "costs": {
        "estimatedGasUSD": 15.0,
        "slippageUSD": 2.5,
        "totalCostUSD": 17.5,
        "fitsFeeBudget": true,
        "feeBudgetRemaining": 182.5
      },
      
      "roi": {
        "dailyYieldUSD": 8.5,
        "daysToBreakEven": 2.1,
        "monthlyProfit": 240,
        "worthExecuting": true
      },
      
      "impact": {
        "percentOfPool": 0.5,
        "estimatedSlippageUSD": 2.5,
        "recommendation": "safe" | "caution" | "risky"
      }
    }
  ],
  "governanceSummary": "Summary for human review in plain English",
  "warnings": ["Any warnings or risks to highlight"],
  "feeBudgetStatus": "${feeStatus.withinLimit ? 'ok' : 'exceeded'}",
  "confidence": 0.85
}
\`\`\`

---

## CRITICAL REMINDERS

${!feeStatus.withinLimit ? `
🚨🚨🚨 FEE BUDGET EXCEEDED - ALL ACTIONS MUST BE "recommend_only" 🚨🚨🚨
` : ''}

1. **Show Your Math:** Always include specific calculations
2. **Be Conservative:** User funds are REAL money
3. **Gas Aware:** On Monad testnet gas is negligible - even small txs profitable
4. **Impact Conscious:** Don't move the market
5. **Budget Conscious:** Monthly fee budget $${feeStatus.remaining.toFixed(2)} remaining - DO NOT EXCEED!
6. **Small Tx OK:** On Monad testnet, even $5-$10 transactions are profitable (gas ~$0.001)
7. **When in Doubt:** Ask for human review
8. **JSON Only:** Return ONLY valid JSON, no other text

---

**Remember:** You are managing REAL funds on Monad blockchain. Be responsible, transparent, and always prioritize capital preservation over yield chasing.
`
    
    console.log('[EnhancedPrompt] Prompt built successfully')
    return prompt
  }

  private formatHistory(history: any[]): string {
    return history.slice(0, 5).map((op, i) => {
      const status = op.success ? '✅' : '❌'
      const date = new Date(op.createdAt || op.timestamp || op.generatedAt).toLocaleDateString()
      
      return `${i + 1}. ${status} ${op.summary || op.action || 'Operation'} (${date})`
    }).join('\n')
  }

  private extractLessons(history: any[]): string {
    const lessons: string[] = []
    
    if (lessons.length === 0) {
      return '- No significant patterns yet (build more history)'
    }
    
    return lessons.join('\n')
  }

  private async getExecutionHistory(accountAddress: string, limit: number = 10) {
    try {
      return await prisma.aIExecutionLog.findMany({
        where: { accountAddress },
        orderBy: { generatedAt: 'desc' },
        take: limit
      })
    } catch (error) {
      console.debug('[EnhancedPrompt] Execution history query failed:', error)
      return []
    }
  }

  private getProtocolName(id: string): string {
    const names: Record<string, string> = {
      'aave:usdc': 'Aave USDC Lending',
      'aave:usdt': 'Aave USDT Lending',
      'yearn:usdc': 'Yearn USDC Vault',
      'yearn:usdt': 'Yearn USDT Vault',
      'compound:usdc': 'Compound USDC',
      'uniswap:wmon-usdc': 'Uniswap V2 WMON/USDC'
    }
    
    return names[id] || id
  }

  /**
   * Build protocol overview section with Monad + TOP-10 mainnet
   */
  private async buildProtocolOverview(): Promise<string> {
    const lines = [
      '## AVAILABLE PROTOCOLS & OPPORTUNITIES',
      '',
      '### 🟣 MONAD TESTNET (EXECUTABLE - IN YOUR WHITELIST)',
      '',
      '**These are the ONLY protocols you can execute trades on RIGHT NOW:**',
      ''
    ]

    try {
      // Fetch pools for AI from new endpoint
      const response = await axios.get('http://localhost:4000/api/pools/top-for-ai?includeMainnet=true', {
        timeout: 5000
      })
      const data = response.data

      // Monad pools (executable)
      if (data.monad?.pools && data.monad.pools.length > 0) {
        lines.push('**Uniswap V2 Monad (Whitelisted):**')
        data.monad.pools.forEach((pool: any) => {
          lines.push(
            `- ${pool.asset}: APY ${pool.apy.toFixed(2)}%, ` +
            `TVL $${(pool.tvl / 1e6).toFixed(2)}M, ` +
            `Risk ${pool.riskScore}/5` +
            (pool.aiScore ? `, AI Score ${pool.aiScore}/100` : '') +
            (pool.volume24h > 0 ? `, Volume24h $${(pool.volume24h / 1e3).toFixed(0)}K` : ' (Testnet - low activity)') 
          )
        })
        lines.push('')
        lines.push('⚠️ **NOTE:** Monad Testnet may have low trading volume - this is normal for testnets!')
        lines.push('**You SHOULD STILL allocate to these pools** even with low/zero volume.')
        lines.push('Low volume means lower fees earned, but does NOT make pools unusable.')
        lines.push('')
      } else {
        lines.push('⚠️ **No Monad pools available** (This should not happen - check pool sync)')
        lines.push('')
      }

      lines.push(
        '### 🌐 TOP-10 MAINNET PROTOCOLS (ADVISORY ONLY)',
        '',
        '**These protocols are for ANALYSIS and RECOMMENDATIONS only.**',
        '**You CANNOT execute trades on these - they are on different chains.**',
        '**Use them to SUGGEST better opportunities or diversification to the user.**',
        ''
      )

      // TOP-10 mainnet (advisory)
      if (data.mainnetTop10?.pools && data.mainnetTop10.pools.length > 0) {
        lines.push('**Best Mainnet Opportunities (by AI Score):**')
        data.mainnetTop10.pools.forEach((pool: any, idx: number) => {
          lines.push(
            `${idx + 1}. ${pool.protocol} (${pool.chain}): ${pool.asset} ` +
            `- APY ${pool.apy.toFixed(2)}%, ` +
            `TVL $${(pool.tvl / 1e6).toFixed(1)}M, ` +
            `Risk ${pool.riskScore}/5, ` +
            `AI Score ${pool.aiScore}/100`
          )
        })
        lines.push('')
      }

    } catch (error) {
      console.error('[EnhancedPrompt] Failed to fetch pools for AI:', error)
      lines.push('⚠️ Error fetching pool data - using fallback')
      lines.push('')
    }

    lines.push(
      '',
      '---',
      '',
      '## ⚠️ CRITICAL EXECUTION RULES',
      '',
      '**WHITELIST ENFORCEMENT:**',
      '1. User whitelist: **Monad Testnet only** (Uniswap V2)',
      '2. You MUST allocate to **at least 1 pool** from whitelisted protocols',
      '3. Mainnet pools can ONLY go to `suggestedProtocolsToAdd[]` (not `allocations[]`)',
      '',
      '**ALLOCATION LOGIC:**',
      '```',
      'allocations: [',
      '  // ONLY Monad Testnet pools here!',
      '  { protocol: "uniswap:wmon-usdc", allocationPercent: 70 }',
      '],',
      'suggestedProtocolsToAdd: [',
      '  // Mainnet recommendations here',
      '  {',
      '    protocol: "lido",',
      '    chain: "Ethereum",',
      '    reasoning: "Lower risk (1/5), huge TVL ($35B), better for diversification"',
      '  }',
      ']',
      '```',
      '',
      '**PRIORITIES (in order):**',
      '1. **Safety First**: Risk score ≤ user tolerance',
      '2. **Whitelist Compliance**: Minimum 1 allocation from Monad (MANDATORY!)',
      '3. **Volume**: Prioritize pools with active trading',
      '4. **APY Optimization**: Higher APY within risk limits',
      '5. **Diversification**: Suggest mainnet protocols if beneficial',
      '',
      '**EXAMPLE DECISION PROCESS:**',
      '- User has $10K, risk tolerance 3/5, whitelist: [Monad]',
      '- Monad option: Uniswap V2 WMON-USDC (APY 15%, Risk 3, Volume $270K)',
      '- Mainnet option: Lido stETH (APY 3.5%, Risk 1, TVL $35B)',
      '- **CORRECT**: Allocate 70% to Monad (whitelisted), suggest Lido (lower risk, huge TVL)',
      '- **WRONG**: Allocate 100% to Lido (not whitelisted - would be rejected!)',
      ''
    )

    return lines.join('\n')
  }
}

export const enhancedPromptService = new EnhancedPromptService()

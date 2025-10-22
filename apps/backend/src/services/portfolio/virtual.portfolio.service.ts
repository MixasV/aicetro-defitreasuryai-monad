import { prisma } from '../../lib/prisma'
import { DEMO_VIRTUAL_BALANCE_USD, DEMO_CORPORATE_ACCOUNT } from '../../config/demo'

interface VirtualPosition {
  protocol: string
  asset: string
  amount: number
  valueUSD: number
  currentAPY: number
  riskScore: number
  allocatedAt: Date
}

interface VirtualPortfolioData {
  accountAddress: string
  currentBalanceUsd: number
  totalProfitUsd: number
  positions: VirtualPosition[]
  lastCalculatedAt: Date
}

export class VirtualPortfolioService {
  /**
   * Get or create virtual portfolio for demo account
   */
  async getOrCreate(accountAddress: string): Promise<VirtualPortfolioData> {
    let portfolio = await prisma.virtualPortfolio.findUnique({
      where: { accountAddress }
    })

    if (!portfolio) {
      // Create initial portfolio with default positions
      const initialPositions: VirtualPosition[] = [
        {
          protocol: 'Aave Monad',
          asset: 'USDC',
          amount: 50000,
          valueUSD: 50000,
          currentAPY: 8.4,
          riskScore: 2,
          allocatedAt: new Date()
        },
        {
          protocol: 'Yearn Monad',
          asset: 'USDT',
          amount: 25000,
          valueUSD: 25000,
          currentAPY: 11.8,
          riskScore: 4,
          allocatedAt: new Date()
        },
        {
          protocol: 'Nabla Finance',
          asset: 'USDC',
          amount: 25000,
          valueUSD: 25000,
          currentAPY: 15.6,
          riskScore: 6,
          allocatedAt: new Date()
        }
      ]

      portfolio = await prisma.virtualPortfolio.create({
        data: {
          accountAddress,
          initialBalanceUsd: DEMO_VIRTUAL_BALANCE_USD,
          currentBalanceUsd: DEMO_VIRTUAL_BALANCE_USD,
          totalProfitUsd: 0,
          positions: JSON.stringify(initialPositions),
          lastCalculatedAt: new Date()
        }
      })
    }

    // Calculate current value based on time elapsed and APY
    const positions = JSON.parse(portfolio.positions as string) as VirtualPosition[]
    const updatedPositions = positions.map(pos => this.calculatePositionValue(pos))
    const currentBalance = updatedPositions.reduce((sum, pos) => sum + pos.valueUSD, 0)
    const totalProfit = currentBalance - portfolio.initialBalanceUsd

    // Update in database
    await prisma.virtualPortfolio.update({
      where: { id: portfolio.id },
      data: {
        currentBalanceUsd: currentBalance,
        totalProfitUsd: totalProfit,
        positions: JSON.stringify(updatedPositions),
        lastCalculatedAt: new Date()
      }
    })

    return {
      accountAddress: portfolio.accountAddress,
      currentBalanceUsd: currentBalance,
      totalProfitUsd: totalProfit,
      positions: updatedPositions,
      lastCalculatedAt: new Date()
    }
  }

  /**
   * Calculate position value based on APY and time elapsed
   */
  private calculatePositionValue(position: VirtualPosition): VirtualPosition {
    const allocatedAt = new Date(position.allocatedAt)
    const now = new Date()
    const hoursElapsed = (now.getTime() - allocatedAt.getTime()) / (1000 * 60 * 60)
    const yearsElapsed = hoursElapsed / (365 * 24)
    
    // Simple compound interest: FV = PV * (1 + r)^t
    const apyDecimal = position.currentAPY / 100
    const newValue = position.amount * Math.pow(1 + apyDecimal, yearsElapsed)

    return {
      ...position,
      valueUSD: Number(newValue.toFixed(2))
    }
  }

  /**
   * Recalculate all virtual portfolios (for cron job)
   */
  async recalculateAll(): Promise<void> {
    const portfolios = await prisma.virtualPortfolio.findMany()

    for (const portfolio of portfolios) {
      await this.getOrCreate(portfolio.accountAddress)
    }
  }

  /**
   * Virtual rebalance - AI agent changes positions without blockchain transactions
   */
  async virtualRebalance(
    accountAddress: string,
    newAllocations: Array<{
      protocol: string
      asset: string
      allocationPercent: number
      apy: number
      riskScore: number
    }>
  ): Promise<VirtualPortfolioData> {
    const portfolio = await this.getOrCreate(accountAddress)
    const totalBalance = portfolio.currentBalanceUsd

    // Create new positions based on allocations
    const newPositions: VirtualPosition[] = newAllocations.map(alloc => {
      const amountUsd = (totalBalance * alloc.allocationPercent) / 100
      return {
        protocol: alloc.protocol,
        asset: alloc.asset,
        amount: amountUsd,
        valueUSD: amountUsd,
        currentAPY: alloc.apy,
        riskScore: alloc.riskScore,
        allocatedAt: new Date()
      }
    })

    // Update portfolio in database
    await prisma.virtualPortfolio.update({
      where: { accountAddress },
      data: {
        positions: JSON.stringify(newPositions),
        lastRebalancedAt: new Date(),
        lastCalculatedAt: new Date()
      }
    })

    // Log the rebalance action
    await prisma.virtualPortfolioHistory.create({
      data: {
        accountAddress,
        balanceUsd: totalBalance,
        profitUsd: portfolio.totalProfitUsd,
        positions: JSON.stringify(newPositions),
        action: 'rebalance',
        description: `AI agent rebalanced portfolio: ${newAllocations.length} positions`
      }
    })

    return {
      accountAddress,
      currentBalanceUsd: totalBalance,
      totalProfitUsd: portfolio.totalProfitUsd,
      positions: newPositions,
      lastCalculatedAt: new Date()
    }
  }

  /**
   * Get performance history
   */
  async getHistory(accountAddress: string, limit = 100) {
    return await prisma.virtualPortfolioHistory.findMany({
      where: { accountAddress },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * Add position to virtual portfolio
   */
  async addPosition(
    accountAddress: string,
    protocol: string,
    asset: string,
    amountUsd: number,
    apy: number,
    riskScore: number
  ): Promise<VirtualPortfolioData> {
    const portfolio = await this.getOrCreate(accountAddress)
    
    const newPosition: VirtualPosition = {
      protocol,
      asset,
      amount: amountUsd,
      valueUSD: amountUsd,
      currentAPY: apy,
      riskScore,
      allocatedAt: new Date()
    }

    portfolio.positions.push(newPosition)
    portfolio.currentBalanceUsd += amountUsd

    await prisma.virtualPortfolio.update({
      where: { accountAddress },
      data: {
        currentBalanceUsd: portfolio.currentBalanceUsd,
        positions: JSON.stringify(portfolio.positions),
        lastCalculatedAt: new Date()
      }
    })

    return portfolio
  }

  /**
   * Get portfolio in frontend-compatible format
   */
  async getFormatted(accountAddress: string) {
    const portfolio = await this.getOrCreate(accountAddress)

    // Calculate weighted average APY
    const totalValue = portfolio.currentBalanceUsd
    const netAPY = portfolio.positions.reduce((sum, pos) => {
      const weight = pos.valueUSD / totalValue
      return sum + (pos.currentAPY * weight)
    }, 0)

    return {
      totalValueUSD: portfolio.currentBalanceUsd,
      totalProfitUSD: portfolio.totalProfitUsd,
      netAPY: Number(netAPY.toFixed(2)),
      positions: portfolio.positions.map(pos => ({
        protocol: pos.protocol,
        asset: pos.asset,
        amount: pos.amount,
        valueUSD: pos.valueUSD,
        currentAPY: pos.currentAPY,
        riskScore: pos.riskScore
      }))
    }
  }
}

export const virtualPortfolioService = new VirtualPortfolioService()

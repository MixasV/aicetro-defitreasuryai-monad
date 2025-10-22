import { prisma } from '../../db/prisma'
import type {
  AssetRule,
  AssetManagementRules,
  CreateAssetRulesParams,
  UpdateAllocationParams,
  ValidateActionParams
} from '../../types/asset-rules.types'

class AssetRulesService {
  async getRules(accountAddress: string): Promise<AssetManagementRules | null> {
    try {
      const rules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress }
      })
      
      if (!rules) {
        return null
      }
      
      return {
        ...rules,
        assets: rules.assets as unknown as AssetRule[]
      }
    } catch (error) {
      console.debug('[AssetRules] Query failed (model may not exist yet):', error)
      return null
    }
  }

  async setRules(params: CreateAssetRulesParams): Promise<AssetManagementRules> {
    console.log('[AssetRules] Setting asset management rules...', { accountAddress: params.accountAddress })
    
    this.validateRules(params)
    
    const portfolioLimit = params.totalCapital * 0.003
    const aiCapitalLimit = params.aiManagedCapital * 0.01
    const maxFeesMonthly = Math.min(portfolioLimit, aiCapitalLimit)
    
    try {
      const rules = await prisma.assetManagementRules.upsert({
        where: { accountAddress: params.accountAddress },
        update: {
          aiManagedCapital: params.aiManagedCapital,
          totalCapital: params.totalCapital,
          assets: params.assets as any,
          maxFeesMonthly,
          updatedAt: new Date()
        },
        create: {
          accountAddress: params.accountAddress,
          aiManagedCapital: params.aiManagedCapital,
          totalCapital: params.totalCapital,
          assets: params.assets as any,
          maxFeesMonthly,
          autoReinvest: true
        }
      })
      
      console.log('[AssetRules] Rules saved:', { rulesId: rules.id, maxFeesMonthly })
      
      return {
        ...rules,
        assets: rules.assets as unknown as AssetRule[]
      }
    } catch (error) {
      console.error('[AssetRules] Failed to save rules:', error)
      throw new Error('Failed to save asset management rules')
    }
  }

  private validateRules(params: CreateAssetRulesParams): void {
    if (params.aiManagedCapital > params.totalCapital) {
      throw new Error(`AI managed capital ($${params.aiManagedCapital}) cannot exceed total capital ($${params.totalCapital})`)
    }
    
    const totalAllocationPercent = params.assets.reduce((sum, a) => sum + a.maxAllocationPercent, 0)
    if (totalAllocationPercent > 100) {
      throw new Error(`Total allocation (${totalAllocationPercent}%) cannot exceed 100%`)
    }
    
    params.assets.forEach((asset, index) => {
      if (!asset.symbol) {
        throw new Error(`Asset #${index}: symbol is required`)
      }
      
      if (asset.maxAllocationPercent < 0 || asset.maxAllocationPercent > 100) {
        throw new Error(`Asset ${asset.symbol}: maxAllocationPercent must be 0-100`)
      }
      
      if (asset.allowedChains.length === 0) {
        throw new Error(`Asset ${asset.symbol}: must have at least one allowed chain`)
      }
      
      if (asset.canSwap && (!asset.swapPairs || asset.swapPairs.length === 0)) {
        throw new Error(`Asset ${asset.symbol}: if canSwap is true, swapPairs must be defined`)
      }
    })
  }

  async validateAction(params: ValidateActionParams): Promise<{ allowed: boolean; reason?: string }> {
    const rules = await this.getRules(params.accountAddress)
    
    if (!rules) {
      return { allowed: false, reason: 'No asset rules configured' }
    }
    
    const assetRule = rules.assets.find(a => a.symbol === params.asset)
    
    if (!assetRule) {
      return { allowed: false, reason: `Asset ${params.asset} not in allowed list` }
    }
    
    if (params.action === 'deposit') {
      const maxAllocationUSD = (rules.aiManagedCapital * assetRule.maxAllocationPercent) / 100
      const newAllocation = assetRule.currentAllocation + params.amountUSD
      
      if (newAllocation > maxAllocationUSD) {
        return {
          allowed: false,
          reason: `Would exceed ${params.asset} allocation limit: ${newAllocation.toFixed(0)} > ${maxAllocationUSD.toFixed(0)}`
        }
      }
    }
    
    if (params.action === 'swap') {
      if (!assetRule.canSwap) {
        return { allowed: false, reason: `Swapping ${params.asset} not allowed` }
      }
      
      if (params.toAsset && assetRule.swapPairs && !assetRule.swapPairs.includes(params.toAsset)) {
        return {
          allowed: false,
          reason: `Swapping ${params.asset} to ${params.toAsset} not allowed. Allowed pairs: ${assetRule.swapPairs.join(', ')}`
        }
      }
    }
    
    return { allowed: true }
  }

  async updateAllocation(params: UpdateAllocationParams): Promise<void> {
    const rules = await this.getRules(params.accountAddress)
    
    if (!rules) {
      throw new Error('No asset rules found')
    }
    
    const updatedAssets = rules.assets.map(a => {
      if (a.symbol === params.asset) {
        return {
          ...a,
          currentAllocation: Math.max(0, a.currentAllocation + params.deltaUSD)
        }
      }
      return a
    })
    
    try {
      await prisma.assetManagementRules.update({
        where: { accountAddress: params.accountAddress },
        data: {
          assets: updatedAssets as any,
          updatedAt: new Date()
        }
      })
      
      console.log('[AssetRules] Allocation updated:', { asset: params.asset, delta: params.deltaUSD })
    } catch (error) {
      console.error('[AssetRules] Failed to update allocation:', error)
      throw new Error('Failed to update allocation')
    }
  }

  async getDefaultRules(accountAddress: string, totalCapital: number): Promise<CreateAssetRulesParams> {
    const aiManagedCapital = totalCapital * 0.2
    
    return {
      accountAddress,
      aiManagedCapital,
      totalCapital,
      assets: [
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'USDC',
          maxAllocationPercent: 60,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: true,
          swapPairs: ['USDT', 'DAI'],
          canBridge: false
        },
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'USDT',
          maxAllocationPercent: 30,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: true,
          swapPairs: ['USDC'],
          canBridge: false
        },
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'DAI',
          maxAllocationPercent: 10,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: true,
          swapPairs: ['USDC', 'USDT'],
          canBridge: false
        }
      ]
    }
  }
}

export const assetRulesService = new AssetRulesService()

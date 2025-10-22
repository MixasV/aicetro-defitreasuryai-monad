/**
 * MetaMask Delegation Toolkit Environment for Monad Testnet
 * 
 * Creates proper DeleGatorEnvironment for Monad Testnet (Chain ID 10143)
 * to enable correct delegation creation with authority = 0x0000... (root)
 * 
 * CRITICAL: MetaMask SDK doesn't know about Monad Testnet by default!
 * Without custom environment, delegations get authority = 0xffff... → redemption fails!
 * 
 * SOLUTION: Always pass this environment to:
 * - createDelegation({ environment })
 * - toMetaMaskSmartAccount({ environment })
 */

import type { Hex } from 'viem'

const MONAD_TESTNET_CHAIN_ID = 10143
const METAMASK_VERSION = '1.3.0' as const

interface DeleGatorEnvironment {
  DelegationManager: Hex
  EntryPoint: Hex
  SimpleFactory: Hex
  implementations: {
    [implementation: string]: Hex
  }
  caveatEnforcers: {
    [enforcer: string]: Hex
  }
}

class MetaMaskEnvironmentService {
  private environment: DeleGatorEnvironment | null = null

  /**
   * Get Monad Testnet environment
   * 
   * Returns DeleGatorEnvironment with proper contract addresses for Monad Testnet.
   * MUST be passed to createDelegation() and toMetaMaskSmartAccount()!
   */
  getMonadTestnetEnvironment(): DeleGatorEnvironment {
    if (this.environment) {
      return this.environment
    }

    console.log('[MetaMask Environment] Creating Monad Testnet environment...')

    // Get contract addresses from ENV
    const delegationManager = process.env.METAMASK_DELEGATION_MANAGER as Hex || 
      '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a' as Hex
    
    const entryPoint = process.env.METAMASK_ENTRY_POINT as Hex ||
      '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Hex
    
    // SimpleFactory - placeholder if not deployed
    const simpleFactory = process.env.METAMASK_SIMPLE_FACTORY as Hex ||
      '0x0000000000000000000000000000000000000001' as Hex
    
    this.environment = {
      DelegationManager: delegationManager as Hex,
      EntryPoint: entryPoint as Hex,
      SimpleFactory: simpleFactory,
      
      implementations: {
        Hybrid: (process.env.METAMASK_HYBRID_DELEGATOR as Hex) || 
                '0x0fb901F876C65d4cc2491Cd2a0be8117E159dFee' as Hex,
        MultiSig: (process.env.METAMASK_MULTISIG_DELEGATOR as Hex) ||
                  '0xf698BA413575B77a056ec6bbEb61d2e54F2e8050' as Hex,
        Stateless7702: (process.env.METAMASK_STATELESS_7702 as Hex) ||
                       '0x0000000000000000000000000000000000000002' as Hex
      },
      
      caveatEnforcers: {
        // AllowedTargetsEnforcer - MUST match MetaMask SDK naming!
        AllowedTargetsEnforcer: (process.env.METAMASK_ALLOWED_TARGETS_ENFORCER as Hex) ||
                                '0x7F20f61b1f09b08D970938F6fa563634d65c4EeB' as Hex,
        // AllowedMethodsEnforcer - MUST match MetaMask SDK naming!
        AllowedMethodsEnforcer: (process.env.METAMASK_ALLOWED_METHODS_ENFORCER as Hex) ||
                               '0x2c21fD0Cb9DC8445CB3fb0DC5E7Bb0Aca01842B5' as Hex,
        // ValueLimitEnforcer
        ValueLimitEnforcer: (process.env.METAMASK_VALUE_LIMIT_ENFORCER as Hex) ||
                           '0x0000000000000000000000000000000000000003' as Hex,
        // TimestampEnforcer
        TimestampEnforcer: (process.env.METAMASK_TIMESTAMP_ENFORCER as Hex) ||
                          '0x0000000000000000000000000000000000000004' as Hex
      }
    }

    console.log('[MetaMask Environment] ✅ Monad Testnet environment created:', {
      DelegationManager: this.environment.DelegationManager,
      EntryPoint: this.environment.EntryPoint,
      implementations: Object.keys(this.environment.implementations).length,
      caveatEnforcers: Object.keys(this.environment.caveatEnforcers).length
    })

    console.log('[MetaMask Environment] Pass this to createDelegation({ environment }) and toMetaMaskSmartAccount({ environment })')
    
    return this.environment
  }
}

export const metaMaskEnvironmentService = new MetaMaskEnvironmentService()

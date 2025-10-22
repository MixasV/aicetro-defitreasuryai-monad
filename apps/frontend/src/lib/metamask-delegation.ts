/**
 * MetaMask Delegation Toolkit Integration
 * 
 * Creates ERC-7710 compliant delegation structures for AI agent execution
 */

import { Address, encodePacked, keccak256, toHex } from 'viem';

// Backend caveat enforcer marker
// This tells backend to validate caveats (dailyLimit, protocols, risk)
export const BACKEND_CAVEAT_ENFORCER = '0xBACKEND00000000000000000000000000000000' as Address;

export interface DelegationCaveat {
  enforcer: Address;
  terms: string; // Encoded parameters
}

export interface MetaMaskDelegation {
  delegate: Address;
  delegator: Address;
  authority: string;
  caveats: DelegationCaveat[];
  salt: bigint;
  signature?: string;
}

export interface DelegationParams {
  userAddress: Address;
  aiAgentAddress: Address;
  dailyLimitUsd: number;
  protocolWhitelist: string[];
  maxRiskScore: number;
  validDays: number;
  selectedNetworks: any[];
  managedAssetsUSD: number;
}

/**
 * Encode caveat terms for backend validation
 * 
 * Format: [dailyLimitUsd (uint256), maxRiskScore (uint8), protocolCount (uint8), protocols...]
 */
export function encodeCaveatTerms(params: {
  dailyLimitUsd: number;
  protocolWhitelist: string[];
  maxRiskScore: number;
  validDays: number;
  selectedNetworks: any[];
  managedAssetsUSD: number;
}): string {
  // Encode as JSON string (backend will parse)
  const termsData = {
    dailyLimitUsd: params.dailyLimitUsd,
    maxRiskScore: params.maxRiskScore,
    protocolWhitelist: params.protocolWhitelist,
    validDays: params.validDays,
    selectedNetworks: params.selectedNetworks,
    managedAssetsUSD: params.managedAssetsUSD,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  // Convert to hex string
  const jsonStr = JSON.stringify(termsData);
  return toHex(jsonStr);
}

/**
 * Create MetaMask delegation structure
 */
export function createMetaMaskDelegation(params: DelegationParams): MetaMaskDelegation {
  const caveat: DelegationCaveat = {
    enforcer: BACKEND_CAVEAT_ENFORCER,
    terms: encodeCaveatTerms({
      dailyLimitUsd: params.dailyLimitUsd,
      protocolWhitelist: params.protocolWhitelist,
      maxRiskScore: params.maxRiskScore,
      validDays: params.validDays,
      selectedNetworks: params.selectedNetworks,
      managedAssetsUSD: params.managedAssetsUSD
    })
  };

  // ⚠️ CRITICAL: Root delegation MUST have authority = 0x0000...0000 (64 zeros)
  // This indicates first delegation in chain (no parent)
  // See: https://docs.metamask.io/delegation-toolkit/concepts/delegation/#delegation-types
  return {
    delegate: params.aiAgentAddress,
    delegator: params.userAddress,
    authority: '0x0000000000000000000000000000000000000000000000000000000000000000', // ✅ Root authority (64 zeros)
    caveats: [caveat],
    salt: BigInt(Date.now())
  };
}

/**
 * Get EIP-712 domain for delegation signing
 */
export function getDelegationDomain(chainId: number = 10143) {
  return {
    name: 'AIcetro Delegation',
    version: '1',
    chainId,
    verifyingContract: '0x0000000000000000000000000000000000000000' as Address // No verifying contract for simple mode
  };
}

/**
 * Get EIP-712 types for delegation
 */
export function getDelegationTypes() {
  return {
    Delegation: [
      { name: 'delegate', type: 'address' },
      { name: 'delegator', type: 'address' },
      { name: 'authority', type: 'bytes32' },
      { name: 'caveats', type: 'Caveat[]' },
      { name: 'salt', type: 'uint256' }
    ],
    Caveat: [
      { name: 'enforcer', type: 'address' },
      { name: 'terms', type: 'bytes' }
    ]
  };
}

/**
 * Sign delegation with MetaMask (EIP-712)
 */
export async function signDelegation(
  delegation: MetaMaskDelegation,
  chainId: number = 10143
): Promise<string> {
  const provider = (window as any).ethereum;
  
  if (!provider) {
    throw new Error('MetaMask not found');
  }

  // Request account access
  await provider.request({
    method: 'eth_requestAccounts'
  });

  const domain = getDelegationDomain(chainId);
  const types = getDelegationTypes();
  
  // Remove signature field for signing
  const { signature, ...delegationForSigning } = delegation;

  try {
    // Convert BigInt to string for JSON serialization (EIP-712 signature)
    const serializedMessage = {
      ...delegationForSigning,
      salt: delegationForSigning.salt.toString() // BigInt → string
    };

    // Use eth_signTypedData_v4 for EIP-712
    const signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        delegation.delegator,
        JSON.stringify({
          types,
          domain,
          primaryType: 'Delegation',
          message: serializedMessage
        })
      ]
    });

    return signature;
  } catch (error: any) {
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new Error('User rejected the signature request');
    }
    throw error;
  }
}

/**
 * Create and sign delegation in one step
 */
export async function createAndSignDelegation(
  params: DelegationParams,
  chainId: number = 10143
): Promise<MetaMaskDelegation> {
  const delegation = createMetaMaskDelegation(params);
  const signature = await signDelegation(delegation, chainId);
  
  return {
    ...delegation,
    signature
  };
}

/**
 * Serialize delegation for JSON (convert BigInt to string)
 */
export function serializeDelegation(delegation: MetaMaskDelegation): any {
  return {
    ...delegation,
    salt: delegation.salt.toString(), // Convert BigInt to string
    caveats: delegation.caveats.map(c => ({
      ...c,
      // terms is already hex string
    }))
  };
}

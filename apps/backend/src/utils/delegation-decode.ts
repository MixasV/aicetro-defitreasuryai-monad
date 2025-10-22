/**
 * Delegation Decoding Utilities
 * 
 * Decode MetaMask delegation caveat terms
 */

import { fromHex } from 'viem';

export interface DecodedCaveatTerms {
  dailyLimitUsd: number;
  maxRiskScore: number;
  protocolWhitelist: string[];
  validDays: number;
  selectedNetworks: any[];
  managedAssetsUSD: number;
  timestamp: number;
  version: string;
}

/**
 * Decode caveat terms from hex string
 * 
 * Terms are encoded as JSON object in hex
 */
export function decodeCaveatTerms(termsHex: string): DecodedCaveatTerms {
  try {
    // Remove 0x prefix if present
    const hex = termsHex.startsWith('0x') ? termsHex.slice(2) : termsHex;
    
    // Convert hex to string
    const jsonStr = fromHex(`0x${hex}`, 'string');
    
    // Parse JSON
    const terms = JSON.parse(jsonStr);
    
    return {
      dailyLimitUsd: terms.dailyLimitUsd || 1000,
      maxRiskScore: terms.maxRiskScore || 3,
      protocolWhitelist: terms.protocolWhitelist || [],
      validDays: terms.validDays || 30,
      selectedNetworks: terms.selectedNetworks || [],
      managedAssetsUSD: terms.managedAssetsUSD || 0,
      timestamp: terms.timestamp || Date.now(),
      version: terms.version || '1.0'
    };
  } catch (error) {
    console.error('[Delegation Decode] Failed to decode caveat terms:', error);
    // Return defaults on error
    return {
      dailyLimitUsd: 1000,
      maxRiskScore: 3,
      protocolWhitelist: [],
      validDays: 30,
      selectedNetworks: [],
      managedAssetsUSD: 0,
      timestamp: Date.now(),
      version: '1.0'
    };
  }
}

/**
 * Check if delegation is MetaMask ERC-7710 format
 */
export function isMetaMaskDelegation(signedDelegation: any): boolean {
  return !!(
    signedDelegation &&
    signedDelegation.delegate &&
    signedDelegation.delegator &&
    signedDelegation.caveats &&
    Array.isArray(signedDelegation.caveats)
  );
}

/**
 * Extract caveat terms from MetaMask delegation
 */
export function extractCaveatTerms(signedDelegation: any): DecodedCaveatTerms | null {
  if (!isMetaMaskDelegation(signedDelegation)) {
    return null;
  }

  // Find backend caveat enforcer
  const backendCaveat = signedDelegation.caveats.find(
    (c: any) => c.enforcer?.toLowerCase() === '0xbackend00000000000000000000000000000000'
  );

  if (!backendCaveat || !backendCaveat.terms) {
    console.warn('[Delegation Decode] No backend caveat found in delegation');
    return null;
  }

  return decodeCaveatTerms(backendCaveat.terms);
}

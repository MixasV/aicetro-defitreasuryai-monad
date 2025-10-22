/**
 * Universal hook to get effective user address for delegation queries
 * 
 * Priority:
 * 1. Smart Account from localStorage (after delegation setup)
 * 2. EOA from MetaMask (wallet connected)
 * 3. Demo account (fallback)
 */

import { useAccount } from 'wagmi';
import { useCorporateAccountContext } from '@/providers/CorporateAccountProvider';

const DEMO_CORPORATE_ACCOUNT = '0xcccccccccccccccccccccccccccccccccccccccc';

export function useEffectiveAddress() {
  const { address: eoaAddress } = useAccount(); // EOA from MetaMask
  const { account } = useCorporateAccountContext(); // Smart Account from localStorage
  
  // Smart Account (primary) → EOA (fallback) → Demo (last resort)
  const effectiveAddress = account.address || eoaAddress || DEMO_CORPORATE_ACCOUNT;
  
  return {
    effectiveAddress, // For delegation queries (Smart Account or EOA or Demo)
    smartAccountAddress: account.address, // Smart Account only (undefined if not created)
    eoaAddress, // EOA only (undefined if wallet not connected)
    isDemo: !account.address && !eoaAddress,
    isSmartAccount: !!account.address,
    isEOAOnly: !!eoaAddress && !account.address
  };
}

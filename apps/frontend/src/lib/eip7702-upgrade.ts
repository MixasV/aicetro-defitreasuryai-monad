/**
 * EIP-7702 EOA Upgrade Utilities
 * 
 * Automatically upgrades user's EOA to support MetaMask Smart Account delegation
 * WITHOUT creating a new address - funds stay on EOA!
 */

import { type Address, type Hex, encodeFunctionData } from 'viem';

/**
 * Check if EOA is already upgraded via EIP-7702
 */
export async function isEOAUpgraded(address: Address): Promise<boolean> {
  try {
    const response = await fetch(`/api/eip7702/status/${address}`);
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.isUpgraded === true;
  } catch (error) {
    console.error('[EIP-7702] Failed to check upgrade status:', error);
    return false;
  }
}

/**
 * Get EIP-7702 contract addresses from backend
 */
export async function getEIP7702Contracts(): Promise<{
  hybridDelegator: Address;
  delegationManager: Address;
  entryPoint: Address;
}> {
  const response = await fetch('/api/eip7702/contracts');
  if (!response.ok) {
    throw new Error('Failed to get EIP-7702 contracts');
  }
  
  const data = await response.json();
  return data.contracts;
}

/**
 * Upgrade EOA to EIP-7702 Smart Account
 * 
 * User signs authorization + sends transaction type 0x04
 * After this, EOA can use MetaMask Delegation features WITHOUT moving funds!
 * 
 * @param walletClient - Viem wallet client (from wagmi)
 * @param eoaAddress - User's EOA address
 * @returns Transaction hash
 */
export async function upgradeEOAto7702(
  walletClient: any,
  eoaAddress: Address
): Promise<Hex> {
  console.log('[EIP-7702] Starting EOA upgrade for:', eoaAddress);
  
  // 1. Get contracts
  const contracts = await getEIP7702Contracts();
  console.log('[EIP-7702] Target contract:', contracts.hybridDelegator);
  
  // 2. Prepare EIP-7702 authorization
  // Format: sign authorization to delegate code to HybridDelegator
  const authorization = {
    chainId: 10143, // Monad Testnet
    address: contracts.hybridDelegator, // Contract to delegate to
    nonce: 0n, // First authorization
  };
  
  console.log('[EIP-7702] Authorization:', authorization);
  
  // 3. Sign authorization with user's wallet
  // This is a SIGNATURE, not a transaction yet
  console.log('[EIP-7702] Requesting user signature for authorization...');
  
  // Use signTypedData for EIP-7702 authorization
  const signature = await walletClient.signTypedData({
    account: eoaAddress,
    domain: {
      name: 'EIP-7702 Authorization',
      version: '1',
      chainId: 10143,
    },
    types: {
      Authorization: [
        { name: 'chainId', type: 'uint256' },
        { name: 'address', type: 'address' },
        { name: 'nonce', type: 'uint256' },
      ],
    },
    primaryType: 'Authorization',
    message: authorization,
  });
  
  console.log('[EIP-7702] Authorization signed:', signature);
  
  // 4. Send EIP-7702 transaction (type 0x04)
  // This sets code at EOA address to: 0xef0100 + hybridDelegator
  console.log('[EIP-7702] Sending transaction type 0x04...');
  
  try {
    // Use eth_sendTransaction with type 0x04 and authorizationList
    const txHash = await (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: eoaAddress,
        to: contracts.hybridDelegator, // Target contract
        value: '0x0', // No value transfer
        data: '0x', // No calldata
        type: '0x04', // EIP-7702 transaction type
        authorizationList: [{
          chainId: '0x279f', // 10143 in hex
          address: contracts.hybridDelegator,
          nonce: '0x0',
          v: signature.slice(0, 2) === '0x' ? signature.slice(2, 4) : signature.slice(0, 2),
          r: signature.slice(0, 66),
          s: '0x' + signature.slice(66, 130),
        }],
      }],
    });
    
    console.log('[EIP-7702] Upgrade transaction sent:', txHash);
    
    // Wait for confirmation
    console.log('[EIP-7702] Waiting for confirmation...');
    await waitForTransaction(txHash);
    
    console.log('[EIP-7702] ✅ EOA upgraded successfully!');
    return txHash as Hex;
  } catch (error: any) {
    // If transaction fails but EOA is already upgraded, that's OK
    if (error.message?.includes('already has code') || error.message?.includes('0xef0100')) {
      console.log('[EIP-7702] EOA already upgraded (code already set)');
      return '0x0' as Hex; // Return dummy hash
    }
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
async function waitForTransaction(txHash: Hex, maxWait = 30000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const receipt = await (window as any).ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      
      if (receipt && receipt.status) {
        console.log('[EIP-7702] Transaction confirmed:', receipt);
        return;
      }
    } catch (error) {
      // Ignore errors, keep polling
    }
    
    // Wait 2 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

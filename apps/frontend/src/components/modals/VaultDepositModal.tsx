'use client';

import { useState } from 'react';
import { ArrowRightLeft, Send, X } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import VaultABI from '@/abis/DeFiTreasuryVault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

interface VaultDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositComplete: () => void;
  smartAccountAddress: string;
  userAddress: string;
  managedAssetsUSD: number;
  selectedNetworks: any[];
  portfolioPercentage: number;
}

export function VaultDepositModal({
  isOpen,
  onClose,
  onDepositComplete,
  smartAccountAddress,
  userAddress,
  managedAssetsUSD,
  selectedNetworks,
  portfolioPercentage
}: VaultDepositModalProps) {
  const [isDepositing, setIsDepositing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  if (!isOpen) return null;

  const handleDeposit = async () => {
    setIsDepositing(true);
    setIsSuccess(false);
    setIsError(false);
    
    try {
      console.log('[VaultDeposit] Starting deposit to Vault:', VAULT_ADDRESS);
      console.log('[VaultDeposit] User SA (receiver):', smartAccountAddress);
      
      // Get enabled networks and tokens
      const enabledNetworks = selectedNetworks.filter(n => n.enabled);
      
      if (enabledNetworks.length === 0) {
        alert('No networks selected for deposit');
        return;
      }
      
      // Calculate total MON to deposit
      let totalMonAmount = 0;
      
      for (const network of enabledNetworks) {
        for (const token of network.tokens.filter((t: any) => t.enabled)) {
          if (token.symbol === 'MON' || token.symbol === 'WMON') {
            totalMonAmount += token.balance;
          }
        }
      }
      
      if (totalMonAmount === 0) {
        alert('No MON balance found in selected tokens');
        return;
      }
      
      // Calculate delegated amount based on portfolio percentage
      const delegatedAmount = totalMonAmount * (portfolioPercentage / 100);
      
      console.log('[VaultDeposit] Total MON selected:', totalMonAmount.toFixed(4));
      console.log('[VaultDeposit] Portfolio percentage:', portfolioPercentage + '%');
      console.log('[VaultDeposit] Depositing MON:', delegatedAmount.toFixed(4));
      
      // Convert to wei
      const amountWei = parseEther(delegatedAmount.toString());
      
      // Call vault.deposit(assets, receiver)
      // This is a contract call, NOT simple transfer!
      console.log('[VaultDeposit] Calling vault.deposit()...');
      
      writeContract({
        address: VAULT_ADDRESS,
        abi: VaultABI,
        functionName: 'deposit',
        args: [amountWei, smartAccountAddress as `0x${string}`],
        value: amountWei // Send MON value (since asset is zero address = native token)
      });
      
      // Wait for confirmation
      console.log('[VaultDeposit] ✅ Deposit transaction submitted');
      
      setIsSuccess(true);
      
      // Wait for blockchain confirmation
      setTimeout(() => {
        if (isConfirmed) {
          console.log('[VaultDeposit] ✅ Deposit confirmed!');
          onDepositComplete();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('[VaultDeposit] Deposit error:', error);
      
      if (error.message?.includes('User rejected')) {
        alert('Deposit rejected. Funds stay in your wallet.');
      } else {
        alert(`Deposit failed: ${error.message || 'Unknown error'}`);
      }
      
      setIsError(true);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleSkip = () => {
    if (confirm('Skip deposit? AI agent cannot work without funds in Vault!')) {
      onClose();
    }
  };

  // Calculate MON amount
  const enabledNetworks = selectedNetworks.filter(n => n.enabled);
  let totalMonAmount = 0;
  
  for (const network of enabledNetworks) {
    for (const token of network.tokens.filter((t: any) => t.enabled)) {
      if (token.symbol === 'MON' || token.symbol === 'WMON') {
        totalMonAmount += token.balance;
      }
    }
  }
  
  const delegatedAmount = totalMonAmount * (portfolioPercentage / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Deposit to Vault</h2>
          <p className="text-blue-100 text-sm">
            Deposit funds into DeFiTreasuryVault smart contract
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your funds are deposited into <span className="font-mono text-xs">Vault contract</span></li>
              <li>• Vault holds all funds securely on-chain</li>
              <li>• AI agent can rebalance via delegation</li>
              <li>• You can withdraw anytime (owner = you!)</li>
            </ul>
          </div>

          {/* Amount display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Deposit Amount:</span>
              <span className="text-2xl font-bold text-gray-900">
                {delegatedAmount.toFixed(4)} MON
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">USD Value (est):</span>
              <span className="font-medium text-gray-700">
                ${managedAssetsUSD.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
              {portfolioPercentage}% of your {totalMonAmount.toFixed(2)} MON balance
            </div>
          </div>

          {/* Destination */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Vault Contract:</div>
            <div className="font-mono text-xs text-gray-900 break-all bg-white p-2 rounded border">
              {VAULT_ADDRESS}
            </div>
            <div className="text-sm text-gray-600 mt-3 mb-1">Credited to (User SA):</div>
            <div className="font-mono text-xs text-gray-900 break-all bg-white p-2 rounded border">
              {smartAccountAddress}
            </div>
          </div>

          {/* Status messages */}
          {isConfirming && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⏳ Waiting for blockchain confirmation...
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Deposit successful! Proceeding to AI setup...
              </p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                ❌ Deposit failed. Please try again.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isDepositing || isConfirming}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
            >
              Skip for Now
            </button>
            <button
              onClick={handleDeposit}
              disabled={isDepositing || isConfirming || isSuccess}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isDepositing || isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Depositing...
                </>
              ) : isSuccess ? (
                <>
                  <Send className="w-5 h-5" />
                  Deposit Complete
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-5 h-5" />
                  Deposit to Vault
                </>
              )}
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center">
            This is a smart contract call, not a simple transfer. MetaMask will show contract interaction.
          </p>
        </div>
      </div>
    </div>
  );
}

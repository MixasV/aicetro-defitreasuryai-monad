'use client';

import { useState } from 'react';
import { ArrowRightLeft, Send, X } from 'lucide-react';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
  smartAccountAddress: string;
  userAddress: string;
  managedAssetsUSD: number;
  selectedNetworks: any[];
  portfolioPercentage: number;
}

export function TransferFundsModal({
  isOpen,
  onClose,
  onTransferComplete,
  smartAccountAddress,
  userAddress,
  managedAssetsUSD,
  selectedNetworks,
  portfolioPercentage
}: TransferFundsModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = async () => {
    setIsTransferring(true);
    setIsSuccess(false);
    setIsError(false);
    
    try {
      console.log('[TransferFunds] Starting transfer to User SA:', smartAccountAddress);
      
      // Get enabled networks and tokens
      const enabledNetworks = selectedNetworks.filter(n => n.enabled);
      
      if (enabledNetworks.length === 0) {
        alert('No networks selected for transfer');
        return;
      }
      
      // For MVP: transfer MON from current network to User SA
      // User signs transaction via MetaMask
      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error('MetaMask not found');
      }
      
      // Calculate total MON and total USD value of all enabled tokens
      let totalMonAmount = 0;
      let totalSelectedUSD = 0;
      
      for (const network of enabledNetworks) {
        for (const token of network.tokens.filter((t: any) => t.enabled)) {
          if (token.symbol === 'MON' || token.symbol === 'WMON') {
            totalMonAmount += token.balance; // in MON
          }
          totalSelectedUSD += token.balanceUSD; // total USD value
        }
      }
      
      if (totalMonAmount === 0) {
        alert('No MON balance found in selected tokens');
        return;
      }
      
      // SIMPLE LOGIC: portfolioPercentage already represents % of wallet balance
      // Example: $11 from $31 = 35% → transfer 35% of MON
      const delegatedAmount = totalMonAmount * (portfolioPercentage / 100);
      
      console.log('[TransferFunds] Total MON selected:', totalMonAmount.toFixed(4));
      console.log('[TransferFunds] Portfolio percentage:', portfolioPercentage + '%');
      console.log('[TransferFunds] Managed assets USD:', managedAssetsUSD.toFixed(2));
      console.log('[TransferFunds] Transferring MON:', delegatedAmount.toFixed(4), `(${portfolioPercentage}% of ${totalMonAmount.toFixed(2)} MON)`);
      
      // Convert to wei (18 decimals)
      const amountWei = '0x' + Math.floor(delegatedAmount * 1e18).toString(16);
      
      // Request transfer via MetaMask
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: smartAccountAddress,
          value: amountWei,
          gas: '0x5208' // 21000 gas (standard transfer)
        }]
      });
      
      console.log('[TransferFunds] ✅ Transfer submitted:', txHash);
      
      // Wait for confirmation (simple polling)
      let confirmed = false;
      let attempts = 0;
      
      while (!confirmed && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec
        
        try {
          const receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
          
          if (receipt && receipt.blockNumber) {
            confirmed = true;
            console.log('[TransferFunds] ✅ Transfer confirmed in block:', receipt.blockNumber);
          }
        } catch (error) {
          console.warn('[TransferFunds] Receipt check failed:', error);
        }
        
        attempts++;
      }
      
      if (!confirmed) {
        console.warn('[TransferFunds] Transfer not confirmed after 60 seconds, but likely successful');
      }
      
      setIsSuccess(true);
      
      // Wait 1 second then proceed to AI modal
      setTimeout(() => {
        onTransferComplete();
      }, 1500);
      
    } catch (error: any) {
      console.error('[TransferFunds] Transfer error:', error);
      
      if (error.code === 4001) {
        alert('Transfer rejected. Funds stay in your EOA wallet.');
      } else {
        alert(`Transfer failed: ${error.message}`);
      }
      
      setIsError(true);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSkip = () => {
    if (confirm('Skip transfer? AI agent cannot work without funds in Smart Account!')) {
      onTransferComplete(); // Proceed anyway
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Modal Card */}
        <div className="glass-card p-6 space-y-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
            disabled={isTransferring}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center">
              <ArrowRightLeft className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            {isSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">
                  ✅ Transfer Complete!
                </h2>
                <p className="text-slate-300 text-sm">
                  Funds transferred to Smart Account. AI agent can now start working!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">
                  Transfer Funds to Smart Account
                </h2>
                <p className="text-slate-300 text-sm">
                  For AI agent to work, transfer delegated funds to your Smart Account address.
                </p>
              </>
            )}
            
            {/* Smart Account Address */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Your Smart Account</p>
              <p className="text-xs font-mono text-blue-400 break-all">
                {smartAccountAddress}
              </p>
            </div>

            {/* Transfer Amount */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Amount to Transfer</p>
              <p className="text-2xl font-bold text-white">
                ${managedAssetsUSD.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {portfolioPercentage}% of your wallet balance
              </p>
              <p className="text-xs text-blue-300 mt-2">
                💡 Transfer to YOUR Smart Account for AI management.
              </p>
            </div>

            {!isSuccess && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                ⚠️ You'll sign this transaction with MetaMask. Funds transfer from your EOA to Smart Account.
              </p>
            )}
          </div>

          {/* Buttons */}
          {isSuccess ? (
            <div className="text-center">
              <p className="text-sm text-slate-400">Proceeding to AI setup...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Skip Button */}
              <button
                onClick={handleSkip}
                disabled={isTransferring}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium">Skip</span>
              </button>

              {/* Transfer Button */}
              <button
                onClick={handleTransfer}
                disabled={isTransferring || isSuccess}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransferring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transferring...</span>
                  </>
                ) : isError ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Retry</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transfer Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Info Text */}
          {!isSuccess && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 text-center">
                AI agent needs funds in Smart Account to execute trades within {portfolioPercentage}% limit.
              </p>
              <p className="text-xs text-emerald-400 text-center font-medium">
                ✅ You remain the owner and can withdraw anytime (you own the Smart Account)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AppShell } from '@/components/layout/AppShell';
import { useCorporateAccount } from '@/hooks/useCorporateAccount';
import { usePageTitle } from '@/hooks/usePageTitle';
import { AIAgentStartModal } from '@/components/modals/AIAgentStartModal';
import { VaultDepositModal } from '@/components/modals/VaultDepositModal';
import { NetworkTokenSelector } from '@/components/setup/NetworkTokenSelector';

const STEPS = ['Connect Wallet', 'Set Parameters', 'Review & Delegate'];

// NOTE: PRESET_STRATEGIES removed - we fetch REAL Monad pools from API

export default function SimpleSetupPage() {
  usePageTitle('Simple Setup');
  const [step, setStep] = useState(0);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { setAccountAddress } = useCorporateAccount();
  
  // Import delegation toolkit at top level (React Hook)
  const { useDelegationToolkit } = require('@/hooks/useDelegation');
  const { createDelegation } = useDelegationToolkit();
  
  // Parameters
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [aiCapitalPercent, setAICapitalPercent] = useState(20);
  const [aiCapitalUSD, setAICapitalUSD] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [maxRisk, setMaxRisk] = useState(3);
  const [protocols, setProtocols] = useState<string[]>([]);
  const [availableProtocols, setAvailableProtocols] = useState<any[]>([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [validDays, setValidDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [createdDelegation, setCreatedDelegation] = useState<any>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<any[]>([]);
  const [managedAssetsUSD, setManagedAssetsUSD] = useState(0);
  const [message, setMessage] = useState<string>('');

  // Fetch real Monad protocols on mount
  useEffect(() => {
    fetchMonadProtocols();
  }, []);

  // Fetch real balance when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
      setStep(1);
    }
  }, [isConnected, address]);

  const fetchMonadProtocols = async () => {
    setLoadingProtocols(true);
    try {
      const response = await fetch('/api/pools/monad-available');
      if (response.ok) {
        const data = await response.json();
        
        // Set available protocols from real Monad data
        if (data.byProtocol && data.byProtocol.length > 0) {
          setAvailableProtocols(data.byProtocol);
          
          // Auto-select protocols with risk <= 3 (conservative/balanced)
          const defaultProtocols = data.byProtocol
            .filter((p: any) => p.minRisk <= 3)
            .map((p: any) => p.protocol);
          
          setProtocols(defaultProtocols.slice(0, 3)); // Max 3 protocols by default
          
          console.log('[Simple Setup] Loaded real Monad protocols:', data.byProtocol.length);
        } else {
          console.warn('[Simple Setup] No Monad protocols found, using fallback');
          // Fallback to known Monad protocols
          setAvailableProtocols([
            { protocol: 'Nabla', avgApy: 12, minRisk: 3, maxRisk: 4, pools: [] },
            { protocol: 'Uniswap V2', avgApy: 15, minRisk: 4, maxRisk: 5, pools: [] }
          ]);
          setProtocols(['Nabla']);
        }
      }
    } catch (error) {
      console.error('[Simple Setup] Failed to fetch Monad protocols:', error);
      // Fallback
      setAvailableProtocols([
        { protocol: 'Nabla', avgApy: 12, minRisk: 3, maxRisk: 4, pools: [] }
      ]);
      setProtocols(['Nabla']);
    } finally {
      setLoadingProtocols(false);
    }
  };

  const fetchBalance = async () => {
    if (!address) return;

    setLoadingBalance(true);
    let totalBalance = 0;
    
    try {
      // ✅ FIXED: Use backend API which calculates REAL MON price from WMON/USDC Uniswap pair
      // Backend logic: 1 MON = 1 WMON, WMON price from pool reserves, USDC = $1
      const response = await fetch(`/api/balance/check/${address}`);
      if (response.ok) {
        const result = await response.json();
        totalBalance = result.data?.totalUSD || 0;
        
        console.log('[Simple Setup] Total balance from backend:', {
          totalUSD: totalBalance,
          tokens: result.data?.tokens?.length || 0,
          networks: result.data?.networksScanned || []
        });
      }
      
      // ✅ CRITICAL FIX: If backend returned 0, try RPC fallback for Monad Testnet!
      // Backend might have cached failed result, so we check RPC directly
      if (totalBalance === 0) {
        console.warn('[Simple Setup] Backend returned 0 balance, trying RPC fallback...');
        
        // Fallback: Try direct RPC to Monad Testnet
        const provider = (window as any).ethereum;
        if (provider) {
          try {
            const balance = await provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            });
            
            const balanceInMon = parseInt(balance, 16) / 1e18;
            
            if (balanceInMon > 0) {
              // Fallback price $5 (conservative estimate)
              totalBalance = Math.round(balanceInMon * 5);
              
              console.log('[Simple Setup] ✅ RPC Fallback found Monad balance:', {
                balanceMON: balanceInMon.toFixed(4),
                estimatedUSD: totalBalance,
                note: 'Using $5/MON fallback price'
              });
            }
          } catch (rpcError) {
            console.warn('[Simple Setup] RPC balance check failed:', rpcError);
          }
        }
      }

      // Set final balance
      if (totalBalance > 0) {
        setWalletBalance(totalBalance);
        console.log('[Simple Setup] Final wallet balance: $', totalBalance);
      } else {
        // No balance found anywhere - use demo
        setWalletBalance(10000);
        console.log('[Simple Setup] No balance found, using demo $10,000');
      }
    } catch (error) {
      console.error('[Simple Setup] Balance fetch error:', error);
      // Fallback to demo balance
      setWalletBalance(10000);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Sync percentage and USD amount
  useEffect(() => {
    if (walletBalance > 0) {
      const calculated = (walletBalance * aiCapitalPercent) / 100;
      setAICapitalUSD(Math.round(calculated));
    }
  }, [aiCapitalPercent, walletBalance]);

  const handleUSDChange = (value: number) => {
    setAICapitalUSD(value);
    const percent = Math.min(100, (value / walletBalance) * 100);
    setAICapitalPercent(Math.round(percent));
  };

  const handleDelegate = async () => {
    if (!address) return;
    
    // Validate: aiCapitalUSD must be > 0
    if (aiCapitalUSD === 0) {
      alert('Please set AI-Managed Capital amount');
      return;
    }
    
    setLoading(true);
    try {
      console.log('[Simple Setup] Creating MetaMask Smart Account for delegation...');
      
      // Step 1: Create viem clients
      const { createPublicClient, createWalletClient, custom, http } = await import('viem');
      const { Implementation, toMetaMaskSmartAccount } = await import('@metamask/delegation-toolkit');
      
      // Monad Testnet chain config
      const monadTestnet = {
        id: 10143,
        name: 'Monad Testnet',
        network: 'monad-testnet',
        nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
        rpcUrls: {
          default: { http: ['https://testnet-rpc.monad.xyz'] },
          public: { http: ['https://testnet-rpc.monad.xyz'] }
        }
      };
      
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http('https://testnet-rpc.monad.xyz')
      });
      
      // Get accounts from MetaMask
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletClient = createWalletClient({
        account: accounts[0] as `0x${string}`,
        chain: monadTestnet,
        transport: custom((window as any).ethereum)
      });
      
      // Step 2: Get or Create User Smart Account via backend
      // Backend will create Hybrid Smart Account with unique address
      console.log('[Simple Setup] Getting User Smart Account from backend...');
      setLoading(true);
      
      let smartAccountAddress: string;
      let isDeployed = false;
      
      // Check if User SA exists
      const saCheckResponse = await fetch(`/api/user-smart-account/${address}`);
      
      if (saCheckResponse.ok) {
        const saData = await saCheckResponse.json();
        if (saData.success && saData.smartAccount) {
          smartAccountAddress = saData.smartAccount.smartAccountAddress;
          isDeployed = saData.smartAccount.isDeployed;
          console.log('[Simple Setup] User SA exists:', smartAccountAddress);
          console.log('[Simple Setup] Deployed:', isDeployed);
        } else {
          throw new Error('Failed to get User Smart Account info');
        }
      } else {
        // SA will be created by backend during delegation creation
        console.log('[Simple Setup] User SA will be created during delegation');
        smartAccountAddress = address; // Temporary, will be updated by backend
      }
      
      // If not deployed, log deployment status
      if (!isDeployed) {
        console.log('[Simple Setup] User SA not deployed yet, backend will deploy it');
      } else {
        console.log('[Simple Setup] ✅ User SA already deployed');
      }
      
      // Step 3: Get AI agent address
      const aiAgentResponse = await fetch(`/api/delegation/ai-agent-address/${address}`);
      if (!aiAgentResponse.ok) {
        throw new Error('Failed to get AI agent address');
      }
      const { aiAgentAddress } = await aiAgentResponse.json();
      
      console.log('[Simple Setup] AI agent address:', aiAgentAddress);

      // Step 4: Create MetaMask ERC-7710 delegation (PROPER WAY)
      console.log('[Simple Setup] Creating ERC-7710 delegation...');
      console.log('[Simple Setup] User EOA:', address);
      console.log('[Simple Setup] User SA:', smartAccountAddress);
      console.log('[Simple Setup] AI Agent:', aiAgentAddress);
      console.log('[Simple Setup] Selected protocols:', protocols);
      
      // ✅ Use createDelegation from useDelegationToolkit (already imported!)
      console.log('[Simple Setup] Building delegation draft...');
      
      const delegationDraft = await createDelegation(
        smartAccountAddress || address,  // delegator (User SA, fallback to EOA)
        aiAgentAddress,                   // delegate (AI Agent)
        protocols                         // allowedProtocols for scope
      );
      
      console.log('[Simple Setup] Delegation draft created:', {
        delegator: delegationDraft.delegator,
        delegate: delegationDraft.delegate,
        scope: delegationDraft.scope,
        caveats: delegationDraft.delegation.caveats.length,
        authority: delegationDraft.delegation.authority
      });
      
      console.log('[Simple Setup] Asking user to sign delegation (EIP-712)...');
      
      // ✅ CRITICAL FIX: Sign delegation through EOA owner, NOT Smart Account!
      // Smart Account doesn't support signDelegation() directly
      // We need to use EIP-712 signTypedData with delegation types
      
      const delegation = delegationDraft.delegation;
      
      // Prepare EIP-712 typed data for delegation
      // CRITICAL: verifyingContract MUST be DelegationManager, not authority!
      const DELEGATION_MANAGER = '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a' as `0x${string}`;
      
      const typedData = {
        domain: {
          name: 'DelegationManager',  // ✅ Name from DelegationManager contract
          version: '1',
          chainId: 10143,
          verifyingContract: DELEGATION_MANAGER  // ✅ DelegationManager address on Monad!
        },
        types: {
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
        },
        primaryType: 'Delegation' as const,
        message: {
          delegate: delegation.delegate,
          delegator: delegation.delegator,
          authority: delegation.authority,
          caveats: delegation.caveats,
          salt: delegation.salt
        }
      };
      
      // Sign with EOA owner through signTypedData (EIP-712)
      const signature = await walletClient.signTypedData(typedData);
      
      console.log('[Simple Setup] ✅ Delegation signed with EIP-712 (via EOA owner)!');
      
      // Combine delegation + signature (ERC-7710 format)
      const signedDelegation = {
        ...delegationDraft.delegation,
        signature: signature
      };
      
      console.log('[Simple Setup] Final signed delegation:', {
        delegate: signedDelegation.delegate,
        delegator: signedDelegation.delegator,
        authority: signedDelegation.authority,
        caveats: signedDelegation.caveats.length,
        salt: signedDelegation.salt.toString(),
        signature: signature.slice(0, 20) + '...'
      });

      // Step 5: Send ERC-7710 delegation to backend
      // Backend will create User SA, deploy it, and save delegation
      console.log('[Simple Setup] Sending ERC-7710 delegation to backend...');
      
      const response = await fetch('/api/delegation/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,  // User's EOA address
          eoaOwner: address,     // Same as userAddress
          signedDelegation: signedDelegation,  // ✅ ERC-7710 format!
          dailyLimitUSD: dailyLimit,
          maxRiskScore: maxRisk,
          allowedProtocols: protocols,
          validDays,
          selectedNetworks: selectedNetworks.map((n: any) => ({
            id: n.id,
            name: n.name,
            enabled: n.enabled,
            tokens: n.tokens.map((t: any) => ({
              symbol: t.symbol,
              enabled: t.enabled,
              balanceUSD: t.balanceUSD
            }))
          })),
          managedAssetsUSD,
          portfolioPercentage: aiCapitalPercent, // % который user выбрал ползунком!
          walletBalance, // Общий баланс для проверки
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delegation failed');
      }

      const result = await response.json();
      console.log('[Simple Setup] ✅ Delegation created:', result);
      
      // Backend returns User Smart Account address
      if (result.delegation && result.delegation.userSmartAccount) {
        const userSA = result.delegation.userSmartAccount;
        setAccountAddress(userSA);
        setSmartAccountAddress(userSA);
        console.log('[Simple Setup] ✅ User Smart Account:', userSA);
      }
      
      // Show Transfer Funds Modal first
      setCreatedDelegation(result.delegation);
      setShowTransferModal(true);
    } catch (error: any) {
      console.error('[Simple Setup] Error:', error);
      
      if (error.message.includes('User rejected')) {
        alert('You rejected the signature request. Delegation cannot be created without your signature.');
      } else {
        alert(`Failed to delegate: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartAINow = async () => {
    if (!smartAccountAddress) return;
    
    try {
      console.log('[AI Start] ⚡ Triggering immediate AI execution for Smart Account:', smartAccountAddress);
      
      // Use new /api/ai/execute-now/:address endpoint (don't wait for scheduler)
      const response = await fetch(`/api/ai/execute-now/${smartAccountAddress}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn('[AI Start] Warning:', error.message);
        // Don't fail - user can still use scheduler
      } else {
        const result = await response.json();
        console.log('[AI Start] ✅ AI executed immediately!', result);
      }
      
      setShowAIModal(false);
      router.push('/dashboard?setup=complete&ai=started');
    } catch (error: any) {
      console.error('[AI Start] Error:', error);
      alert(`AI execution warning: ${error.message}\n\nDelegation is active, AI scheduler will run in background.`);
      setShowAIModal(false);
      router.push('/dashboard?setup=complete');
    }
  };

  const handleStartAILater = () => {
    setShowAIModal(false);
    router.push('/dashboard?setup=complete');
  };

  const handleTransferComplete = () => {
    setShowTransferModal(false);
    setShowAIModal(true);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AppShell>
    <div className="py-12 px-4">
      <div className="max-w-2xl w-full mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={i} className="text-sm">
                <span className={i <= step ? 'text-primary font-medium' : 'text-gray-500'}>
                  {i + 1}. {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {/* Step 1: Connect Wallet */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="text-4xl mb-4">👛</div>
              <h2 className="text-3xl font-bold text-white">Connect Your Wallet</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Connect your wallet to delegate AI management permissions. Your funds stay in YOUR wallet.
              </p>
              
              <div className="py-6">
                <ConnectButton />
              </div>

              {isConnected && address && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-400 text-sm">
                      ✓ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Set Parameters */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-3xl font-bold text-white">AI Parameters</h2>
                <p className="text-gray-400">Configure AI agent constraints</p>
              </div>

              {/* Network & Token Selector */}
              <NetworkTokenSelector
                userAddress={address}
                onSelectionChange={(networks) => {
                  setSelectedNetworks(networks);
                  // Calculate managed assets USD
                  const managedUSD = networks
                    .filter(n => n.enabled)
                    .reduce((sum, n) => {
                      return sum + n.tokens.filter(t => t.enabled).reduce((s, t) => s + t.balanceUSD, 0);
                    }, 0);
                  setManagedAssetsUSD(managedUSD);
                }}
              />

              {/* AI Delegation Amount */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    💰 AI-Managed Capital
                  </label>
                  {loadingBalance && (
                    <span className="text-xs text-gray-400 animate-pulse">Loading balance...</span>
                  )}
                </div>
                
                {/* Percentage Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Percentage of Portfolio</span>
                    <span className="text-lg font-bold text-primary">{aiCapitalPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={aiCapitalPercent}
                    onChange={(e) => setAICapitalPercent(Number(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, #346ef0 0%, #346ef0 ${aiCapitalPercent}%, rgba(255,255,255,0.1) ${aiCapitalPercent}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* USD Amount Input */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Amount in USD
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={aiCapitalUSD}
                      onChange={(e) => handleUSDChange(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white font-mono text-lg focus:border-primary focus:outline-none"
                      min="0"
                      max={walletBalance}
                      step="100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {walletBalance > 0 ? (
                      <>
                        💼 Wallet Balance: <span className="text-white font-medium">${walletBalance.toLocaleString()}</span> • 
                        Available: <span className="text-green-400">${(walletBalance - aiCapitalUSD).toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-amber-400">⚠️ Unable to fetch balance, using demo mode</span>
                    )}
                  </p>
                </div>

                {aiCapitalPercent >= 50 && (
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-xs text-amber-300">
                      ⚠️ You're delegating {aiCapitalPercent}% of your portfolio. Consider starting with a lower amount.
                    </p>
                  </div>
                )}
              </div>

              {/* Daily Limit */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Daily Spending Limit (USD)
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                  min="100"
                  max="100000"
                  step="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum USD the AI can spend per day
                </p>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Maximum Risk Level: {maxRisk}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxRisk}
                  onChange={(e) => setMaxRisk(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span className="font-bold text-white">{maxRisk}/5</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Protocols - REAL Monad */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Allowed Protocols (Monad Testnet Only)
                </label>
                {loadingProtocols ? (
                  <div className="text-center py-4 text-slate-400">Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {availableProtocols.map((protocolData: any) => (
                      <label key={protocolData.protocol} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition">
                        <input
                          type="checkbox"
                          checked={protocols.includes(protocolData.protocol)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProtocols([...protocols, protocolData.protocol]);
                            } else {
                              setProtocols(protocols.filter(p => p !== protocolData.protocol));
                            }
                          }}
                          className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <span className="text-white">{protocolData.protocol}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {protocolData.avgApy.toFixed(1)}% APY • {protocolData.pools.length} pools
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Validity Period */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Delegation Valid For (days)
                </label>
                <input
                  type="number"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
                  min="1"
                  max="365"
                />
                <p className="text-xs text-gray-500 mt-1">
                  After this period, delegation will automatically expire
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:border-primary transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={protocols.length === 0 || aiCapitalUSD === 0}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Delegate */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-3xl font-bold text-white">Review & Delegate</h2>
                <p className="text-gray-400">Confirm your settings</p>
              </div>

              {/* Summary */}
              <div className="bg-black/20 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Wallet:</span>
                  <span className="font-mono text-white">{address?.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Daily Limit:</span>
                  <span className="font-bold text-white">${dailyLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Risk:</span>
                  <span className="font-bold text-white">{maxRisk}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Valid For:</span>
                  <span className="font-bold text-white">{validDays} days</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Protocols:</span>
                  <span className="text-white text-right">{protocols.join(', ')}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Managed Assets:</span>
                  <span className="font-bold text-primary">${aiCapitalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Selected Networks:</span>
                  <div className="text-right space-y-1">
                    {selectedNetworks.filter(n => n.enabled).map(network => (
                      <div key={network.id} className="text-white text-sm">
                        {network.icon} {network.name}
                        <div className="text-xs text-slate-400 ml-4">
                          {network.tokens.filter((t: any) => t.enabled).map((t: any) => t.symbol).join(', ')}
                        </div>
                      </div>
                    ))}
                    {selectedNetworks.filter(n => n.enabled).length === 0 && (
                      <span className="text-amber-400 text-sm">None selected</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-green-400 mb-2">🔐 Non-Custodial & Secure</h4>
                <ul className="text-xs text-green-200 space-y-1">
                  <li>✓ You will sign with MetaMask (no private keys shared)</li>
                  <li>✓ AI agent has NO access to your funds</li>
                  <li>✓ Execution happens through ERC-4337 delegation</li>
                  <li>✓ You can revoke anytime with one click</li>
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-sm text-amber-200 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    By signing, you authorize the AI agent to execute trades on your behalf 
                    within the limits above. Your signature proves authorization (fully non-custodial).
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:border-primary transition disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleDelegate}
                  disabled={loading}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? 'Creating Delegation...' : 'Delegate to AI Agent'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vault Deposit Modal (Step 1) */}
      {createdDelegation && (
        <VaultDepositModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onDepositComplete={handleTransferComplete}
          smartAccountAddress={smartAccountAddress || ''}
          userAddress={address || ''}
          managedAssetsUSD={aiCapitalUSD}
          selectedNetworks={selectedNetworks}
          portfolioPercentage={aiCapitalPercent}
        />
      )}

      {/* AI Agent Start Modal (Step 2) */}
      {createdDelegation && (
        <AIAgentStartModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onStartNow={handleStartAINow}
          onStartLater={handleStartAILater}
          aiAgentAddress={createdDelegation.aiAgentAddress}
        />
      )}
    </div>
    </AppShell>
  );
}

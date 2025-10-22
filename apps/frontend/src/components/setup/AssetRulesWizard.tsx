'use client'

import { useState, useEffect } from 'react'
// Card component simplified inline
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
)

interface AssetRule {
  token: string
  symbol: string
  maxAllocationPercent: number
  currentAllocation: number
  allowedChains: string[]
  canSwap: boolean
  swapPairs?: string[]
  canBridge: boolean
}

interface AssetRulesWizardProps {
  walletBalance: number
  onComplete: (params: {
    aiManagedCapital: number
    totalCapital: number
    assets: AssetRule[]
  }) => void
}

type Preset = 'conservative' | 'balanced' | 'aggressive'

export function AssetRulesWizard({ walletBalance, onComplete }: AssetRulesWizardProps) {
  const [step, setStep] = useState(1)
  const [preset, setPreset] = useState<Preset>('balanced')
  const [aiCapitalPercent, setAICapitalPercent] = useState(20)
  const [aiCapitalUSD, setAICapitalUSD] = useState(0)
  const [showRiskWarning, setShowRiskWarning] = useState(false)
  const [riskAcknowledged, setRiskAcknowledged] = useState(false)

  useEffect(() => {
    const calculated = (walletBalance * aiCapitalPercent) / 100
    setAICapitalUSD(calculated)
    setShowRiskWarning(aiCapitalPercent >= 30)
    if (aiCapitalPercent < 30) {
      setRiskAcknowledged(false)
    }
  }, [aiCapitalPercent, walletBalance])

  const handleUSDChange = (value: number) => {
    setAICapitalUSD(value)
    const percent = (value / walletBalance) * 100
    setAICapitalPercent(Math.min(100, percent))
  }

  const getPresetAssets = (presetType: Preset): AssetRule[] => {
    const presets = {
      conservative: [
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'USDC',
          maxAllocationPercent: 80,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: false,
          canBridge: false
        },
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'USDT',
          maxAllocationPercent: 20,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: false,
          canBridge: false
        }
      ],
      balanced: [
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
      ],
      aggressive: [
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'USDC',
          maxAllocationPercent: 50,
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
          swapPairs: ['USDC', 'DAI'],
          canBridge: false
        },
        {
          token: '0x0000000000000000000000000000000000000000',
          symbol: 'DAI',
          maxAllocationPercent: 20,
          currentAllocation: 0,
          allowedChains: ['monad'],
          canSwap: true,
          swapPairs: ['USDC', 'USDT'],
          canBridge: false
        }
      ]
    }

    return presets[presetType]
  }

  const handleComplete = () => {
    const assets = getPresetAssets(preset)
    
    onComplete({
      aiManagedCapital: aiCapitalUSD,
      totalCapital: walletBalance,
      assets
    })
  }

  const canProceed = () => {
    if (step === 1) return true
    if (step === 2) {
      if (showRiskWarning) {
        return riskAcknowledged
      }
      return aiCapitalUSD > 0
    }
    return true
  }

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Asset Management Setup</h2>
        <p className="text-gray-600">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Choose Your Strategy</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setPreset('conservative')
                setAICapitalPercent(10)
              }}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                preset === 'conservative'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="font-bold mb-2">Conservative</h4>
              <p className="text-sm text-gray-600 mb-2">Minimal risk, stablecoins only</p>
              <div className="text-xs space-y-1">
                <div>• AI Allocation: 10%</div>
                <div>• Risk Level: 2/5</div>
                <div>• Expected APY: 5-8%</div>
              </div>
            </button>

            <button
              onClick={() => {
                setPreset('balanced')
                setAICapitalPercent(20)
              }}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                preset === 'balanced'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">⚖️</div>
              <h4 className="font-bold mb-2">Balanced</h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
              <p className="text-sm text-gray-600 mb-2 mt-2">Optimal risk/reward balance</p>
              <div className="text-xs space-y-1">
                <div>• AI Allocation: 20%</div>
                <div>• Risk Level: 4/5</div>
                <div>• Expected APY: 8-12%</div>
              </div>
            </button>

            <button
              onClick={() => {
                setPreset('aggressive')
                setAICapitalPercent(50)
              }}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                preset === 'aggressive'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-bold mb-2">Aggressive</h4>
              <p className="text-sm text-gray-600 mb-2">Maximum yield, higher risk</p>
              <div className="text-xs space-y-1">
                <div>• AI Allocation: 50%</div>
                <div>• Risk Level: 5/5</div>
                <div>• Expected APY: 12-18%</div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Allocate Capital to AI</h3>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Your Wallet Balance</div>
            <div className="text-2xl font-bold">${walletBalance.toLocaleString()}</div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">How much capital for AI management?</span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={aiCapitalPercent}
                onChange={(e) => setAICapitalPercent(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </label>

            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={Math.round(aiCapitalUSD)}
                  onChange={(e) => handleUSDChange(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div className="flex-shrink-0 mt-6">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                  {aiCapitalPercent.toFixed(1)}% of balance
                </div>
              </div>
            </div>
          </div>

          {showRiskWarning && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-800 mb-2">⚠️ Higher Risk Detected</h4>
              <p className="text-sm text-yellow-700 mb-3">
                You're allocating {aiCapitalPercent.toFixed(0)}% of your balance to AI management.
                This increases risk exposure.
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">I understand the risks and take full responsibility</span>
              </label>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">How It Works:</h4>
            <div className="space-y-2 text-sm">
              <div>• <strong>Today:</strong> AI manages ${aiCapitalUSD.toLocaleString()}</div>
              <div>• <strong>AI earns +$500:</strong> Now manages ${(aiCapitalUSD + 500).toLocaleString()}</div>
              <div>• <strong>Market dips -$200:</strong> Now manages ${(aiCapitalUSD + 300).toLocaleString()}</div>
              <div>• <strong>You withdraw $300:</strong> Back to ${aiCapitalUSD.toLocaleString()}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 space-y-1 text-xs text-blue-700">
              <div>✓ You can add or withdraw capital anytime</div>
              <div>✓ Profits automatically reinvested</div>
              <div>✓ Your remaining balance: ${(walletBalance - aiCapitalUSD).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceed()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Selected Strategy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preset:</span>
                  <span className="font-medium capitalize">{preset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Managed Capital:</span>
                  <span className="font-medium">${aiCapitalUSD.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Remaining Balance:</span>
                  <span className="font-medium">${(walletBalance - aiCapitalUSD).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Asset Allocation Rules</h4>
              <div className="space-y-2 text-sm">
                {getPresetAssets(preset).map((asset) => (
                  <div key={asset.symbol} className="flex justify-between">
                    <span className="text-gray-600">{asset.symbol}:</span>
                    <span className="font-medium">
                      max {asset.maxAllocationPercent}% (${(aiCapitalUSD * asset.maxAllocationPercent / 100).toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next:</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <div>✓ Asset rules saved to your account</div>
                <div>✓ AI will analyze opportunities within your limits</div>
                <div>✓ All transactions require your approval (unless auto-execution enabled)</div>
                <div>✓ You can modify rules anytime from settings</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default AssetRulesWizard

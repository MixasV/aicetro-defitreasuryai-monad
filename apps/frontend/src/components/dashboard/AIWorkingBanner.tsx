'use client'

/**
 * AI Working Banner
 * 
 * Shows when AI agent is processing and data hasn't loaded yet.
 * Replaces empty state with helpful message.
 */

import { useState, useEffect } from 'react'

interface AIWorkingBannerProps {
  userAddress?: string
  show: boolean
}

export function AIWorkingBanner({ userAddress, show }: AIWorkingBannerProps) {
  const [dots, setDots] = useState('.')
  
  // Animated dots effect
  useEffect(() => {
    if (!show) return
    
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 500)
    
    return () => clearInterval(interval)
  }, [show])
  
  if (!show) return null
  
  return (
    <div className="rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-6 mb-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🤖 AI Agent is Working{dots}
          </h3>
          
          <p className="text-blue-700 dark:text-blue-300 mb-3">
            Don't worry! Your AI agent has already started and is analyzing the best strategy for your portfolio.
          </p>
          
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Checking your wallet balance
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Analyzing DeFi protocols (Aave, Yearn, Compound)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Calculating optimal allocation strategy
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500 animate-pulse">⏳</span>
              Executing first transactions...
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What's happening:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• AI is checking if you have USDC for DeFi investments</li>
              <li>• If needed, AI will swap some MON → USDC automatically</li>
              <li>• After swap, AI will deposit into best yield protocols</li>
              <li>• Real data will appear here in 1-2 minutes</li>
            </ul>
          </div>
          
          <p className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
            ⏱️ Typical wait time: 30-90 seconds
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-[progress_3s_ease-in-out_infinite]"
          style={{
            width: '60%'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }
      `}</style>
    </div>
  )
}

/**
 * Hook to detect if AI is working
 */
export function useAIWorking(hasData: boolean, delegationExists: boolean): boolean {
  const [isWorking, setIsWorking] = useState(true)
  
  useEffect(() => {
    if (!delegationExists) {
      setIsWorking(false)
      return
    }
    
    if (hasData) {
      setIsWorking(false)
      return
    }
    
    // Auto-hide after 3 minutes (data should load by then)
    const timeout = setTimeout(() => {
      setIsWorking(false)
    }, 3 * 60 * 1000)
    
    return () => clearTimeout(timeout)
  }, [hasData, delegationExists])
  
  return isWorking
}

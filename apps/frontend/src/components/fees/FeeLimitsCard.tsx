import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, AlertTriangle, Info } from 'lucide-react'

interface FeeLimitsData {
  monthlyLimit: number
  spent30Days: number
  remaining: number
  percentUsed: number
  transactions: {
    count: number
    totalFeesUSD: number
    avgFeeUSD: number
  }
  gasOptimization: {
    savedThisMonth: number
    avgGasPrice: number
    optimalHours: string[]
  }
}

export function FeeLimitsCard() {
  const [data, setData] = useState<FeeLimitsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeeLimits()
    const interval = setInterval(fetchFeeLimits, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchFeeLimits = async () => {
    try {
      const response = await fetch('/api/fee-limits/status')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch fee limits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-8 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getProgressColor = () => {
    if (data.percentUsed >= 90) return 'bg-red-500'
    if (data.percentUsed >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = () => {
    if (data.percentUsed >= 90) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
    if (data.percentUsed >= 70) {
      return <Info className="w-5 h-5 text-yellow-500" />
    }
    return <TrendingUp className="w-5 h-5 text-green-500" />
  }

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Monthly Fee Limits
        </h2>
        {getStatusIcon()}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted mb-2">
          <span>${data.spent30Days.toFixed(2)} spent</span>
          <span>${data.monthlyLimit.toFixed(2)} limit</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(data.percentUsed, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-center text-sm">
          <span className={`font-medium ${data.percentUsed >= 90 ? 'text-red-400' : 'text-white'}`}>
            {data.percentUsed.toFixed(1)}% used
          </span>
          <span className="text-muted ml-2">
            (${data.remaining.toFixed(2)} remaining)
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-muted">Transactions</div>
          <div className="text-xl font-bold text-white">{data.transactions.count}</div>
          <div className="text-xs text-muted">
            Avg: ${data.transactions.avgFeeUSD.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-muted">Saved via Optimization</div>
          <div className="text-xl font-bold text-green-400">
            ${data.gasOptimization.savedThisMonth.toFixed(2)}
          </div>
          <div className="text-xs text-muted">
            Avg gas: {data.gasOptimization.avgGasPrice} gwei
          </div>
        </div>
      </div>

      {/* Optimal Hours */}
      {data.gasOptimization.optimalHours.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <div className="text-sm text-muted">
            <span className="font-medium">Best hours for transactions:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {data.gasOptimization.optimalHours.map(hour => (
                <span key={hour} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      {data.percentUsed >= 70 && (
        <div className={`mt-4 p-3 rounded-lg ${
          data.percentUsed >= 90 
            ? 'bg-red-500/20 text-red-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              {data.percentUsed >= 90 
                ? `Fee limit nearly exhausted! Only ${data.transactions.count} transactions remaining this month. Non-critical operations will be deferred.`
                : `Approaching monthly fee limit. Consider deferring non-urgent transactions to next month.`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

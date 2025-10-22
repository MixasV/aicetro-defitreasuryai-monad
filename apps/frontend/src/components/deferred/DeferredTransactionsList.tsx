import React, { useState, useEffect } from 'react'
import { Clock, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

interface DeferredTransaction {
  id: string
  accountAddress: string
  protocol: string
  action: string
  amount: number
  currentGasPrice: number
  targetGasPrice: number
  estimatedSavingsUSD: number
  deferredAt: string
  executeAt: string
  status: 'pending' | 'executed' | 'cancelled'
  reason: string
}

export function DeferredTransactionsList() {
  const [transactions, setTransactions] = useState<DeferredTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeferredTransactions()
    const interval = setInterval(fetchDeferredTransactions, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchDeferredTransactions = async () => {
    try {
      const response = await fetch('/api/deferred-transactions')
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch deferred transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'executed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const formatTimeRemaining = (executeAt: string) => {
    const now = new Date()
    const executeTime = new Date(executeAt)
    const diff = executeTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ready to execute'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Deferred Transactions
        </h2>
        <p className="text-muted text-center py-8">
          No deferred transactions. All operations execute immediately when gas is optimal.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Deferred Transactions ({transactions.filter(t => t.status === 'pending').length})
      </h2>
      
      <div className="space-y-3">
        {transactions.map(tx => (
          <div key={tx.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(tx.status)}
                  <span className="font-medium text-white">{tx.action}</span>
                  <span className="text-sm text-muted">on {tx.protocol}</span>
                </div>
                
                <div className="text-sm text-muted space-y-1">
                  <div>Amount: ${tx.amount.toLocaleString()}</div>
                  <div className="flex items-center gap-4">
                    <span>Gas: {tx.currentGasPrice} → {tx.targetGasPrice} gwei</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Save ${tx.estimatedSavingsUSD.toFixed(2)}
                    </span>
                  </div>
                  {tx.status === 'pending' && (
                    <div className="text-yellow-400">
                      Executes in: {formatTimeRemaining(tx.executeAt)}
                    </div>
                  )}
                </div>
              </div>
              
              {tx.status === 'pending' && (
                <button className="ml-4 px-3 py-1 text-sm border border-white/20 rounded hover:bg-white/10">
                  Cancel
                </button>
              )}
            </div>
            
            {tx.reason && (
              <div className="mt-2 text-xs text-muted italic">
                {tx.reason}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-sm text-muted">
          Total potential savings: $
          {transactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + t.estimatedSavingsUSD, 0)
            .toFixed(2)}
        </div>
      </div>
    </div>
  )
}

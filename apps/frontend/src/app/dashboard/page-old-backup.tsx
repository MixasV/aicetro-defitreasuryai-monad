'use client'

import { AppShell } from '@/components/layout/AppShell'
import { DeferredTransactionsList } from '@/components/deferred/DeferredTransactionsList'
import { FeeLimitsCard } from '@/components/fees/FeeLimitsCard'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { Activity, DollarSign, TrendingUp, Shield } from 'lucide-react'

interface DashboardStats {
  totalValue: number
  dailyChange: number
  monthlyROI: number
  activePositions: number
  pendingOperations: number
  gasOptimized: boolean
}

export default function DashboardPage() {
  const { address } = useAccount()
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    dailyChange: 0,
    monthlyROI: 0,
    activePositions: 0,
    pendingOperations: 0,
    gasOptimized: true
  })

  useEffect(() => {
    if (address) {
      fetchDashboardStats()
    }
  }, [address])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  }

  if (!address) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-500">Please connect your wallet to view the dashboard</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Treasury Dashboard</h1>
          <p className="text-muted mt-2">
            Monitor your AI-powered treasury operations in real-time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className={`text-sm font-medium ${stats.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.dailyChange >= 0 ? '+' : ''}{stats.dailyChange.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">${stats.totalValue.toLocaleString()}</div>
            <div className="text-sm text-muted">Total Portfolio Value</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                +{stats.monthlyROI.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.monthlyROI.toFixed(2)}%</div>
            <div className="text-sm text-muted">Monthly ROI</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.activePositions}</div>
            <div className="text-sm text-muted">Active Positions</div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-purple-500" />
              {stats.gasOptimized && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                  Optimized
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white">{stats.pendingOperations}</div>
            <div className="text-sm text-muted">Pending Operations</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fee Limits Card */}
          <FeeLimitsCard />

          {/* Deferred Transactions */}
          <DeferredTransactionsList />
        </div>

        {/* Activity Feed */}
        <div className="mt-8 glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Recent AI Operations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-white">Rebalanced USDC/WETH pool</span>
              </div>
              <span className="text-sm text-muted">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">Analyzing market conditions...</span>
              </div>
              <span className="text-sm text-muted">In progress</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-white">Fee optimization saved $12.34</span>
              </div>
              <span className="text-sm text-muted">15 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

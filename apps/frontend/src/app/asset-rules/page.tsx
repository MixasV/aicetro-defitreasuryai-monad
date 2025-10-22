'use client'

import { useState } from 'react'
import AssetRulesWizard from '../../components/setup/AssetRulesWizard'
import { useRouter } from 'next/navigation'

export default function AssetRulesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock wallet balance for demo
  const walletBalance = 100000

  const handleComplete = async (params: {
    aiManagedCapital: number
    totalCapital: number
    assets: any[]
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/asset-management/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountAddress: '0xdemo', // In real app, get from wallet
          ...params
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save asset rules')
      }

      // Redirect to dashboard
      router.push('/dashboard?setup=complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Saving your asset rules...</p>
          </div>
        ) : (
          <AssetRulesWizard
            walletBalance={walletBalance}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  )
}

'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';

interface ExpandPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  currentDelegation: {
    dailyLimitUSD: number;
    allowedProtocols: string[];
  };
  onExpand: () => void;
}

export function ExpandPermissionsModal({
  isOpen,
  onClose,
  userAddress,
  currentDelegation,
  onExpand
}: ExpandPermissionsModalProps) {
  const [newDailyLimit, setNewDailyLimit] = useState(currentDelegation.dailyLimitUSD * 2);
  const [newProtocols, setNewProtocols] = useState<string[]>([...currentDelegation.allowedProtocols]);
  const [loading, setLoading] = useState(false);
  const { data: walletClient } = useWalletClient();

  if (!isOpen) return null;

  const handleExpand = async () => {
    try {
      setLoading(true);

      // TODO: Create new delegation with authority = hash(currentDelegation)
      // TODO: Sign with MetaMask
      // TODO: Send to backend /api/delegation-chain/expand

      alert('Expand permissions implementation in progress');
      onExpand();
    } catch (error: any) {
      console.error('[Expand Permissions] Error:', error);
      alert('Failed to expand permissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4">Expand AI Permissions</h2>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ✅ Your existing positions will remain accessible<br/>
            ✅ Only ONE signature needed<br/>
            ⚠️ This expands (not replaces) your current delegation
          </p>
        </div>

        {/* Current vs New */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Current</h3>
            <p className="text-sm">Daily Limit: ${currentDelegation.dailyLimitUSD}</p>
            <p className="text-sm">Protocols: {currentDelegation.allowedProtocols.join(', ')}</p>
          </div>
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <h3 className="font-semibold mb-2">New</h3>
            <div className="mb-2">
              <label className="text-sm">Daily Limit:</label>
              <input
                type="number"
                value={newDailyLimit}
                onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                className="w-full mt-1 px-2 py-1 border rounded"
              />
            </div>
            <p className="text-sm">Protocols: {newProtocols.join(', ')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExpand}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Signing...' : 'Sign Expansion'}
          </button>
        </div>
      </div>
    </div>
  );
}

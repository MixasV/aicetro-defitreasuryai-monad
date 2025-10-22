'use client';

import { useState } from 'react';

interface RecreateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  currentPositions: {
    protocol: string;
    amount: number;
    usdValue: number;
  }[];
  onConfirm: () => void;
}

export function RecreateWarningModal({
  isOpen,
  onClose,
  currentPositions,
  onConfirm
}: RecreateWarningModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalValue = currentPositions.reduce((sum, p) => sum + p.usdValue, 0);

  const handleConfirm = async () => {
    if (!confirmed) {
      alert('Please confirm that you understand the consequences');
      return;
    }

    try {
      setLoading(true);

      // TODO: Call backend to withdraw all positions
      // TODO: Wait for withdrawals to complete
      // TODO: Recreate delegation

      onConfirm();
    } catch (error: any) {
      console.error('[Recreate Warning] Error:', error);
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Warning: Funds Will Be Withdrawn!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Reducing permissions requires withdrawing all funds from pools
            </p>
          </div>
        </div>

        {/* Current positions */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="font-semibold mb-3">Current Positions (will be withdrawn):</h3>
          {currentPositions.length === 0 ? (
            <p className="text-sm">No active positions</p>
          ) : (
            <div className="space-y-2">
              {currentPositions.map((pos, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{pos.protocol}: {pos.amount.toFixed(2)} tokens</span>
                  <span className="font-semibold">${pos.usdValue.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between font-bold">
                <span>Total:</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Consequences */}
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold mb-2">What will happen:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>AI agent will withdraw ${totalValue.toFixed(2)} from all pools</li>
            <li>Funds will return to your wallet</li>
            <li>Old delegation will be deactivated</li>
            <li>New delegation will be created with new settings</li>
            <li>⚠️ Additional gas costs (~$5-10 for withdrawals)</li>
          </ul>
        </div>

        {/* Confirmation checkbox */}
        <div className="mb-6">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm">
              I understand that all funds will be withdrawn from pools and returned to my wallet.
              I will pay additional gas fees for withdrawals.
            </span>
          </label>
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
            onClick={handleConfirm}
            disabled={loading || !confirmed}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Withdraw & Recreate'}
          </button>
        </div>
      </div>
    </div>
  );
}

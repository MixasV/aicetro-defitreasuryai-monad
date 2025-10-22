'use client';

import { Shield, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserSmartAccountCardProps {
  userEOA: string;
}

interface SmartAccountInfo {
  userEOA: string;
  smartAccountAddress: string;
  isDeployed: boolean;
  hasInitCode: boolean;
}

export function UserSmartAccountCard({ userEOA }: UserSmartAccountCardProps) {
  const [saInfo, setSaInfo] = useState<SmartAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userEOA) {
      fetchSmartAccountInfo();
    }
  }, [userEOA]);

  const fetchSmartAccountInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/user-smart-account/${userEOA}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Smart Account info');
      }

      const data = await response.json();
      
      if (data.success && data.smartAccount) {
        setSaInfo(data.smartAccount);
      }
    } catch (err: any) {
      console.error('[UserSACard] Error fetching SA info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Smart Account</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !saInfo) {
    return null; // Don't show card if no SA info
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const explorerUrl = `https://testnet.monadscan.io/address/${saInfo.smartAccountAddress}`;

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Smart Account</h3>
        </div>
        {saInfo.isDeployed ? (
          <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3" />
            Deployed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            Counterfactual
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted mb-1">Smart Account Address</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {truncateAddress(saInfo.smartAccountAddress)}
            </code>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition"
              title="View on Monad Explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted mb-1">Your EOA</p>
          <code className="text-xs font-mono text-muted-foreground">
            {truncateAddress(saInfo.userEOA)}
          </code>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted leading-relaxed">
            This Smart Account is controlled by your EOA wallet. 
            AI Agent can execute transactions on your behalf through delegation.
          </p>
        </div>
      </div>
    </div>
  );
}

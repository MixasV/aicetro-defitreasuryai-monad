'use client';

import { useEffect, useState } from 'react';

interface MiniChartProps {
  poolId: string;
  width?: number;
  height?: number;
}

type MetricType = 'volume' | 'tvl' | 'apy';

interface ChartData {
  volume: number[];
  tvl: number[];
  apy: number[];
}

export function MiniChart({ poolId, width = 100, height = 30 }: MiniChartProps) {
  const [chartData, setChartData] = useState<ChartData>({ volume: [], tvl: [], apy: [] });
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('volume');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<MetricType[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        // URL-encode poolId because it may contain slashes
        const encodedPoolId = encodeURIComponent(poolId);
        const res = await fetch(`/api/pools/${encodedPoolId}/history?days=7`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const json = await res.json();
        
        // Extract all three metrics
        const volumeData: number[] = [];
        const tvlData: number[] = [];
        const apyData: number[] = [];
        const available: MetricType[] = [];
        
        if (json.data && Array.isArray(json.data)) {
          json.data.forEach((d: any) => {
            volumeData.push(d.volume24h || 0);
            tvlData.push(d.tvl || 0);
            apyData.push(d.apy || 0);
          });
          
          // Determine which metrics have non-zero data
          if (volumeData.some(v => v > 0)) available.push('volume');
          if (tvlData.some(v => v > 0)) available.push('tvl');
          if (apyData.some(v => v > 0)) available.push('apy');
          
          // Set default to first available metric
          if (available.length > 0) {
            setSelectedMetric(available[0]);
          }
        }
        
        setChartData({ volume: volumeData, tvl: tvlData, apy: apyData });
        setAvailableMetrics(available);
        setError(false);
      } catch (err) {
        console.error('[MiniChart] Error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [poolId]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-800/30 rounded"
        style={{ width, height }}
      >
        <div className="text-xs text-slate-500">...</div>
      </div>
    );
  }

  // If no data available for ANY metric, show error
  if (error || availableMetrics.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="flex items-center justify-center bg-slate-800/30 rounded"
          style={{ width, height }}
        >
          <div className="text-xs text-slate-600">–</div>
        </div>
      </div>
    );
  }

  // Get data for selected metric
  const data = chartData[selectedMetric];
  
  if (data.length === 0) {
    return null;
  }

  // Simple sparkline rendering
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Determine color based on trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral';
  const color = trend === 'up' ? '#34d399' : trend === 'down' ? '#f87171' : '#94a3b8';

  const metricLabels = {
    volume: 'VOL',
    tvl: 'TVL',
    apy: 'APY'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Chart with label */}
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          className="rounded bg-slate-900/50"
          viewBox={`0 0 ${width} ${height}`}
        >
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Label in top-right corner */}
        <div className="absolute top-0.5 right-1 text-[9px] font-medium text-slate-400 opacity-70">
          {metricLabels[selectedMetric]}
        </div>
      </div>
      
      {/* Metric selector (mini slider) */}
      {availableMetrics.length > 1 && (
        <div className="flex gap-0.5">
          {availableMetrics.map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`w-6 h-0.5 rounded-full transition-colors ${
                selectedMetric === metric 
                  ? 'bg-primary-400' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title={metricLabels[metric]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

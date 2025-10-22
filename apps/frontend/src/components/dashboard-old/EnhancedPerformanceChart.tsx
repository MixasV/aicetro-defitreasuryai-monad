import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PortfolioMetricPoint } from '@defitreasuryai/types';

interface Props {
  metrics: PortfolioMetricPoint[];
  isLoading?: boolean;
}

type TimeFrame = '24H' | '7D' | '30D' | '1Y';
type ChartType = 'line' | 'area';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const EnhancedPerformanceChart = ({ metrics, isLoading }: Props) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('7D');
  const [chartType, setChartType] = useState<ChartType>('area');
  
  // Announce chart updates to screen readers
  const chartDescription = `Performance chart showing ${metrics.length} data points. Current value: ${metrics.length > 0 ? formatter.format(metrics[metrics.length - 1].netAssetValue) : 'no data'}.`;

  // Transform metrics for chart
  const chartData = metrics.map((point) => ({
    timestamp: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: point.netAssetValue,
    yield: point.projectedYield,
    fullTimestamp: point.timestamp
  }));

  // Calculate stats
  const latestValue = metrics.length > 0 ? metrics[metrics.length - 1].netAssetValue : 0;
  const firstValue = metrics.length > 0 ? metrics[0].netAssetValue : 0;
  const change = latestValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="mb-2 text-xs text-slate-400">{payload[0].payload.timestamp}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-xs text-slate-300">Portfolio Value</span>
              <span className="font-semibold text-white">{formatter.format(payload[0].value)}</span>
            </div>
            {payload[0].payload.yield && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-xs text-slate-300">Projected Yield</span>
                <span className="font-semibold text-emerald-400">{formatter.format(payload[0].payload.yield)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card overflow-hidden p-6" role="region" aria-label="Portfolio performance chart">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm uppercase tracking-wide text-slate-400">Performance</h3>
          {!isLoading && metrics.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-white">{formatter.format(latestValue)}</span>
                <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <TrendingUp className={`mr-1 h-4 w-4 ${isPositive ? '' : 'rotate-180'}`} />
                  <span>
                    {isPositive ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {isPositive ? '+' : ''}
                {formatter.format(change)} change
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <div className="flex rounded-lg bg-slate-800 p-1" role="group" aria-label="Select timeframe">
            {(['24H', '7D', '30D', '1Y'] as TimeFrame[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                  timeframe === period ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={timeframe === period}
                aria-label={`Show ${period} timeframe`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex rounded-lg bg-slate-800 p-1" role="group" aria-label="Select chart type">
            <button
              onClick={() => setChartType('line')}
              className={`rounded p-2 transition-all ${
                chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Line chart"
              aria-pressed={chartType === 'line'}
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`rounded p-2 transition-all ${
                chartType === 'area' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Area chart"
              aria-pressed={chartType === 'area'}
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
            <p className="mt-3 text-sm text-slate-400">Loading performance data...</p>
          </div>
        </div>
      ) : metrics.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="timestamp" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis
                    tickFormatter={(value) => formatter.format(value)}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: '#3b82f6',
                      stroke: '#1e40af',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="timestamp" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis
                    tickFormatter={(value) => formatter.format(value)}
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart Footer Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4 border-t border-slate-700/50 pt-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">24h Change</div>
              <div className="mt-1 font-semibold text-emerald-400">+2.4%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">7d Change</div>
              <div className="mt-1 font-semibold text-emerald-400">+{changePercent.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Peak Value</div>
              <div className="mt-1 font-semibold text-slate-200">
                {formatter.format(Math.max(...metrics.map((m) => m.netAssetValue)))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Avg Daily</div>
              <div className="mt-1 font-semibold text-slate-200">
                {formatter.format(metrics.reduce((sum, m) => sum + (m.projectedYield || 0), 0) / metrics.length)}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">No performance data</p>
            <p className="text-xs text-slate-400">Data will appear once you begin operations</p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Token, PricePoint } from '../types/index';
import { safeFetchJson } from '../utils/api';
import { TokenLogo } from './TokenLogo';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface Props {
  tokens: Token[];
  onSelectToken?: (symbol: string) => void;
}

const FEATURED_SYMBOLS = ['SDA', 'FBAY', 'WSDA', 'GPC', 'RIDEX'];

export const DashboardPriceChart: React.FC<Props> = ({ tokens }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('FBAY');
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '1Y' | 'ALL'>('1D');
  const [currency, setCurrency] = useState<'SDA' | 'USD'>('SDA');
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(false);

  // Find token object from props or fallback
  const selectedToken = tokens.find(t => t.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || tokens[0];

  const fetchHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsLiveUpdating(true);
    setError(null);

    try {
      const data = await safeFetchJson<PricePoint[]>(`/api/tokens/${selectedSymbol}/history?timeframe=${timeframe}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Chart history fetch notice:', err?.message || err);
      setError('Price trend data temporarily unavailable');
    } finally {
      if (!silent) setLoading(false);
      setIsLiveUpdating(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      fetchHistory(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  // Calculate high/low/change for displayed chart dataset
  const prices = history.map(p => currency === 'USD' ? p.priceUsd : p.priceSda);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const firstPrice = prices.length > 0 ? prices[0] : 0;
  const lastPrice = prices.length > 0 ? prices[prices.length - 1] : (selectedToken ? (currency === 'USD' ? selectedToken.priceUsd : selectedToken.priceSda) : 0);
  
  const chartChangePercent = firstPrice > 0 
    ? Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)) 
    : (selectedToken?.change24h || 0);

  const isPositive = chartChangePercent >= 0;
  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const fillColor = isPositive ? '#10b981' : '#ef4444';

  const formatPriceVal = (val: number) => {
    if (val === undefined || val === null) return '0.00';
    if (val < 0.0001) return val.toFixed(6);
    if (val < 0.1) return val.toFixed(4);
    if (val < 10) return val.toFixed(3);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 space-y-5 border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: strokeColor }}
      />

      {/* Header & Token Selector Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
        {/* Token Info & Live Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedToken && (
            <div className="flex items-center gap-2.5">
              <TokenLogo token={selectedToken} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#e0e2e6] font-['Outfit']">
                    {selectedToken.name}
                  </h3>
                  <span className="text-xs font-mono text-gray-400">({selectedToken.symbol})</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-bold font-mono text-white">
                    {currency === 'USD' ? '$' : ''}{formatPriceVal(lastPrice)} {currency === 'SDA' ? 'SDA' : ''}
                  </span>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold font-mono ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{chartChangePercent}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time sync badge */}
          <div className="ml-auto lg:ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] text-gray-400 font-mono">
            <span className={`w-2 h-2 rounded-full ${isLiveUpdating ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>REAL-TIME TELEMETRY</span>
          </div>
        </div>

        {/* Quick Token Tabs + Selector & Timeframe Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Featured Tokens Quick Pills */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-white/5">
            {FEATURED_SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSymbol.toUpperCase() === sym 
                    ? 'bg-[#f2ca50] text-[#3c2f00] shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {sym}
              </button>
            ))}

            {/* Dropdown for all other tokens if user wants */}
            {tokens.length > 5 && (
              <select
                value={FEATURED_SYMBOLS.includes(selectedSymbol.toUpperCase()) ? '' : selectedSymbol}
                onChange={(e) => {
                  if (e.target.value) setSelectedSymbol(e.target.value);
                }}
                className="bg-transparent text-xs text-gray-300 font-medium px-2 py-1 focus:outline-none cursor-pointer hover:text-white"
              >
                <option value="" disabled className="bg-[#12161f] text-gray-400">
                  More...
                </option>
                {tokens
                  .filter(t => !FEATURED_SYMBOLS.includes(t.symbol.toUpperCase()))
                  .map(t => (
                    <option key={t.id} value={t.symbol} className="bg-[#12161f] text-white">
                      {t.symbol} - {t.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-[#0d1117] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setCurrency('SDA')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                currency === 'SDA' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              SDA
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                currency === 'USD' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-white/5">
            {(['1D', '7D', '1M', '1Y', 'ALL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  timeframe === tf
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/30 rounded-xl p-3 border border-white/5 text-xs">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">High ({timeframe})</p>
          <p className="font-mono text-white font-bold mt-0.5">
            {currency === 'USD' ? '$' : ''}{formatPriceVal(maxPrice)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Low ({timeframe})</p>
          <p className="font-mono text-white font-bold mt-0.5">
            {currency === 'USD' ? '$' : ''}{formatPriceVal(minPrice)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">24h Pool Liquidity</p>
          <p className="font-mono text-white font-bold mt-0.5">
            ${selectedToken ? (selectedToken.liquidityUsd / 1000).toFixed(1) : '0'}K USD
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-semibold">24h Trading Volume</p>
          <p className="font-mono text-white font-bold mt-0.5">
            ${selectedToken ? (selectedToken.volume24hUsd / 1000).toFixed(1) : '0'}K USD
          </p>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[280px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl space-y-2 backdrop-blur-sm z-20">
            <RefreshCw className="w-6 h-6 text-[#f2ca50] animate-spin" />
            <p className="text-xs text-gray-400 font-mono">Loading {selectedSymbol} performance trend...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl space-y-2 text-center p-4">
            <p className="text-xs text-amber-400 font-semibold">{error}</p>
            <button
              onClick={() => fetchHistory(false)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="timeLabel"
              tick={{ fill: '#808a9d', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />

            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#808a9d', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => formatPriceVal(val)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: PricePoint = payload[0].payload;
                  const price = currency === 'USD' ? data.priceUsd : data.priceSda;
                  return (
                    <div className="bg-[#12161f] border border-white/15 p-3 rounded-xl shadow-2xl space-y-1 text-xs">
                      <p className="text-gray-400 text-[10px] font-mono">{data.timeLabel} • {data.timestamp ? new Date(data.timestamp).toLocaleDateString() : ''}</p>
                      <div className="flex items-center justify-between gap-4 font-mono">
                        <span className="text-gray-300">Price:</span>
                        <span className="font-bold text-white">
                          {currency === 'USD' ? '$' : ''}{formatPriceVal(price)} {currency === 'SDA' ? 'SDA' : ''}
                        </span>
                      </div>
                      {data.volumeUsd > 0 && (
                        <div className="flex items-center justify-between gap-4 font-mono">
                          <span className="text-gray-400 text-[10px]">Volume:</span>
                          <span className="text-emerald-400 text-[11px]">${data.volumeUsd.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey={currency === 'USD' ? 'priceUsd' : 'priceSda'}
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartGradient)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Navigation Link */}
      <div className="flex items-center justify-between pt-2 text-xs text-gray-400 font-mono border-t border-white/5">
        <span className="flex items-center gap-1 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-[#f2ca50]" />
          <span>SidraChain Live On-Chain Data Feed</span>
        </span>
        <a
          href={`/token/${selectedSymbol}`}
          className="text-[#f2ca50] hover:underline font-semibold flex items-center gap-1 hover:text-yellow-300"
        >
          <span>Deep Telemetry for {selectedSymbol}</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
};

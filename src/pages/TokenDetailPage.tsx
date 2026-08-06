import React, { useEffect, useState } from 'react';
import { Token, PricePoint } from '../types/index';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { TokenLogo } from '../components/TokenLogo';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Copy, Check, ExternalLink, ShieldCheck, RefreshCw, BarChart2, Users, Database } from 'lucide-react';

interface Props {
  symbolParam?: string;
}

export const TokenDetailPage: React.FC<Props> = ({ symbolParam }) => {
  const symbol = symbolParam || window.location.pathname.split('/').pop() || 'FBAY';
  const [token, setToken] = useState<Token | null>(null);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '1Y' | 'ALL'>('1D');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tokenRes, historyRes] = await Promise.all([
        fetch(`/api/tokens/${symbol}`),
        fetch(`/api/tokens/${symbol}/history?timeframe=${timeframe}`)
      ]);

      if (!tokenRes.ok) throw new Error(`Token '${symbol}' not found.`);

      const tokenData = await tokenRes.json();
      setToken(tokenData);

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setChartData(historyData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch token telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenDetails();
  }, [symbol, timeframe]);

  const handleCopyContract = () => {
    if (token?.contractAddress) {
      navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#f2ca50] animate-spin mx-auto" />
        <p className="text-xs text-[#d0c5af]">Fetching telemetry & live pricing for {symbol}...</p>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="py-16 text-center glass-panel rounded-2xl p-8 max-w-lg mx-auto space-y-4">
        <p className="text-red-400 text-sm font-semibold">{error || 'Token data unavailable'}</p>
        <p className="text-xs text-gray-400">Please select a valid token from the markets dashboard.</p>
        <a
          href="/markets"
          className="inline-block px-4 py-2 bg-[#f2ca50] text-[#3c2f00] font-bold text-xs rounded-xl"
        >
          Return to Markets
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Identity Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <TokenLogo token={token} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[#e0e2e6] font-['Outfit']">
                  {token.name}
                </h1>
                <span className="text-xs font-mono text-gray-400">({token.symbol})</span>
                <DemoDataBadge status={token.verificationStatus} isDemoData={token.isDemoData} />
              </div>

              {/* Contract address row */}
              <div className="flex items-center gap-2 mt-1 text-xs text-[#d0c5af] font-mono">
                <span>{token.contractAddress.slice(0, 10)}...{token.contractAddress.slice(-8)}</span>
                <button
                  onClick={handleCopyContract}
                  className="p-1 text-gray-400 hover:text-[#f2ca50] transition-colors"
                  title="Copy contract address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={token.explorerUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-gray-400 hover:text-[#f2ca50] transition-colors"
                  title="View on Sidra Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="text-left md:text-right">
            <div className="text-2xl md:text-3xl font-extrabold text-[#e0e2e6] font-mono">
              {token.priceSda.toFixed(token.priceSda < 0.0001 ? 6 : token.priceSda < 0.1 ? 4 : 2)} <span className="text-sm text-[#f2ca50]">SDA</span>
            </div>
            <div className="flex items-center md:justify-end gap-2 text-xs font-semibold mt-1">
              <span className="text-gray-400 font-mono">Native SidraChain Rate</span>
              <span className={token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Chart Panel */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#f2ca50]" />
              Historical Price Performance
            </h2>
            <p className="text-xs text-[#d0c5af]">Timeframe chart rendered via institutional telemetry feeds.</p>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex gap-1.5 bg-[#0b0f11] p-1 rounded-xl border border-white/5">
            {(['1D', '7D', '1M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === tf
                    ? 'bg-[#f2ca50] text-[#3c2f00]'
                    : 'text-[#d0c5af] hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timeLabel" stroke="#99907c" fontSize={10} tickLine={false} />
              <YAxis stroke="#99907c" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101417',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#e0e2e6',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="priceSda"
                stroke="#f2ca50"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Metrics Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Market Cap */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-[#d0c5af] uppercase">Est. Market Cap</p>
          <p className="text-xl font-extrabold text-[#e0e2e6] font-mono mt-1">
            {token.marketCapUsd ? `${(token.marketCapUsd / 1000).toFixed(1)}K SDA` : 'Estimated'}
          </p>
          <span className="text-[10px] text-gray-500">Based on circulating supply</span>
        </div>

        {/* FDV */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-[#d0c5af] uppercase">Fully Diluted Val.</p>
          <p className="text-xl font-extrabold text-[#e0e2e6] font-mono mt-1">
            {token.fdvUsd ? `${(token.fdvUsd / 1000).toFixed(1)}K SDA` : 'N/A'}
          </p>
          <span className="text-[10px] text-gray-500">Max valuation at full supply</span>
        </div>

        {/* Circulating Supply */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-[#d0c5af] uppercase">Circulating Supply</p>
          <p className="text-xl font-extrabold text-[#e0e2e6] font-mono mt-1">
            {(token.circulatingSupply / 1000000).toFixed(1)}M {token.symbol}
          </p>
          <span className="text-[10px] text-gray-500">
            {((token.circulatingSupply / token.totalSupply) * 100).toFixed(0)}% unlocked
          </span>
        </div>

        {/* Total Supply */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-[#d0c5af] uppercase">Total Supply</p>
          <p className="text-xl font-extrabold text-[#e0e2e6] font-mono mt-1">
            {(token.totalSupply / 1000000).toFixed(1)}M {token.symbol}
          </p>
          <span className="text-[10px] text-gray-500">Hard cap max supply</span>
        </div>
      </div>

      {/* Secondary Details & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About & Metadata */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-[#e0e2e6] font-['Outfit']">About {token.name}</h3>
          <p className="text-xs text-[#d0c5af] leading-relaxed">
            {token.description}
          </p>

          <div className="pt-4 border-t border-white/5 space-y-2.5 text-xs text-[#d0c5af]">
            <div className="flex justify-between items-center">
              <span>Network:</span>
              <span className="font-semibold text-[#e0e2e6]">{token.network}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Data Source:</span>
              <span className="font-semibold text-[#f2ca50]">
                {token.dataSource ? token.dataSource.replace(/\s*\(.*?\)/g, '') : 'Sidra Dex Live'}
              </span>
            </div>
            {token.poolId && (
              <div className="flex justify-between items-center">
                <span>Pool ID:</span>
                <span className="font-mono text-[#e0e2e6] text-[11px]">{token.poolId}</span>
              </div>
            )}
            {token.blockNumber && (
              <div className="flex justify-between items-center">
                <span>Block Number:</span>
                <span className="font-mono text-[#e0e2e6] text-[11px]">#{token.blockNumber}</span>
              </div>
            )}
            {token.quoteRef && (
              <div className="flex justify-between items-center">
                <span>Quote Ref:</span>
                <span className="font-mono text-gray-400 text-[10px] truncate max-w-[150px]">{token.quoteRef}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Holders:</span>
              <span className="font-mono text-[#e0e2e6]">{token.holdersCount.toLocaleString()}</span>
            </div>
            {token.transfersCount !== undefined && (
              <div className="flex justify-between items-center">
                <span>Total Transfers:</span>
                <span className="font-mono text-[#f2ca50] font-semibold">{token.transfersCount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Liquidity Depth:</span>
              <span className="font-mono text-[#e0e2e6]">{(token.liquidityUsd / 1000).toFixed(1)}K SDA</span>
            </div>
          </div>
        </div>

        {/* Recent On-Chain Transactions */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-[#e0e2e6] font-['Outfit']">Recent Transactions</h3>

          {token.recentTransactions && token.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#e0e2e6]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-[#d0c5af] uppercase">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount (SDA)</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3">Tx Hash</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {token.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          tx.type === 'Buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">{tx.amountSda} SDA</td>
                      <td className="py-3 px-3 text-right font-mono text-[#d0c5af]">{tx.amountSda} SDA</td>
                      <td className="py-3 px-3 font-mono text-gray-400">{tx.txHash}</td>
                      <td className="py-3 px-3 text-right text-gray-400">{tx.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">
              No recent verified transactions recorded for this dataset.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

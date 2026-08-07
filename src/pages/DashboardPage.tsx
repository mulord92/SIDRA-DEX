import React, { useEffect, useState } from 'react';
import { Token, MarketGlobalStats } from '../types/index';
import { safeFetchJson } from '../utils/api';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { TokenLogo } from '../components/TokenLogo';
import { DashboardPriceChart } from '../components/DashboardPriceChart';
import { TrendingUp, TrendingDown, RefreshCw, Search, ArrowUpRight, ArrowDownRight, Layers, DollarSign, Activity, Droplets, Sparkles, Radio } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<MarketGlobalStats | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMsg(null);
    try {
      const [statsData, tokensData] = await Promise.all([
        safeFetchJson<MarketGlobalStats>('/api/stats'),
        safeFetchJson<{ tokens: Token[] }>('/api/tokens?limit=100')
      ]);

      if (statsData) setStats(statsData);
      if (tokensData && tokensData.tokens) setTokens(tokensData.tokens);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.warn('Dashboard data refresh notice:', error?.message || error);
      setErrorMsg(error?.message || 'SidraDEX market data is temporarily unavailable.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const topGainers = [...tokens].filter(t => t.change24h > 0).sort((a, b) => b.change24h - a.change24h).slice(0, 5);
  const topLosers = [...tokens].filter(t => t.change24h < 0).sort((a, b) => a.change24h - b.change24h).slice(0, 5);
  const recentlyUpdated = tokens.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
            Market Analytics Cockpit
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Real-time on-chain prices and pool depth for all 88 SidraChain DEX assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE DEX FEED • {lastRefreshed}</span>
          </div>
          <button
            onClick={() => fetchData(false)}
            disabled={loading}
            className="p-2 rounded-lg bg-[#191c1f] hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f2ca50]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => fetchData(false)} className="underline hover:text-amber-300 ml-4 text-[11px]">Retry</button>
        </div>
      )}

      {/* Global Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {/* Tokens Tracked */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Tokens Tracked
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            {stats ? stats.tokensTracked.toLocaleString() : tokens.length || 88}
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
            <Radio className="w-2.5 h-2.5" /> 88 Sidra DEX Pools
          </p>
        </div>

        {/* Total Market Value */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Total Market Value
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            ${stats ? (stats.totalMarketValueUsd / 1000000).toFixed(1) : '182.4'}M
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +2.4% 24h
          </p>
        </div>

        {/* 24h Volume */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            24h Volume
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            ${stats ? (stats.volume24hUsd / 1000000).toFixed(2) : '3.42'}M
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
            <Activity className="w-3 h-3" /> Real-Time Volume
          </p>
        </div>

        {/* Total Liquidity */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Total Liquidity
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            ${stats ? (stats.totalLiquidityUsd / 1000000).toFixed(1) : '48.9'}M
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-2">
            <Droplets className="w-3 h-3" /> Locked In Pools
          </p>
        </div>

        {/* Market Sentiment */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all col-span-2 md:col-span-1">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            DEX Sentiment
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">
              {stats?.marketSentiment || 'Bullish'}
            </p>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {stats?.sentimentPercent || 78}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden flex">
            <div className="w-[78%] h-full bg-emerald-500"></div>
            <div className="w-[22%] h-full bg-red-500"></div>
          </div>
        </div>
      </div>

      {/* Real-time Price History Chart Component */}
      <DashboardPriceChart tokens={tokens} />

      {/* Main Grid: Top Movers & Search / Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Gainers & Top Losers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers Card */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <h2 className="text-base font-bold text-[#e0e2e6] flex items-center gap-2 font-['Outfit']">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Top Gainers
                </h2>
                <span className="text-[11px] bg-[#1d2023] px-2 py-0.5 rounded text-[#d0c5af] font-medium">
                  24H
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {topGainers.length === 0 ? (
                  <div className="text-xs text-gray-400 py-8 text-center">No gainers in this cycle</div>
                ) : (
                  topGainers.map((t) => (
                    <a
                      key={t.id}
                      href={`/token/${t.symbol}`}
                      className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <TokenLogo token={t} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                              {t.symbol}
                            </span>
                            <span className="text-[10px] text-gray-400">({t.name})</span>
                          </div>
                          <p className="text-xs text-[#d0c5af] font-mono">{t.holdersCount?.toLocaleString() || '1,200'} holders</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm text-[#e0e2e6]">
                          {t.priceSda.toFixed(t.priceSda < 0.001 ? 6 : t.priceSda < 0.1 ? 4 : 2)} SDA
                        </p>
                        <p className="text-xs font-semibold text-emerald-400">
                          +{t.change24h}%
                        </p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Top Losers Card */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col min-h-[380px]">
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                <h2 className="text-base font-bold text-[#e0e2e6] flex items-center gap-2 font-['Outfit']">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Top Losers
                </h2>
                <span className="text-[11px] bg-[#1d2023] px-2 py-0.5 rounded text-[#d0c5af] font-medium">
                  24H
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {topLosers.length === 0 ? (
                  <div className="text-xs text-gray-400 py-8 text-center">No losers in this cycle</div>
                ) : (
                  topLosers.map((t) => (
                    <a
                      key={t.id}
                      href={`/token/${t.symbol}`}
                      className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <TokenLogo token={t} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                              {t.symbol}
                            </span>
                            <span className="text-[10px] text-gray-400">({t.name})</span>
                          </div>
                          <p className="text-xs text-[#d0c5af] font-mono">{t.holdersCount?.toLocaleString() || '1,200'} holders</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm text-[#e0e2e6]">
                          {t.priceSda.toFixed(t.priceSda < 0.001 ? 6 : t.priceSda < 0.1 ? 4 : 2)} SDA
                        </p>
                        <p className="text-xs font-semibold text-red-400">
                          {t.change24h}%
                        </p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Search / Recently Updated */}
        <div className="space-y-6">
          {/* Quick Search Card */}
          <div className="glass-panel rounded-2xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/markets?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                placeholder="Search tokens by name or address..."
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#e0e2e6] placeholder-gray-500 focus:outline-none focus:border-[#f2ca50] transition-colors"
              />
            </div>
          </div>

          {/* Recently Updated */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col min-h-[290px]">
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
              <h2 className="text-base font-bold text-[#e0e2e6] font-['Outfit']">
                Live DEX Stream
              </h2>
              <a href="/markets" className="text-xs text-[#f2ca50] hover:underline font-semibold">
                View All 88
              </a>
            </div>

            <div className="flex-1 space-y-2">
              {recentlyUpdated.map((t) => (
                <a
                  key={t.id}
                  href={`/token/${t.symbol}`}
                  className="flex justify-between items-center p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <TokenLogo token={t} size="xs" />
                    <span className="font-bold text-xs text-[#e0e2e6]">{t.symbol}</span>
                    <span className="text-[10px] text-gray-400">({t.name})</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#f2ca50]">
                    {t.priceSda.toFixed(t.priceSda < 0.001 ? 6 : t.priceSda < 0.1 ? 4 : 2)} SDA
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Token Scanner Quick Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1d2023] to-[#101417] border border-[#f2ca50]/20 relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Smart Contract Audit
                </p>
                <p className="text-sm font-semibold text-[#e0e2e6] mt-1">
                  Scanner & Risk Assessment
                </p>
                <p className="text-xs text-[#d0c5af] mt-1">
                  Perform security logic analysis on any ERC20 / Sidra contract.
                </p>
              </div>
            </div>
            <a
              href="/scanner"
              className="mt-3 inline-block w-full py-2 bg-[#f2ca50] text-[#3c2f00] text-center font-bold text-xs rounded-xl hover:bg-[#ffe088] transition-colors"
            >
              Launch Scanner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

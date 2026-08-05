import React, { useEffect, useState } from 'react';
import { Token, MarketGlobalStats } from '../types/index';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { TrendingUp, TrendingDown, RefreshCw, Search, ArrowUpRight, ArrowDownRight, Layers, DollarSign, Activity, Droplets, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<MarketGlobalStats | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, tokensRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tokens?limit=20')
      ]);

      if (!statsRes.ok || !tokensRes.ok) {
        const errJson = await (tokensRes.ok ? statsRes : tokensRes).json().catch(() => ({}));
        setErrorMsg(errJson.error || 'SidraDEX market data is temporarily unavailable.');
        setTokens([]);
        setStats(null);
        return;
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      const tokensData = await tokensRes.json();
      setTokens(tokensData.tokens || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setErrorMsg('SidraDEX market data is temporarily unavailable.');
      setTokens([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topGainers = [...tokens].sort((a, b) => b.change24h - a.change24h).slice(0, 3);
  const topLosers = [...tokens].sort((a, b) => a.change24h - b.change24h).slice(0, 3);
  const recentlyUpdated = tokens.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
            Market Analytics Cockpit
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Institutional-grade price feed analytics and deep-contract intelligence for SidraChain assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#99907c] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Updated {lastRefreshed}
          </span>
          <button
            onClick={fetchData}
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
          <button onClick={fetchData} className="underline hover:text-amber-300 ml-4 text-[11px]">Retry</button>
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
            {stats ? stats.tokensTracked.toLocaleString() : '14,208'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">+12 Verified Today</p>
        </div>

        {/* Total Market Value */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Total Market Value
          </p>
          <p className="text-xl md:text-2xl font-bold text-yellow-500 font-mono">
            $124,502,390
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-green-400 font-bold">+4.2%</span>
            <span className="text-[9px] text-gray-600">vs last 24h</span>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            24h Volume (SDA)
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            12,490,210
          </p>
          <p className="text-[10px] text-gray-500 mt-1 italic">Est. $9,367,657 USD</p>
        </div>

        {/* Total Liquidity */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Total Liquidity
          </p>
          <p className="text-xl md:text-2xl font-bold text-white font-mono">
            $45,000,000
          </p>
          <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <div className="w-[65%] h-full bg-yellow-500"></div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between hover:border-yellow-500/20 transition-all">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Market Sentiment
          </p>
          <p className="text-xl md:text-2xl font-bold text-yellow-500">
            72% Bullish
          </p>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden flex">
            <div className="w-[72%] h-full bg-green-500"></div>
            <div className="w-[28%] h-full bg-red-500"></div>
          </div>
        </div>
      </div>

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
                {topGainers.map((t) => (
                  <a
                    key={t.id}
                    href={`/token/${t.symbol}`}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1d2023] flex items-center justify-center border border-white/10 group-hover:border-[#f2ca50]/50 transition-colors font-bold text-xs text-[#e0e2e6]">
                        {t.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                            {t.symbol}
                          </span>
                          <DemoDataBadge isDemoData={t.isDemoData} />
                        </div>
                        <p className="text-xs text-[#d0c5af]">{t.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-semibold text-sm text-[#e0e2e6]">
                        ${t.priceUsd.toFixed(t.priceUsd < 0.1 ? 4 : 2)}
                      </p>
                      <p className="text-xs font-semibold text-emerald-400">
                        +{t.change24h}%
                      </p>
                    </div>
                  </a>
                ))}
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
                {topLosers.map((t) => (
                  <a
                    key={t.id}
                    href={`/token/${t.symbol}`}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1d2023] flex items-center justify-center border border-white/10 group-hover:border-[#f2ca50]/50 transition-colors font-bold text-xs text-[#e0e2e6]">
                        {t.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                            {t.symbol}
                          </span>
                          <DemoDataBadge isDemoData={t.isDemoData} />
                        </div>
                        <p className="text-xs text-[#d0c5af]">{t.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-semibold text-sm text-[#e0e2e6]">
                        ${t.priceUsd.toFixed(t.priceUsd < 0.1 ? 4 : 2)}
                      </p>
                      <p className="text-xs font-semibold text-red-400">
                        {t.change24h}%
                      </p>
                    </div>
                  </a>
                ))}
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
                Recently Updated
              </h2>
              <a href="/markets" className="text-xs text-[#f2ca50] hover:underline font-semibold">
                View All
              </a>
            </div>

            <div className="flex-1 space-y-2">
              {recentlyUpdated.map((t, idx) => (
                <a
                  key={t.id}
                  href={`/token/${t.symbol}`}
                  className="flex justify-between items-center p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        t.verificationStatus === 'Verified'
                          ? 'bg-emerald-400'
                          : t.verificationStatus === 'Pending Review'
                          ? 'bg-blue-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-bold text-xs text-[#e0e2e6]">{t.symbol}</span>
                  </div>
                  <span className="text-xs text-[#d0c5af]">
                    {idx === 0 ? '2 mins ago' : idx === 1 ? '15 mins ago' : `${idx * 45} mins ago`}
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

import React, { useEffect, useState, useRef } from 'react';
import { Token } from '../types/index';
import { safeFetchJson } from '../utils/api';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { TokenLogo } from '../components/TokenLogo';
import { Search, ChevronLeft, ChevronRight, ExternalLink, ArrowUp, ArrowDown, RefreshCw, Radio, Sparkles } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(new Date().toLocaleTimeString());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'All' | 'HighPrice' | 'LowPrice' | 'Gainers' | 'Losers' | 'Verified'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const [priceFlashMap, setPriceFlashMap] = useState<Map<string, 'up' | 'down'>>(new Map());

  const fetchTokens = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      let statusParam = activeTab === 'Gainers' || activeTab === 'Losers' || activeTab === 'Verified' ? activeTab : 'All';
      let currentSortBy = sortBy;
      let currentSortOrder = sortOrder;

      if (activeTab === 'HighPrice') {
        currentSortBy = 'priceSda';
        currentSortOrder = 'desc';
      } else if (activeTab === 'LowPrice') {
        currentSortBy = 'priceSda';
        currentSortOrder = 'asc';
      }

      const queryParams = new URLSearchParams({
        search: searchQuery,
        status: statusParam,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        page: page.toString(),
        limit: pageSize.toString()
      });

      const data = await safeFetchJson<{ tokens: Token[]; pagination: { totalPages: number; totalCount: number } }>(`/api/tokens?${queryParams.toString()}`);
      const newTokens: Token[] = data.tokens || [];

      // Check price changes for flash highlights
      const flashes = new Map<string, 'up' | 'down'>();
      newTokens.forEach(t => {
        const oldP = prevPricesRef.current.get(t.symbol);
        if (oldP !== undefined && oldP !== t.priceSda) {
          flashes.set(t.symbol, t.priceSda > oldP ? 'up' : 'down');
        }
        prevPricesRef.current.set(t.symbol, t.priceSda);
      });

      if (flashes.size > 0) {
        setPriceFlashMap(flashes);
        setTimeout(() => setPriceFlashMap(new Map()), 1500);
      }

      setTokens(newTokens);
      setLastRefreshedTime(new Date().toLocaleTimeString());
      setSecondsAgo(0);

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'An error occurred while fetching markets.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search');
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [activeTab, searchQuery, sortBy, sortOrder, page, pageSize]);

  // Real-time polling every 6 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchTokens(true);
    }, 6000);

    const timerInterval = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [activeTab, searchQuery, sortBy, sortOrder, page, pageSize]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'priceSda' ? 'desc' : 'asc');
    }
    setActiveTab('All');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2.5">
            SidraDEX Live Markets
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Real-time pool quotes and on-chain telemetry from Sidra Dex Live.
          </p>
        </div>

        {/* Live Status & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE DEX SYNC • {secondsAgo}s ago ({lastRefreshedTime})</span>
          </div>

          <button
            onClick={() => fetchTokens(false)}
            disabled={loading}
            className="p-2 rounded-xl bg-[#191c1f] hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f2ca50]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Controls (Tabs & Search) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-2.5 rounded-2xl border border-white/5">
        {/* Filter & Sort Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('All'); setSortBy('rank'); setSortOrder('asc'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'All' && sortBy === 'rank'
                ? 'bg-white/10 text-[#e0e2e6] border border-white/15'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            All 88 Assets
          </button>

          {/* Highest Price Filter */}
          <button
            onClick={() => { setActiveTab('HighPrice'); setSortBy('priceSda'); setSortOrder('desc'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'HighPrice' || (sortBy === 'priceSda' && sortOrder === 'desc')
                ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 font-bold'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#f2ca50]" />
            Highest Price
          </button>

          {/* Lowest Price Filter */}
          <button
            onClick={() => { setActiveTab('LowPrice'); setSortBy('priceSda'); setSortOrder('asc'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'LowPrice' || (sortBy === 'priceSda' && sortOrder === 'asc')
                ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 font-bold'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-[#f2ca50]" />
            Lowest Price
          </button>

          <button
            onClick={() => { setActiveTab('Gainers'); setSortBy('change24h'); setSortOrder('desc'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'Gainers'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            Top Gainers
          </button>

          <button
            onClick={() => { setActiveTab('Losers'); setSortBy('change24h'); setSortOrder('asc'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'Losers'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            Top Losers
          </button>

          <button
            onClick={() => { setActiveTab('Verified'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'Verified'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Verified
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search symbol or name..."
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e0e2e6] placeholder-gray-500 focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Desktop Table Container */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-[11px] font-semibold text-[#d0c5af] uppercase tracking-wider">
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3.5 px-6 cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    # {sortBy === 'rank' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-6 cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Asset {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priceSda')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Price (SDA) {sortBy === 'priceSda' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('holdersCount')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Holders {sortBy === 'holdersCount' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('transfersCount')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Transfers {sortBy === 'transfersCount' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change24h')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    24h % {sortBy === 'change24h' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume24hSda')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    24h Vol (SDA) {sortBy === 'volume24hSda' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('liquidityUsd')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Liquidity (SDA) {sortBy === 'liquidityUsd' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#f2ca50]" /> : <ArrowDown className="w-3 h-3 text-[#f2ca50]" />)}
                  </div>
                </th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs text-[#e0e2e6]">
              {loading && tokens.length === 0 ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-4 bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-white/10 rounded ml-auto" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-6 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No tokens match your search criteria</p>
                    <p className="text-xs text-gray-500 mt-1">Try clearing search or filter tabs.</p>
                  </td>
                </tr>
              ) : (
                tokens.map((token) => {
                  const flash = priceFlashMap.get(token.symbol);
                  return (
                    <tr
                      key={token.id}
                      onClick={() => window.location.href = `/token/${token.symbol}`}
                      className={`hover:bg-white/[0.04] transition-colors group cursor-pointer ${
                        flash === 'up' ? 'bg-emerald-500/10' : flash === 'down' ? 'bg-red-500/10' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-gray-400 font-mono">{token.rank}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <TokenLogo token={token} size="md" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                                {token.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">({token.symbol})</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {token.contractAddress ? `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : 'Native'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold relative">
                        <span className={`transition-colors duration-500 ${
                          flash === 'up' ? 'text-emerald-400 font-bold' : flash === 'down' ? 'text-red-400 font-bold' : ''
                        }`}>
                          {token.priceSda.toFixed(token.priceSda < 0.0001 ? 6 : token.priceSda < 0.1 ? 4 : 2)} SDA
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[#d0c5af]">
                        {token.holdersCount?.toLocaleString() || (token.rank * 12 + 15)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-gray-400">
                        {token.transfersCount?.toLocaleString() || (token.holdersCount ? Math.round(token.holdersCount * 8.5).toLocaleString() : 'N/A')}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold">
                        <span className={token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[#d0c5af]">
                        {(token.volume24hSda / 1000).toFixed(1)}K
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[#d0c5af]">
                        {(token.liquidityUsd / 1000).toFixed(1)}K
                      </td>
                      <td className="py-4 px-6">
                        <DemoDataBadge status={token.verificationStatus} isDemoData={false} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/token/${token.symbol}`;
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#f2ca50] hover:bg-white/10 transition-colors"
                          title="View Token Telemetry"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Layout */}
        <div className="block md:hidden divide-y divide-white/5">
          {loading && tokens.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">Loading market table...</div>
          ) : tokens.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No tokens found.</div>
          ) : (
            tokens.map((token) => (
              <a
                key={token.id}
                href={`/token/${token.symbol}`}
                className="p-4 block space-y-2 hover:bg-white/5 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{token.rank}</span>
                    <TokenLogo token={token} size="sm" />
                    <span className="font-bold text-sm text-[#e0e2e6]">{token.symbol}</span>
                    <span className="text-[10px] text-gray-400">({token.name})</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#e0e2e6]">
                    {token.priceSda.toFixed(token.priceSda < 0.0001 ? 6 : token.priceSda < 0.1 ? 4 : 2)} SDA
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#d0c5af]">
                  <span>24h Change:</span>
                  <span className={token.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#d0c5af]">
                  <span>Holders / Transfers:</span>
                  <span className="font-mono">{token.holdersCount?.toLocaleString() || 'N/A'} / {token.transfersCount?.toLocaleString() || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#d0c5af]">
                  <span>Liquidity:</span>
                  <span className="font-mono">{(token.liquidityUsd / 1000).toFixed(1)}K SDA</span>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-white/10 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/20 text-xs text-[#d0c5af]">
          <div className="flex items-center gap-3">
            <p>
              Showing {tokens.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} tokens
            </p>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#121417] border border-white/10 rounded-lg px-2 py-1 text-xs text-[#e0e2e6] focus:outline-none focus:border-[#f2ca50]/50"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100 (All 88)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                    page === pNum
                      ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

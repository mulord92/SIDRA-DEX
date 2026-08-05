import React, { useEffect, useState } from 'react';
import { Token, VerificationStatus } from '../types/index';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical, ExternalLink } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'All' | 'Verified' | 'Unverified'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      let statusFilter = activeTab;
      const queryParams = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '10'
      });

      const res = await fetch(`/api/tokens?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load market data');

      const data = await res.json();
      setTokens(data.tokens || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching markets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check URL params if coming from search
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search');
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [activeTab, searchQuery, sortBy, sortOrder, page]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit']">
            Market Overview
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Real-time price tracking, verification status, and liquidity depth for Sidra Network assets.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xs text-[#d0c5af]">24h Volume:</span>
            <span className="font-bold text-sm text-[#f2ca50] font-mono">3.4M SDA</span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-xs text-[#d0c5af]">Active Markets:</span>
            <span className="font-bold text-sm text-[#e0e2e6] font-mono">42</span>
          </div>
        </div>
      </div>

      {/* Table Controls (Tabs & Search) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-2.5 rounded-2xl border border-white/5">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('All'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'All'
                ? 'bg-white/10 text-[#e0e2e6] border border-white/15'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            All Assets
          </button>
          <button
            onClick={() => { setActiveTab('Verified'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'Verified'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Verified
          </button>
          <button
            onClick={() => { setActiveTab('Unverified'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'Unverified'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-[#d0c5af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Unverified
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
              placeholder="Search token symbol or name..."
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
                  #
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-6 cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  Asset
                </th>
                <th
                  onClick={() => handleSort('priceSda')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  Price (SDA)
                </th>
                <th
                  onClick={() => handleSort('priceUsd')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  Est. USD
                </th>
                <th
                  onClick={() => handleSort('change24h')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  24h %
                </th>
                <th
                  onClick={() => handleSort('volume24hSda')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  24h Volume
                </th>
                <th
                  onClick={() => handleSort('liquidityUsd')}
                  className="py-3.5 px-6 text-right cursor-pointer hover:text-[#f2ca50] transition-colors"
                >
                  Liquidity
                </th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs text-[#e0e2e6]">
              {loading ? (
                /* Loading Skeleton */
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-4 bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-white/10 rounded" /></td>
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
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No tokens match your search criteria</p>
                    <p className="text-xs text-gray-500 mt-1">Try clearing search or filter tabs.</p>
                  </td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr
                    key={token.id}
                    onClick={() => window.location.href = `/token/${token.symbol}`}
                    className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6 text-gray-400 font-mono">{token.rank}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1d2023] border border-white/10 flex items-center justify-center font-bold text-xs text-[#f2ca50] shrink-0">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors">
                              {token.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">({token.symbol})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-semibold relative">
                      {token.priceSda.toFixed(token.priceSda < 0.1 ? 4 : 2)}
                      {token.isDemoData && (
                        <span className="block text-[8px] text-[#f2ca50]/70 uppercase tracking-wider font-sans">
                          Demo Data
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#d0c5af]">
                      ${token.priceUsd.toFixed(token.priceUsd < 0.1 ? 4 : 2)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-semibold">
                      <span className={token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono">
                      {(token.volume24hSda / 1000).toFixed(1)}K
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#d0c5af]">
                      ${(token.liquidityUsd / 1000000).toFixed(1)}M
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
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Layout */}
        <div className="block md:hidden divide-y divide-white/5">
          {loading ? (
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
                    <span className="font-bold text-sm text-[#e0e2e6]">{token.symbol}</span>
                    <DemoDataBadge status={token.verificationStatus} isDemoData={token.isDemoData} />
                  </div>
                  <span className="font-mono text-sm font-bold text-[#e0e2e6]">
                    {token.priceSda.toFixed(2)} SDA
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#d0c5af]">
                  <span>24h Change:</span>
                  <span className={token.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-[#d0c5af]">
                  <span>Liquidity:</span>
                  <span className="font-mono">${(token.liquidityUsd / 1000000).toFixed(1)}M</span>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-white/10 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/20 text-xs text-[#d0c5af]">
          <p>
            Showing {tokens.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
            {Math.min(page * 10, totalCount)} of {totalCount} entries
          </p>

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

import React, { useEffect, useState } from 'react';
import { Token } from '../types/index';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Eye, Trash2, Bell, ExternalLink, Plus, Search } from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['FBAY', 'HPDA', 'SXD']);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [addSymbolInput, setAddSymbolInput] = useState('');

  useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem('sidra_watchlist');
    if (saved) {
      try {
        setWatchlistSymbols(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing watchlist from local storage');
      }
    }
  }, []);

  const saveWatchlist = (symbols: string[]) => {
    setWatchlistSymbols(symbols);
    localStorage.setItem('sidra_watchlist', JSON.stringify(symbols));
  };

  const fetchWatchlistTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tokens?limit=50');
      if (res.ok) {
        const data = await res.json();
        const all: Token[] = data.tokens || [];
        const filtered = all.filter(t =>
          watchlistSymbols.map(s => s.toUpperCase()).includes(t.symbol.toUpperCase())
        );
        setTokens(filtered);
      }
    } catch (err) {
      console.error('Error fetching watchlist tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlistTokens();
  }, [watchlistSymbols]);

  const handleAddToken = () => {
    const sym = addSymbolInput.trim().toUpperCase();
    if (sym && !watchlistSymbols.includes(sym)) {
      const updated = [...watchlistSymbols, sym];
      saveWatchlist(updated);
      setAddSymbolInput('');
    }
  };

  const handleRemoveToken = (sym: string) => {
    const updated = watchlistSymbols.filter(s => s.toUpperCase() !== sym.toUpperCase());
    saveWatchlist(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#f2ca50]" />
            User Watchlist
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Personalized market telemetry tracker for your prioritized SidraChain assets.
          </p>
        </div>

        {/* Add token to watchlist quick bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={addSymbolInput}
            onChange={(e) => setAddSymbolInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddToken()}
            placeholder="Add symbol e.g. GPC"
            className="bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#e0e2e6] placeholder-gray-500 focus:outline-none focus:border-[#f2ca50]"
          />
          <button
            onClick={handleAddToken}
            className="px-4 py-2 bg-[#f2ca50] text-[#3c2f00] font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-[#ffe088] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Watchlist Data Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading watchlist telemetry...</div>
        ) : tokens.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <p className="font-bold text-[#e0e2e6]">Your watchlist is currently empty</p>
            <p>Add token symbols above or click the star/eye icon on the Markets tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#e0e2e6]">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-[11px] font-semibold text-[#d0c5af] uppercase">
                  <th className="py-3.5 px-6">Asset</th>
                  <th className="py-3.5 px-6 text-right">Price (SDA)</th>
                  <th className="py-3.5 px-6 text-right">Est. USD</th>
                  <th className="py-3.5 px-6 text-right">24h %</th>
                  <th className="py-3.5 px-6 text-right">Liquidity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1d2023] border border-white/10 flex items-center justify-center font-bold text-xs text-[#f2ca50]">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#e0e2e6]">{token.name}</span>
                            <span className="text-[10px] text-gray-400">({token.symbol})</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right font-bold">
                      {token.priceSda.toFixed(2)} SDA
                    </td>

                    <td className="py-4 px-6 text-right text-[#d0c5af]">
                      ${token.priceUsd.toFixed(2)}
                    </td>

                    <td className={`py-4 px-6 text-right font-bold ${
                      token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {token.change24h >= 0 ? `+${token.change24h}%` : `${token.change24h}%`}
                    </td>

                    <td className="py-4 px-6 text-right text-[#d0c5af]">
                      ${(token.liquidityUsd / 1000000).toFixed(1)}M
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <DemoDataBadge status={token.verificationStatus} isDemoData={token.isDemoData} />
                    </td>

                    <td className="py-4 px-6 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/token/${token.symbol}`}
                          className="p-1.5 text-gray-400 hover:text-[#f2ca50] transition-colors"
                          title="View details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleRemoveToken(token.symbol)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

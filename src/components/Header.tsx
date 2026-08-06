import React, { useState } from 'react';
import { Menu, Bell, Settings, CheckCircle, Search, ShieldCheck } from 'lucide-react';

interface Props {
  onToggleMobileMenu: () => void;
  activeProviderName?: string;
  onSearchSubmit?: (query: string) => void;
}

export const Header: React.FC<Props> = ({
  onToggleMobileMenu,
  activeProviderName = 'Sidra Demo Data Provider',
  onSearchSubmit
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearchSubmit) onSearchSubmit(searchQuery.trim());
      else window.location.href = `/markets?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-black/40 backdrop-blur-md border-b border-yellow-500/20 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo title */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="text-black font-black text-xl">S</span>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 leading-none">
              SIDRA SWAP WATCH
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">
              Market Analytics Dashboard
            </p>
          </div>
        </a>
      </div>

      {/* Global Quick Search Bar */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search tokens or address..."
          className="w-full bg-black/60 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Connection status indicator */}
        <div className="hidden md:flex items-center gap-2 bg-black/60 border border-yellow-500/30 rounded-full px-3 py-1 text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="font-mono text-[11px] text-gray-200">Sidra Mainnet</span>
          <span className="text-[10px] text-yellow-500 font-mono border-l border-white/10 pl-2">
            {activeProviderName.includes('Demo') ? 'Demo Sync' : 'Live Sync'}
          </span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-gray-300 hover:text-yellow-500 hover:bg-white/5 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-yellow-500/30 rounded-xl p-4 shadow-2xl z-50 text-xs backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                <span className="font-bold text-white">Market Telemetry & Alerts</span>
                <span className="text-[10px] text-yellow-500 font-mono">Live Feed</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between font-semibold text-green-400">
                    <span>FBAY price surge</span>
                    <span>2m ago</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">+14.2% in 24h on Sidra DEX pool.</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between font-semibold text-yellow-500">
                    <span>SDA Swap Watch</span>
                    <span>1h ago</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">Demo provider feed synced successfully.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Link */}
        <a
          href="/admin"
          className="p-2 rounded-full text-gray-300 hover:text-yellow-500 hover:bg-white/5 transition-colors"
          title="Admin Verification Portal"
        >
          <Settings className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
};

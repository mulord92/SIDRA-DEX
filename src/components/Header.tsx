import React, { useState, useEffect } from 'react';
import { Menu, Bell, Settings, Search, Smartphone, Zap, Sparkles, User as UserIcon, LogOut, Bookmark, ShieldAlert, LogIn, ChevronDown } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { UserSubscription } from '../types/index';
import { useAuth } from '../context/AuthContext';

interface Props {
  onToggleMobileMenu: () => void;
  activeProviderName?: string;
  onSearchSubmit?: (query: string) => void;
  onOpenAndroidModal?: () => void;
  onUpgradeClick?: () => void;
}

export const Header: React.FC<Props> = ({
  onToggleMobileMenu,
  activeProviderName = 'Sidra Dex Live (ledger.sidrachain.com)',
  onSearchSubmit,
  onOpenAndroidModal,
  onUpgradeClick
}) => {
  const { user, openAuthModal, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sub, setSub] = useState<UserSubscription>(subscriptionService.getSubscription());

  useEffect(() => {
    return subscriptionService.subscribe((currentSub) => {
      setSub(currentSub);
    });
  }, []);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearchSubmit) onSearchSubmit(searchQuery.trim());
      else window.location.href = `/markets?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    if (user?.isAnonymous) return 'GU';
    return 'U';
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-600/30 via-yellow-500/20 to-black/60 p-1 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(242,202,80,0.25)] group-hover:border-yellow-400 group-hover:scale-105 transition-all">
            <img src="/app-logo.png" alt="Sidra Swap Watch Logo" className="w-full h-full object-contain" />
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
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="font-mono text-[11px] text-gray-200">Sidra Mainnet</span>
          <span className="text-[10px] text-yellow-500 font-mono border-l border-white/10 pl-2">
            Ledger Sync
          </span>
        </div>

        {/* Upgrade / Active Plan Badge */}
        {sub.plan === 'free' ? (
          <button
            onClick={onUpgradeClick || (() => { window.location.href = '/pricing'; })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-[0_0_12px_rgba(242,202,80,0.3)] transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">Upgrade to Pro ($4.99)</span>
            <span className="sm:hidden">Pro</span>
          </button>
        ) : (
          <a
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="uppercase">{sub.plan} Alpha</span>
          </a>
        )}

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
                <span className="font-bold text-white">Market Insights & Alerts</span>
                <span className="text-[10px] text-yellow-500 font-mono">Live On-Chain Feed</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between font-semibold text-green-400">
                    <span>FBAY liquidity update</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">Real-time quote synced from ledger.sidrachain.com.</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between font-semibold text-yellow-500">
                    <span>Ledger.sidrachain.com Sync</span>
                    <span>1m ago</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">Sidra Chain on-chain DEX order flow and liquidity pools active.</p>
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

        {/* Android App Button */}
        {onOpenAndroidModal && (
          <button
            onClick={onOpenAndroidModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/10 hover:from-yellow-500/30 hover:to-amber-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-xs transition-all shadow-[0_0_15px_rgba(242,202,80,0.15)]"
          >
            <Smartphone className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="hidden sm:inline">Android App</span>
          </button>
        )}

        {/* User Auth Profile / Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 border border-yellow-500/30 hover:border-yellow-500/60 transition-all text-xs"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="w-6 h-6 rounded-full object-cover border border-yellow-500/40" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-400 text-black font-extrabold text-[10px] flex items-center justify-center">
                  {getUserInitials()}
                </div>
              )}
              <span className="hidden md:inline max-w-[100px] truncate font-semibold text-gray-200">
                {user.displayName || (user.isAnonymous ? 'Guest User' : user.email?.split('@')[0])}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0b1329] border border-yellow-500/30 rounded-2xl p-3 shadow-2xl z-50 text-xs backdrop-blur-xl space-y-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="font-bold text-white truncate">{user.displayName || (user.isAnonymous ? 'Guest Account' : 'Authenticated User')}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email || 'Anonymous Guest'}</p>
                  {user.isAnonymous && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/20 text-yellow-300 font-semibold uppercase">
                      Guest Mode
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <a
                    href="/watchlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bookmark className="w-4 h-4 text-yellow-400" />
                    <span>My Watchlist</span>
                  </a>
                  <a
                    href="/alerts"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>Custom Price Alerts</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('signin')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold text-xs transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

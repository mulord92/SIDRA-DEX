import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Coins,
  Radar,
  Calculator,
  Eye,
  BellRing,
  Info,
  ShieldCheck,
  Zap,
  Settings,
  HelpCircle,
  X,
  Smartphone
} from 'lucide-react';

interface Props {
  activePath: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onUpgradeClick?: () => void;
  onOpenAndroidModal?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activePath,
  isOpenMobile,
  onCloseMobile,
  onUpgradeClick,
  onOpenAndroidModal
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Markets', path: '/markets', icon: TrendingUp },
    { label: 'Token Details', path: '/token/FBAY', icon: Coins },
    { label: 'Scanner', path: '/scanner', icon: Radar },
    { label: 'Calculator', path: '/calculator', icon: Calculator },
    { label: 'Watchlist', path: '/watchlist', icon: Eye },
    { label: 'Alerts', path: '/alerts', icon: BellRing },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Admin', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-black/60 backdrop-blur-md border-r border-white/5 flex flex-col pt-4 pb-6 px-3 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-3 mb-4 md:hidden">
          <span className="font-bold text-yellow-500 text-sm">SIDRA SWAP WATCH</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Terminal Access Profile Banner */}
        <div className="px-3 mb-6">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
                alt="Terminal Access"
                className="w-10 h-10 rounded-full border border-yellow-500/40 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
            <div>
              <p className="font-bold text-sm text-yellow-400 leading-tight font-sans tracking-wide">
                SIDRA DEX
              </p>
              <p className="text-[9px] text-gray-300 tracking-wider uppercase font-semibold leading-tight mt-0.5">
                THE NEXT ERA OF DECENTRALIZED TRADING
              </p>
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));

            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-500 border-r-2 border-yellow-500 font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Upgrade & Footer Links */}
        <div className="pt-4 border-t border-white/5 space-y-3 px-1">
          <button
            onClick={onUpgradeClick}
            className="w-full py-2.5 px-3 bg-black/40 text-yellow-500 border border-yellow-500/30 rounded-xl font-semibold text-xs hover:bg-yellow-500/10 transition-colors flex items-center justify-center gap-2 group shadow-[0_0_10px_rgba(212,175,55,0.15)]"
          >
            <Zap className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span>Upgrade to Pro</span>
          </button>

          {onOpenAndroidModal && (
            <button
              onClick={onOpenAndroidModal}
              className="w-full py-2 px-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold text-xs hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-yellow-400" />
              <span>Install Android App</span>
            </button>
          )}

          <div className="space-y-1">
            <a
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#d0c5af] hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Settings</span>
            </a>
            <a
              href="/about"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#d0c5af] hover:bg-white/5 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Support & Docs</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

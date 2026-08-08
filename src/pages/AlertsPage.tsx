import React, { useEffect, useState } from 'react';
import { SmartAlertRule, SmartAlertType, PriceAlert } from '../types/index';
import { subscriptionService } from '../services/subscriptionService';
import { safeFetchJson } from '../utils/api';
import { PricingModal } from '../components/PricingModal';
import {
  BellRing,
  Plus,
  Trash2,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity,
  Flame,
  Fish,
  Droplet,
  Sparkles,
  Lock,
  Radio,
  Sliders
} from 'lucide-react';

const DEFAULT_RULES: SmartAlertRule[] = [
  {
    id: 'sa-1',
    tokenSymbol: 'FBAY',
    type: 'PERCENT_MOVEMENT',
    thresholdValue: '+5% in 1 Hour',
    direction: 'ABOVE',
    tierRequired: 'pro',
    isActive: true,
    createdAt: new Date().toISOString(),
    channel: 'In-App'
  },
  {
    id: 'sa-2',
    tokenSymbol: 'WPX',
    type: 'VOLUME_SPIKE',
    thresholdValue: '> 250% 24h Avg Volume',
    direction: 'ANY',
    tierRequired: 'pro',
    isActive: true,
    createdAt: new Date().toISOString(),
    channel: 'In-App'
  },
  {
    id: 'sa-3',
    tokenSymbol: 'GLNS',
    type: 'WHALE_ACTIVITY',
    thresholdValue: '> $100,000 USD Single Buy',
    direction: 'ABOVE',
    tierRequired: 'elite',
    isActive: true,
    createdAt: new Date().toISOString(),
    channel: 'Webhook'
  },
  {
    id: 'sa-4',
    tokenSymbol: 'SDA',
    type: 'NEW_ATH_ATL',
    thresholdValue: 'Breakout All-Time High',
    direction: 'ABOVE',
    tierRequired: 'pro',
    isActive: true,
    createdAt: new Date().toISOString(),
    channel: 'Email'
  }
];

export const AlertsPage: React.FC = () => {
  const [subscription, setSubscription] = useState(subscriptionService.getSubscription());
  const [smartRules, setSmartRules] = useState<SmartAlertRule[]>(DEFAULT_RULES);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  // Form states for all 7 alert types
  const [selectedToken, setSelectedToken] = useState('FBAY');
  const [alertType, setAlertType] = useState<SmartAlertType>('PRICE_TARGET');
  const [thresholdVal, setThresholdVal] = useState('50');
  const [channel, setChannel] = useState<'In-App' | 'Email' | 'Webhook'>('In-App');

  useEffect(() => {
    return subscriptionService.subscribe((sub) => {
      setSubscription(sub);
    });
  }, []);

  const handleCreateSmartAlert = (e: React.FormEvent) => {
    e.preventDefault();

    // Check tier limits for free users
    if (subscription.plan === 'free' && smartRules.length >= 1) {
      setPricingOpen(true);
      return;
    }

    const newRule: SmartAlertRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      tokenSymbol: selectedToken,
      type: alertType,
      thresholdValue: thresholdVal,
      direction: 'ABOVE',
      tierRequired: alertType === 'WHALE_ACTIVITY' || alertType === 'LIQUIDITY_CHANGE' ? 'elite' : 'pro',
      isActive: true,
      createdAt: new Date().toISOString(),
      channel
    };

    setSmartRules([newRule, ...smartRules]);
    setShowModal(false);
  };

  const handleDeleteRule = (id: string) => {
    setSmartRules(smartRules.filter((r) => r.id !== id));
  };

  const getAlertIcon = (type: SmartAlertType) => {
    switch (type) {
      case 'PRICE_TARGET':
        return <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />;
      case 'PERCENT_MOVEMENT':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'VOLUME_SPIKE':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'LIQUIDITY_CHANGE':
        return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case 'NEW_ATH_ATL':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'TOP_GAINER_ENTRY':
        return <Flame className="w-3.5 h-3.5 text-yellow-400" />;
      case 'WHALE_ACTIVITY':
        return <Fish className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <BellRing className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const getAlertTitle = (type: SmartAlertType) => {
    switch (type) {
      case 'PRICE_TARGET':
        return 'Price Reaches Target';
      case 'PERCENT_MOVEMENT':
        return '% Price Volatility Movement';
      case 'VOLUME_SPIKE':
        return 'Sudden Volume Spike';
      case 'LIQUIDITY_CHANGE':
        return 'DEX Liquidity Pool Injection/Drain';
      case 'NEW_ATH_ATL':
        return 'New All-Time High / Low';
      case 'TOP_GAINER_ENTRY':
        return 'Enters Top Gainers Leaderboard';
      case 'WHALE_ACTIVITY':
        return 'Large Wallet / Whale Accumulation';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <BellRing className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Outfit']">
              Institutional Smart Alerts
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-300 mt-1">
            Real-time on-chain volatility triggers: Price targets, % swings, volume spikes, ATH breakouts, and whale flows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {subscription.plan === 'free' && (
            <button
              onClick={() => setPricingOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold text-xs flex items-center gap-1.5 hover:bg-yellow-500/30 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-yellow-400" /> Unlock Unlimited (15+ Alerts)
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(242,202,80,0.25)]"
          >
            <Plus className="w-4 h-4" /> Create Smart Alert
          </button>
        </div>
      </div>

      {/* 7 Supported Smart Alert Categories Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Price Reaches Target', sub: 'Fixed SDA or USD point', icon: ArrowUpRight, color: 'text-yellow-400' },
          { label: '% Price Movement', sub: 'Instant 1h/24h swing', icon: Activity, color: 'text-emerald-400' },
          { label: 'Volume Spikes', sub: '>200% sudden influx', icon: Flame, color: 'text-orange-400' },
          { label: 'Liquidity Changes', sub: 'LP addition or drain', icon: Droplet, color: 'text-cyan-400' },
          { label: 'New ATH / ATL', sub: 'Breakout records', icon: Sparkles, color: 'text-purple-400' },
          { label: 'Top Gainers Entry', sub: 'Momentum alert', icon: Flame, color: 'text-yellow-400' },
          { label: 'Whale Activity', sub: 'Large wallet swaps', icon: Fish, color: 'text-purple-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel rounded-xl p-3 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.label}</span>
              </div>
              <p className="text-[10px] text-gray-400">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-['Outfit']">Active Volatility Triggers</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              {smartRules.length} Active / {subscription.plan === 'free' ? '1 Free Limit' : 'Unlimited'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-gray-200">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold text-gray-400 uppercase">
                <th className="py-3.5 px-5">Asset</th>
                <th className="py-3.5 px-5">Trigger Condition</th>
                <th className="py-3.5 px-5">Threshold Criteria</th>
                <th className="py-3.5 px-5">Notification Channel</th>
                <th className="py-3.5 px-5">Tier Required</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {smartRules.map((rule, idx) => (
                <tr key={`${rule.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5 font-bold font-sans text-sm text-white">
                    <a href={`/token/${rule.tokenSymbol}`} className="hover:text-yellow-400">
                      {rule.tokenSymbol}
                    </a>
                  </td>
                  <td className="py-4 px-5 font-sans">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-200 font-medium">
                      {getAlertIcon(rule.type)}
                      <span>{getAlertTitle(rule.type)}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-yellow-400">
                    {rule.thresholdValue}
                  </td>
                  <td className="py-4 px-5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] text-gray-300">
                      {rule.channel}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      rule.tierRequired === 'elite' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {rule.tierRequired}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-sans">
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Armed & Watching
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-sans">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Alert Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for all 7 Smart Alert Types */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#101417] border border-yellow-500/40 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <BellRing className="w-5 h-5 text-yellow-500" />
              Configure Smart Volatility Alert
            </h3>

            <form onSubmit={handleCreateSmartAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Select Token Symbol</label>
                <input
                  type="text"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value.toUpperCase())}
                  placeholder="FBAY, WPX, GLNS, SDA..."
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Smart Alert Event Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as SmartAlertType)}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-yellow-500 outline-none"
                >
                  <option value="PRICE_TARGET">1. Price Reaches Target (SDA / USD)</option>
                  <option value="PERCENT_MOVEMENT">2. % Price Movement (e.g. ±5% in 1 Hour)</option>
                  <option value="VOLUME_SPIKE">3. Sudden Volume Spike (&gt;200% Surge)</option>
                  <option value="LIQUIDITY_CHANGE">4. Liquidity Change (LP Added or Removed)</option>
                  <option value="NEW_ATH_ATL">5. New All-Time High or All-Time Low</option>
                  <option value="TOP_GAINER_ENTRY">6. Token Enters Top Gainers Leaderboard</option>
                  <option value="WHALE_ACTIVITY">7. Large Transaction / Whale Activity ($50K+)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Threshold / Trigger Condition</label>
                <input
                  type="text"
                  value={thresholdVal}
                  onChange={(e) => setThresholdVal(e.target.value)}
                  placeholder="e.g. 50 SDA, +10% 24h, >$50,000"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-yellow-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In-App', 'Email', 'Webhook'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        channel === ch ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};

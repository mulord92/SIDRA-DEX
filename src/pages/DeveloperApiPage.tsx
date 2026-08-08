import React, { useState } from 'react';
import { DeveloperApiKey } from '../types/index';
import { PricingModal } from '../components/PricingModal';
import {
  Code,
  Key,
  Copy,
  Check,
  Zap,
  Terminal,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';

const SAMPLE_KEYS: DeveloperApiKey[] = [
  {
    id: 'key-01',
    apiKey: 'ssw_live_948f12a84e930bc21199a41',
    planName: 'Pro Data API',
    monthlyPrice: 49,
    monthlyQuota: 100000,
    usedQuota: 14220,
    rateLimitPerSec: 25,
    createdAt: '2026-07-15',
    status: 'Active'
  }
];

export const DeveloperApiPage: React.FC = () => {
  const [keys, setKeys] = useState<DeveloperApiKey[]>(SAMPLE_KEYS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    const newKeyStr = `ssw_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const newKey: DeveloperApiKey = {
      id: `key-${Date.now()}`,
      apiKey: newKeyStr,
      planName: 'Developer Starter',
      monthlyPrice: 29,
      monthlyQuota: 50000,
      usedQuota: 0,
      rateLimitPerSec: 15,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setKeys([newKey, ...keys]);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Code className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Outfit']">
              Sidra Swap Watch API
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-300 mt-1">
            Programmatic institutional market feeds, liquidity depth, real-time swaps, and security scanner APIs ($29–$99/month).
          </p>
        </div>

        <button
          onClick={handleGenerateKey}
          className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(242,202,80,0.25)] transition-all"
        >
          <Key className="w-4 h-4" /> Generate New API Key
        </button>
      </div>

      {/* API Pricing Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-base font-['Outfit']">Developer Starter</h3>
          <div className="text-2xl font-extrabold text-white font-mono">$29 <span className="text-xs text-gray-400">/ mo</span></div>
          <p className="text-xs text-gray-400">Perfect for trading bots, notification scripts, and personal dashboards.</p>
          <ul className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
            <li>• 50,000 monthly queries</li>
            <li>• 15 req / second rate limit</li>
            <li>• Live price & market stats</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-yellow-500/40 bg-yellow-500/5 space-y-3 relative">
          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[9px] font-extrabold uppercase">
            Recommended
          </div>
          <h3 className="font-bold text-yellow-400 text-base font-['Outfit']">Pro Data API</h3>
          <div className="text-2xl font-extrabold text-white font-mono">$49 <span className="text-xs text-gray-400">/ mo</span></div>
          <p className="text-xs text-gray-300">For DEX aggregators, portfolio trackers, and automated market makers.</p>
          <ul className="text-xs text-gray-200 space-y-1.5 pt-2 border-t border-white/10">
            <li>• 250,000 monthly queries</li>
            <li>• 50 req / second rate limit</li>
            <li>• Whale tracker & smart alerts API</li>
            <li>• Full historical price archives</li>
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-purple-500/40 space-y-3">
          <h3 className="font-bold text-purple-400 text-base font-['Outfit']">Enterprise Feed</h3>
          <div className="text-2xl font-extrabold text-white font-mono">$99 <span className="text-xs text-gray-400">/ mo</span></div>
          <p className="text-xs text-gray-400">Institutional WebSocket stream with zero rate limits and dedicated SLA.</p>
          <ul className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
            <li>• Unlimited API requests</li>
            <li>• Sub-millisecond WebSocket feeds</li>
            <li>• Sidra Swap Watch AI stream</li>
            <li>• 24/7 Priority Discord & Telegram SLA</li>
          </ul>
        </div>
      </div>

      {/* Active API Keys Box */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Key className="w-4 h-4 text-yellow-500" />
          Active Developer Access Keys
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-200">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-gray-400 uppercase">
                <th className="py-2.5 px-4">Key Secret</th>
                <th className="py-2.5 px-4">Plan Tier</th>
                <th className="py-2.5 px-4 font-mono">Usage Quota</th>
                <th className="py-2.5 px-4">Rate Limit</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-yellow-400">
                    {k.apiKey.substring(0, 14)}••••••••{k.apiKey.substring(k.apiKey.length - 4)}
                  </td>
                  <td className="py-3 px-4 font-sans text-white">{k.planName}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {k.usedQuota.toLocaleString()} / {k.monthlyQuota.toLocaleString()} ({((k.usedQuota / k.monthlyQuota) * 100).toFixed(1)}%)
                  </td>
                  <td className="py-3 px-4 text-gray-400">{k.rateLimitPerSec} req/s</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => handleCopy(k.apiKey)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                      title="Copy API Key"
                    >
                      {copiedKey === k.apiKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Code Playground */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-yellow-500" /> cURL Live Request Example
          </span>
          <span className="text-[11px] text-gray-400 font-mono">GET /api/tokens/FBAY</span>
        </div>

        <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto">
{`curl -X GET "https://sidraswapwatch.app/api/tokens/FBAY" \\
  -H "Authorization: Bearer ${keys[0]?.apiKey || 'ssw_live_your_api_key'}" \\
  -H "Content-Type: application/json"`}
        </pre>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};

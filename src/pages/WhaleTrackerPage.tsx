import React, { useState, useEffect } from 'react';
import { WhaleTransaction } from '../types/index';
import { subscriptionService } from '../services/subscriptionService';
import { safeFetchJson } from '../utils/api';
import { PricingModal } from '../components/PricingModal';
import {
  Fish,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Coins,
  ShieldCheck,
  Zap,
  Filter,
  RefreshCw,
  ExternalLink,
  Lock,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

const MOCK_WHALE_TXS: WhaleTransaction[] = [
  {
    id: 'w-101',
    tokenSymbol: 'FBAY',
    tokenName: 'Flash Bay Protocol',
    type: 'Accumulation',
    amountToken: 25000,
    amountSda: 1212500,
    usdValue: 2425000,
    fromAddress: '0x9a8f...312e (DEX Pool)',
    toAddress: '0x12c4...89ab (Whale #4)',
    walletTag: 'Whale Wallet',
    timestamp: '2 mins ago',
    txHash: '0xfa9128...c341'
  },
  {
    id: 'w-102',
    tokenSymbol: 'WPX',
    tokenName: 'Widpnix',
    type: 'Accumulation',
    amountToken: 40000,
    amountSda: 594000,
    usdValue: 1188000,
    fromAddress: '0x334a...90bb',
    toAddress: '0x77bc...11de (Institutional)',
    walletTag: 'Institutional Fund',
    timestamp: '7 mins ago',
    txHash: '0xbb2984...e812'
  },
  {
    id: 'w-103',
    tokenSymbol: 'GLNS',
    tokenName: 'Global Network Sidra',
    type: 'LP Injection',
    amountToken: 150000,
    amountSda: 450000,
    usdValue: 900000,
    fromAddress: '0x55aa...21ee',
    toAddress: '0x0000...pool (GLNS-SDA LP)',
    walletTag: 'DEX Liquidity Pool',
    timestamp: '14 mins ago',
    txHash: '0xdd1109...a452'
  },
  {
    id: 'w-104',
    tokenSymbol: 'SDA',
    tokenName: 'Sidra Native Coin',
    type: 'Whale Transfer',
    amountToken: 500000,
    amountSda: 500000,
    usdValue: 1000000,
    fromAddress: '0x9812...cafe (Treasury)',
    toAddress: '0x44fa...7788 (Staking Node)',
    walletTag: 'Early Investor',
    timestamp: '22 mins ago',
    txHash: '0xee9912...b990'
  },
  {
    id: 'w-105',
    tokenSymbol: 'GPC',
    tokenName: 'Gold Protocol Coin',
    type: 'Large Sale',
    amountToken: 12000,
    amountSda: 144000,
    usdValue: 288000,
    fromAddress: '0x66bb...88aa (Top 10)',
    toAddress: '0x9a8f...312e (DEX Pool)',
    walletTag: 'Smart Trader',
    timestamp: '35 mins ago',
    txHash: '0x119933...ff01'
  },
  {
    id: 'w-106',
    tokenSymbol: 'RIDEX',
    tokenName: 'Ride Express Token',
    type: 'Accumulation',
    amountToken: 80000,
    amountSda: 320000,
    usdValue: 640000,
    fromAddress: '0x4422...99ee',
    toAddress: '0x8899...00ff (Whale #12)',
    walletTag: 'Whale Wallet',
    timestamp: '49 mins ago',
    txHash: '0xaa7766...5544'
  }
];

export const WhaleTrackerPage: React.FC = () => {
  const [isElite, setIsElite] = useState(subscriptionService.isElite());
  const [whaleTxs, setWhaleTxs] = useState<WhaleTransaction[]>(MOCK_WHALE_TXS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [minUsd, setMinUsd] = useState<number>(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscriptionService.subscribe((sub) => {
      setIsElite(sub.plan === 'elite');
    });
  }, []);

  const filteredTxs = whaleTxs.filter((tx) => {
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    if (minUsd > 0 && tx.usdValue < minUsd) return false;
    return true;
  });

  const getTypeStyle = (type: WhaleTransaction['type']) => {
    switch (type) {
      case 'Accumulation':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Large Sale':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'LP Injection':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Fish className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Outfit']">
              Whale Tracker & Large Flows
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-300 mt-1">
            Monitor real-time institutional accumulations, large wallet sales, and DEX liquidity pool injections.
          </p>
        </div>

        {/* Upgrade / Status CTA */}
        <div>
          {isElite ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Elite Real-Time Stream Active</span>
            </span>
          ) : (
            <button
              onClick={() => setPricingOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Unlock Live Whale Feed</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Volume KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase">24h Whale Volume</p>
          <p className="text-xl font-extrabold text-white font-mono mt-1">$6.44M USD</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.2% vs yesterday</span>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase">Largest Single Buy</p>
          <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">$2.42M (FBAY)</p>
          <span className="text-[10px] text-gray-400">By Whale Wallet #4</span>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase">Net Whale Flow</p>
          <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">+$4.15M Inflow</p>
          <span className="text-[10px] text-emerald-400">Bullish Accumulation</span>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase">Tracked Big Wallets</p>
          <p className="text-xl font-extrabold text-yellow-400 font-mono mt-1">142 Entities</p>
          <span className="text-[10px] text-gray-400">SidraChain Ecosystem</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-yellow-500" /> Type:
          </span>
          {['ALL', 'Accumulation', 'Large Sale', 'LP Injection', 'Whale Transfer'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterType === type
                  ? 'bg-yellow-500 text-black font-bold'
                  : 'bg-black/40 text-gray-300 hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-semibold">Min USD:</span>
          {[0, 500000, 1000000].map((val) => (
            <button
              key={val}
              onClick={() => setMinUsd(val)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] ${
                minUsd === val
                  ? 'bg-purple-500 text-white font-bold'
                  : 'bg-black/40 text-gray-400 hover:text-white'
              }`}
            >
              {val === 0 ? 'All' : `$${val / 1000}K+`}
            </button>
          ))}
        </div>
      </div>

      {/* Whale Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden relative">
        {!isElite && (
          <div className="p-4 bg-gradient-to-r from-purple-500/20 via-black to-purple-500/20 border-b border-purple-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-gray-200">
                You are viewing a <strong>delayed preview</strong>. Upgrade to <strong>Elite Alpha</strong> for instant sub-second notifications.
              </span>
            </div>
            <button
              onClick={() => setPricingOpen(true)}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg"
            >
              Unlock Elite ($9.99/mo)
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-200">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] font-semibold text-gray-400 uppercase">
                <th className="py-3 px-5">Asset</th>
                <th className="py-3 px-5">Action Type</th>
                <th className="py-3 px-5 text-right font-mono">Amount (Token / SDA)</th>
                <th className="py-3 px-5 text-right font-mono">Value (USD)</th>
                <th className="py-3 px-5">Source Wallet</th>
                <th className="py-3 px-5">Destination</th>
                <th className="py-3 px-5">Entity Tag</th>
                <th className="py-3 px-5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredTxs.map((tx, idx) => (
                <tr key={`${tx.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-5 font-bold font-sans text-sm text-white">
                    <a href={`/token/${tx.tokenSymbol}`} className="hover:text-yellow-400">
                      {tx.tokenSymbol}
                    </a>
                  </td>
                  <td className="py-3.5 px-5 font-sans">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getTypeStyle(tx.type)}`}>
                      {tx.type === 'Accumulation' && <TrendingUp className="w-3 h-3" />}
                      {tx.type === 'Large Sale' && <TrendingDown className="w-3 h-3" />}
                      {tx.type === 'LP Injection' && <Coins className="w-3 h-3" />}
                      {tx.type === 'Whale Transfer' && <ArrowRightLeft className="w-3 h-3" />}
                      <span>{tx.type}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-white">
                    {tx.amountToken.toLocaleString()} {tx.tokenSymbol}
                    <span className="block text-[10px] text-gray-400">({tx.amountSda.toLocaleString()} SDA)</span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-yellow-400">
                    ${(tx.usdValue).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-gray-300 font-sans text-[11px]">
                    {tx.fromAddress}
                  </td>
                  <td className="py-3.5 px-5 text-gray-300 font-sans text-[11px]">
                    {tx.toAddress}
                  </td>
                  <td className="py-3.5 px-5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] text-gray-300">
                      {tx.walletTag}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right text-gray-400 font-sans text-[11px]">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} initialPlan="elite" />
    </div>
  );
};

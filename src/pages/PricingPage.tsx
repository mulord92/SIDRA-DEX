import React, { useState, useEffect } from 'react';
import { subscriptionService, PLAN_PRICING, COMPARISON_FEATURES } from '../services/subscriptionService';
import { UserSubscription, SubscriptionPlan } from '../types/index';
import {
  Zap,
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  Smartphone,
  CreditCard,
  Coins,
  Gift,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [subscription, setSubscription] = useState<UserSubscription>(subscriptionService.getSubscription());
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [justUpgraded, setJustUpgraded] = useState<string | null>(null);

  useEffect(() => {
    return subscriptionService.subscribe((sub) => {
      setSubscription(sub);
    });
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === 'free') {
      subscriptionService.cancelSubscription();
      setJustUpgraded('Downgraded to Free Tier');
    } else {
      subscriptionService.setPlan(plan, billingCycle);
      setJustUpgraded(`Successfully switched to ${plan.toUpperCase()} (${billingCycle})!`);
    }
    setTimeout(() => setJustUpgraded(null), 4000);
  };

  const handleStartTrial = (plan: 'pro' | 'elite') => {
    subscriptionService.startFreeTrial(plan);
    setJustUpgraded(`7-Day Free Trial activated for ${plan.toUpperCase()} Alpha!`);
    setTimeout(() => setJustUpgraded(null), 4000);
  };

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* Title & Slogan */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL MONETIZATION & SUBSCRIPTION TIERS</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white font-['Outfit']">
          Predictable Pricing for High-Conviction Sidra DEX Traders
        </h1>
        <p className="text-xs md:text-sm text-gray-300">
          From basic price watchers to institutional whale trackers, choose the plan that supercharges your decentralized market intelligence.
        </p>

        {/* Current status pill */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
            <span>Your Active Plan:</span>
            <strong className="text-yellow-400 uppercase font-mono">{subscription.plan}</strong>
            {subscription.isTrialActive && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                7-Day Trial ({subscription.trialDaysLeft}d left)
              </span>
            )}
          </span>
        </div>

        {/* Notification Toast */}
        {justUpgraded && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-bounce">
            {justUpgraded}
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <div className="inline-flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-yellow-500 text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-yellow-500 text-black font-extrabold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded-full">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div
          className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between transition-all ${
            subscription.plan === 'free'
              ? 'border-yellow-500/50 ring-2 ring-yellow-500/20 bg-yellow-500/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white font-['Outfit']">Free Plan</h2>
              {subscription.plan === 'free' && (
                <span className="text-[10px] bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full font-bold">
                  Current Tier
                </span>
              )}
            </div>
            <div className="mb-3">
              <span className="text-4xl font-extrabold text-white font-mono">$0</span>
              <span className="text-xs text-gray-400"> / forever</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Basic prices, top gainers/losers, limited charts, and contract verification checks.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Live DEX price feeds (SDA/USD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Top Gainers & Losers Ranking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>1D Standard Chart Views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Smart Alerts (Limited to 1)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Whale Tracker & Flow</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              disabled={subscription.plan === 'free'}
              onClick={() => handleSelectPlan('free')}
              className="w-full py-3 rounded-2xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-bold disabled:opacity-40"
            >
              {subscription.plan === 'free' ? 'Active Free Plan' : 'Select Free Tier'}
            </button>
          </div>
        </div>

        {/* Pro Plan ($4.99/mo or $49.99/yr) */}
        <div
          className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between relative transition-all shadow-xl ${
            subscription.plan === 'pro'
              ? 'border-yellow-500 ring-2 ring-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-black/60'
              : 'border-yellow-500/40 hover:border-yellow-400'
          }`}
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-black" />
            <span>Recommended for Traders</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 mt-1">
              <h2 className="text-lg font-bold text-yellow-400 font-['Outfit']">Pro Trader</h2>
              {subscription.plan === 'pro' && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Active Tier
                </span>
              )}
            </div>
            <div className="mb-3">
              <span className="text-4xl font-extrabold text-white font-mono">
                ${billingCycle === 'monthly' ? '4.99' : '49.99'}
              </span>
              <span className="text-xs text-gray-400">
                {billingCycle === 'monthly' ? ' / month' : ' / year'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              Full interactive charts, watchlists, advanced indicators (SMA, RSI, MACD), and 15 smart alerts.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-gray-200">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full Charts (1D, 7D, 1M, 1Y, ALL)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Custom Watchlists</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Technical Indicators (SMA, RSI, MACD)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>15 Active Smart Volatility Alerts</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ad-Free Clean Experience</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button
              onClick={() => handleSelectPlan('pro')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black text-xs font-black shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{subscription.plan === 'pro' ? 'Pro Plan Active' : 'Subscribe to Pro ($4.99/mo)'}</span>
            </button>

            <button
              onClick={() => handleStartTrial('pro')}
              className="w-full py-1.5 text-[11px] text-yellow-400 hover:underline font-semibold text-center flex items-center justify-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" /> Start 7-Day Free Trial
            </button>
          </div>
        </div>

        {/* Elite Plan ($9.99/mo or $79.99/yr) */}
        <div
          className={`glass-panel rounded-3xl p-6 border flex flex-col justify-between relative transition-all ${
            subscription.plan === 'elite'
              ? 'border-purple-500 ring-2 ring-purple-500/30 bg-gradient-to-b from-purple-500/10 to-black/60'
              : 'border-purple-500/40 hover:border-purple-400'
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Alpha</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 mt-1">
              <h2 className="text-lg font-bold text-purple-400 font-['Outfit']">Elite Alpha</h2>
              {subscription.plan === 'elite' && (
                <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Active Tier
                </span>
              )}
            </div>
            <div className="mb-3">
              <span className="text-4xl font-extrabold text-white font-mono">
                ${billingCycle === 'monthly' ? '9.99' : '79.99'}
              </span>
              <span className="text-xs text-gray-400">
                {billingCycle === 'monthly' ? ' / month' : ' / year'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-6">
              Everything in Pro + Unlimited alerts, live Whale Tracker, Sidra Swap Watch AI intelligence & risk scanner.
            </p>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-gray-200">
              <div className="flex items-center gap-2 font-medium text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Sidra Swap Watch AI Intelligence</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-purple-300">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Real-Time Whale Tracker & Flow</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Token Risk Scorecards (0-100)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Unlimited Real-Time Smart Alerts</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Developer REST API Access</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button
              onClick={() => handleSelectPlan('elite')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{subscription.plan === 'elite' ? 'Elite Alpha Active' : 'Get Elite Alpha ($9.99/mo)'}</span>
            </button>

            <button
              onClick={() => handleStartTrial('elite')}
              className="w-full py-1.5 text-[11px] text-purple-400 hover:underline font-semibold text-center flex items-center justify-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" /> Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
        <h3 className="text-xl font-bold text-white font-['Outfit'] text-center">
          Comprehensive Feature Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-200">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] text-gray-400 uppercase font-semibold">
                <th className="py-3 px-4">Capability / Tool</th>
                <th className="py-3 px-4 text-center">Free ($0)</th>
                <th className="py-3 px-4 text-center text-yellow-400">Pro ($4.99/mo)</th>
                <th className="py-3 px-4 text-center text-purple-400">Elite ($9.99/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARISON_FEATURES.map((feat, idx) => (
                <tr key={idx} className={feat.highlight ? 'bg-yellow-500/5' : 'hover:bg-white/5'}>
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    {feat.highlight && <Sparkles className="w-3.5 h-3.5 text-yellow-500" />}
                    <span>{feat.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof feat.free === 'boolean' ? (
                      feat.free ? <Check className="w-4 h-4 text-yellow-500 mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span className="text-gray-400">{feat.free}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-yellow-400">
                    {typeof feat.pro === 'boolean' ? (
                      feat.pro ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span>{feat.pro}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-purple-400">
                    {typeof feat.elite === 'boolean' ? (
                      feat.elite ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-gray-600">—</span>
                    ) : (
                      <span>{feat.elite}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

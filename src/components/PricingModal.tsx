import React, { useState, useEffect } from 'react';
import { subscriptionService, PLAN_PRICING, COMPARISON_FEATURES } from '../services/subscriptionService';
import { UserSubscription, SubscriptionPlan } from '../types/index';
import {
  Zap,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Coins,
  ArrowRight,
  Gift,
  Star,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: SubscriptionPlan;
}

export const PricingModal: React.FC<Props> = ({ isOpen, onClose, initialPlan = 'pro' }) => {
  const [subscription, setSubscription] = useState<UserSubscription>(subscriptionService.getSubscription());
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan);
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'google_play' | 'credit_card' | 'crypto_sda'>('google_play');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return subscriptionService.subscribe((sub) => {
      setSubscription(sub);
    });
  }, []);

  if (!isOpen) return null;

  const handleStartTrial = (plan: 'pro' | 'elite') => {
    setProcessing(true);
    setTimeout(() => {
      subscriptionService.startFreeTrial(plan);
      setProcessing(false);
      setCheckoutStep('success');
    }, 600);
  };

  const handleCompleteUpgrade = () => {
    setProcessing(true);
    setTimeout(() => {
      subscriptionService.setPlan(selectedPlan, billingCycle);
      setProcessing(false);
      setCheckoutStep('success');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0d121c] border border-yellow-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(242,202,80,0.15)] relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {checkoutStep === 'plans' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FREEMIUM + PRO MONETIZATION TIERS</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-['Outfit']">
                Unlock Institutional Sidra DEX Intelligence
              </h2>
              <p className="text-xs md:text-sm text-gray-300">
                Choose the plan that fits your trading style. Unlock real-time whale alerts, Sidra Swap Watch AI analytics, and unlimited watchlists.
              </p>

              {/* Billing cycle toggle */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="inline-flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-semibold">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-lg transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-yellow-500 text-black font-bold shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      billingCycle === 'annual'
                        ? 'bg-yellow-500 text-black font-bold shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-black text-[10px] font-bold rounded-full">
                      SAVE 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Free Plan */}
              <div
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  subscription.plan === 'free'
                    ? 'bg-white/5 border-yellow-500/40 ring-1 ring-yellow-500/30'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-white font-['Outfit']">Free</h3>
                    {subscription.plan === 'free' && (
                      <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-bold">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-3xl font-extrabold text-white font-mono">$0</span>
                    <span className="text-xs text-gray-400"> / forever</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 min-h-[36px]">
                    Essential prices, top gainers/losers, basic swap calculations, and standard scanner.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span>Live DEX prices & market stats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span>Top 10 Gainers & Losers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      <span>Standard 1D Price Charts</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Smart Volatility Alerts (1 max)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Sidra AI Intelligence</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {subscription.plan === 'free' ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 text-xs font-bold cursor-default"
                    >
                      Active Free Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        subscriptionService.cancelSubscription();
                        setCheckoutStep('success');
                      }}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-semibold"
                    >
                      Downgrade to Free
                    </button>
                  )}
                </div>
              </div>

              {/* Pro Plan ($4.99/mo or $49.99/yr) */}
              <div
                className={`rounded-2xl p-5 border flex flex-col justify-between relative transition-all shadow-lg ${
                  subscription.plan === 'pro'
                    ? 'bg-gradient-to-b from-yellow-500/10 to-black/60 border-yellow-500 ring-2 ring-yellow-500/30'
                    : 'bg-black/50 border-yellow-500/40 hover:border-yellow-400'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black" />
                  <span>Most Popular</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 mt-1">
                    <h3 className="text-base font-bold text-yellow-400 font-['Outfit']">Pro Trader</h3>
                    {subscription.plan === 'pro' && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ${billingCycle === 'monthly' ? '4.99' : '49.99'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {billingCycle === 'monthly' ? ' / month' : ' / year'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-4 min-h-[36px]">
                    Full interactive charts, watchlists, advanced technical indicators, and up to 15 smart alerts.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-gray-200">
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Full Multi-Timeframe Charts (7D, 1M, 1Y, ALL)</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Unlimited Custom Watchlists</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Advanced Indicators (SMA, RSI, MACD)</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>15 Active Smart Volatility Alerts</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ad-Free Clean Experience</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedPlan('pro');
                      setCheckoutStep('checkout');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(242,202,80,0.3)] flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>{subscription.plan === 'pro' ? 'Manage Pro Plan' : 'Subscribe to Pro'}</span>
                  </button>

                  <button
                    onClick={() => handleStartTrial('pro')}
                    className="w-full py-1.5 text-[11px] text-yellow-400 hover:underline font-semibold text-center flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3 h-3" /> Start 7-Day Free Trial
                  </button>
                </div>
              </div>

              {/* Elite Plan ($9.99/mo or $79.99/yr) */}
              <div
                className={`rounded-2xl p-5 border flex flex-col justify-between relative transition-all ${
                  subscription.plan === 'elite'
                    ? 'bg-gradient-to-b from-purple-500/10 to-black/60 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-black/50 border-purple-500/40 hover:border-purple-400'
                }`}
              >
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Alpha Suite</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 mt-1">
                    <h3 className="text-base font-bold text-purple-400 font-['Outfit']">Elite Alpha</h3>
                    {subscription.plan === 'elite' && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ${billingCycle === 'monthly' ? '9.99' : '79.99'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {billingCycle === 'monthly' ? ' / month' : ' / year'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-4 min-h-[36px]">
                    Everything in Pro + Unlimited alerts, live Whale Tracker, Sidra Swap Watch AI intelligence & risk scanner.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-gray-200">
                    <div className="flex items-center gap-2 font-medium text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Sidra Swap Watch AI Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-purple-300">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Live Real-Time Whale Tracker & Flow</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Token Risk Scorecards (0-100 Score)</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Unlimited Real-Time Smart Alerts</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Developer REST API Access</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedPlan('elite');
                      setCheckoutStep('checkout');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{subscription.plan === 'elite' ? 'Manage Elite Plan' : 'Get Elite Alpha'}</span>
                  </button>

                  <button
                    onClick={() => handleStartTrial('elite')}
                    className="w-full py-1.5 text-[11px] text-purple-400 hover:underline font-semibold text-center flex items-center justify-center gap-1"
                  >
                    <Gift className="w-3 h-3" /> Start 7-Day Free Trial
                  </button>
                </div>
              </div>
            </div>

            {/* Google Play & Cross-Platform Banner */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Google Play & Web Synchronized Subscriptions</p>
                  <p className="text-gray-400 text-[11px]">
                    Subscribe on Android or Web with 1-click Google Play In-App Billing or Credit Card. Cancel anytime.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-300 shrink-0 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SSL Encrypted & Verified</span>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === 'checkout' && (
          <div className="max-w-lg mx-auto space-y-6 py-4">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-white font-['Outfit']">
                Complete Your Subscription
              </h3>
              <p className="text-xs text-gray-400">
                Upgrading to <span className="text-yellow-400 font-bold uppercase">{selectedPlan}</span> ({billingCycle})
              </p>
            </div>

            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>Sidra Swap Watch {selectedPlan.toUpperCase()} Plan</span>
                <span className="font-mono text-yellow-400">
                  ${selectedPlan === 'pro' ? (billingCycle === 'monthly' ? '4.99' : '49.99') : (billingCycle === 'monthly' ? '9.99' : '79.99')}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Billing Interval</span>
                <span className="capitalize">{billingCycle} (Billed {billingCycle === 'annual' ? 'yearly' : 'monthly'})</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Free Trial Period</span>
                <span className="text-emerald-400 font-semibold">7-Day Free Trial Included</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-sm font-extrabold text-white">
                <span>Due Today</span>
                <span className="text-emerald-400 font-mono">$0.00 (Then ${selectedPlan === 'pro' ? (billingCycle === 'monthly' ? '4.99' : '49.99') : (billingCycle === 'monthly' ? '9.99' : '79.99')})</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">Choose Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('google_play')}
                  className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'google_play'
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="font-bold">Google Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-bold">Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto_sda')}
                  className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'crypto_sda'
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                      : 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span className="font-bold">SDA Crypto</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('plans')}
                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-xs font-semibold"
              >
                Back to Plans
              </button>
              <button
                type="button"
                onClick={handleCompleteUpgrade}
                disabled={processing}
                className="flex-1 py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-extrabold shadow-[0_0_20px_rgba(242,202,80,0.3)] flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span>Activating Subscription...</span>
                ) : (
                  <>
                    <span>Confirm & Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'success' && (
          <div className="max-w-md mx-auto py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white font-['Outfit']">
                Subscription Active!
              </h3>
              <p className="text-xs text-gray-300">
                You now have full access to <span className="text-yellow-400 font-bold uppercase">{subscription.plan}</span> features across the platform.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-left space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Active Tier:</span>
                <span className="font-bold text-yellow-400 uppercase font-mono">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">{subscription.isTrialActive ? '7-Day Free Trial' : 'Active Subscription'}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="font-mono text-gray-400">{new Date(subscription.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-extrabold shadow-[0_0_15px_rgba(242,202,80,0.2)]"
            >
              Start Exploring Premium Features
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { SubscriptionPlan, UserSubscription, PlanFeature } from '../types/index';

const STORAGE_KEY = 'sidra_swap_watch_subscription';

const DEFAULT_SUB: UserSubscription = {
  plan: 'free',
  billingCycle: 'monthly',
  isTrialActive: false,
  trialDaysLeft: 7,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  paymentMethod: 'Google Play Billing / Web In-App'
};

export const PLAN_PRICING = {
  free: {
    monthly: 0,
    annual: 0,
    title: 'Free',
    tagline: 'Essential price feeds and gainers/losers for casual watchers.',
    badge: 'Standard Access'
  },
  pro: {
    monthly: 4.99,
    annual: 49.99,
    title: 'Pro Trader',
    tagline: 'Full interactive charts, watchlists, advanced technical indicators & smart alerts.',
    badge: 'Popular Choice'
  },
  elite: {
    monthly: 9.99,
    annual: 79.99,
    title: 'Elite Alpha',
    tagline: 'Everything Pro + Unlimited alerts, Whale Tracker, Sidra Swap Watch AI intelligence & risk scanner.',
    badge: 'Institutional Grade'
  }
};

export const COMPARISON_FEATURES: PlanFeature[] = [
  { name: 'Live DEX Real-Time Prices (SDA/USD)', free: true, pro: true, elite: true },
  { name: 'Top Gainers & Losers Ranking', free: true, pro: true, elite: true },
  { name: 'Contract Address Copy & Explorer Links', free: true, pro: true, elite: true },
  { name: 'SDA Swap Calculator & Slippage Depth', free: 'Basic (10 Pairs)', pro: 'All 30+ Pairs', elite: 'Unlimited + Pool Route' },
  { name: 'Interactive Charts & Timeframes', free: '1D Only', pro: 'Full (1D, 7D, 1M, 1Y, ALL)', elite: 'Full (1D, 7D, 1M, 1Y, ALL)' },
  { name: 'Custom Watchlists', free: 'Up to 3 Tokens', pro: 'Unlimited', elite: 'Unlimited + Portfolio Value' },
  { name: 'Smart Alerts (Target, % Volatility)', free: '1 Alert', pro: '15 Active Alerts', elite: 'Unlimited Real-Time Alerts' },
  { name: 'Advanced Market Intelligence (SMA, RSI, MACD)', free: false, pro: true, elite: true },
  { name: 'Buy & Sell Pressure Analytics', free: false, pro: true, elite: true },
  { name: 'Whale Tracker & Large Wallet Flows', free: 'Preview (Delayed)', pro: 'Top 10 Whales', elite: 'Live Real-Time Stream' },
  { name: 'Token Risk Scanner & 0-100 Scorecard', free: 'Basic (Honeypot)', pro: 'Full Scorecard', elite: 'Full Scorecard + Auto-Audit' },
  { name: 'Sidra Swap Watch AI Market Intelligence', free: false, pro: 'Standard Summary', elite: 'Full AI Alpha + Momentum', highlight: true },
  { name: 'Ad-Free Experience', free: false, pro: true, elite: true },
  { name: 'Developer REST API Access', free: false, pro: '1,000 req/mo', elite: '50,000 req/mo' }
];

class SubscriptionService {
  private subscription: UserSubscription;
  private listeners: Array<(sub: UserSubscription) => void> = [];

  constructor() {
    this.subscription = this.loadSubscription();
  }

  private loadSubscription(): UserSubscription {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load stored subscription:', e);
    }
    return { ...DEFAULT_SUB };
  }

  private saveSubscription() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.subscription));
      this.listeners.forEach((listener) => listener(this.subscription));
    } catch (e) {
      console.warn('Failed to save subscription:', e);
    }
  }

  public getSubscription(): UserSubscription {
    return { ...this.subscription };
  }

  public subscribe(listener: (sub: UserSubscription) => void): () => void {
    this.listeners.push(listener);
    listener(this.subscription);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public setPlan(plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual' = 'monthly') {
    this.subscription = {
      ...this.subscription,
      plan,
      billingCycle,
      isTrialActive: false,
      expiresAt: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
    };
    this.saveSubscription();
  }

  public startFreeTrial(targetPlan: 'pro' | 'elite' = 'elite') {
    this.subscription = {
      ...this.subscription,
      plan: targetPlan,
      isTrialActive: true,
      trialDaysLeft: 7,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    this.saveSubscription();
  }

  public cancelSubscription() {
    this.subscription = {
      ...this.subscription,
      plan: 'free',
      isTrialActive: false
    };
    this.saveSubscription();
  }

  public isProOrAbove(): boolean {
    return this.subscription.plan === 'pro' || this.subscription.plan === 'elite';
  }

  public isElite(): boolean {
    return this.subscription.plan === 'elite';
  }

  public canAccessFeature(feature: 'charts' | 'watchlists' | 'alerts' | 'whale_tracker' | 'ai_intelligence' | 'risk_scorecard' | 'api_access'): boolean {
    const plan = this.subscription.plan;
    if (plan === 'elite') return true;
    if (plan === 'pro') {
      return ['charts', 'watchlists', 'alerts', 'ai_intelligence', 'risk_scorecard', 'api_access'].includes(feature);
    }
    // Free tier
    return false;
  }
}

export const subscriptionService = new SubscriptionService();
